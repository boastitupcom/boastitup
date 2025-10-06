import { GoogleGenerativeAI } from '@google/generative-ai';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

console.log('Testing single review analysis...\n');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-lite' });

// Step 1: Get one review
console.log('1. Fetching one review...');
const { data: reviews, error: fetchError } = await supabase
    .from('product_reviews')
    .select('*')
    .is('ai_sentiment', null)
    .limit(1);

if (fetchError) {
    console.error('Error:', fetchError);
    process.exit(1);
}

if (!reviews || reviews.length === 0) {
    console.log('No unprocessed reviews found');
    process.exit(0);
}

const review = reviews[0];
console.log(`✓ Found review: Rating ${review.rating}/5`);
console.log(`  Text: "${review.review_text.substring(0, 100)}..."\n`);

// Step 2: Analyze with Gemini
console.log('2. Analyzing with Gemini...');
const prompt = `Analyze this review and return ONLY valid JSON:
"${review.review_text}"

Format:
{"sentiment": "positive", "confidence_score": 0.95, "key_themes": ["quality"], "tags": ["good"], "categories": ["quality"]}`;

try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    console.log('✓ Gemini response received\n');

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    const analysis = JSON.parse(jsonMatch[0]);

    console.log('3. Analysis result:');
    console.log(`   Sentiment: ${analysis.sentiment}`);
    console.log(`   Confidence: ${analysis.confidence_score}`);
    console.log(`   Themes: ${analysis.key_themes.join(', ')}\n`);

    // Step 3: Update database
    console.log('4. Updating database...');
    const { error: updateError } = await supabase
        .from('product_reviews')
        .update({
            ai_sentiment: analysis.sentiment,
            confidence_score: analysis.confidence_score,
            key_themes: analysis.key_themes,
            ai_tags: analysis.tags,
            ai_categories: analysis.categories,
            processed_at: new Date().toISOString()
        })
        .eq('id', review.id);

    if (updateError) {
        console.error('Update error:', updateError);
    } else {
        console.log('✓ Database updated!\n');
        console.log('✅ Test successful! Run "npm run analyze" to process all 13 reviews.');
    }

} catch (error) {
    console.error('Error:', error.message);
}
