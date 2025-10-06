import { GoogleGenerativeAI } from '@google/generative-ai';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-lite' });

console.log('\n🤖 Processing All Reviews\n');
console.log('═══════════════════════════════════════\n');

async function analyzeSentiment(reviewText) {
    const prompt = `Analyze this review and return ONLY valid JSON:
"${reviewText}"

Format:
{"sentiment": "positive|negative|neutral", "confidence_score": 0.95, "key_themes": ["quality", "value"], "tags": ["good quality"], "categories": ["quality", "value_for_money"]}`;

    try {
        const result = await model.generateContent(prompt);
        const text = result.response.text();
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        const analysis = JSON.parse(jsonMatch[0]);
        return {
            sentiment: analysis.sentiment || 'neutral',
            confidence_score: analysis.confidence_score || 0.5,
            key_themes: analysis.key_themes || [],
            tags: analysis.tags || [],
            categories: analysis.categories || []
        };
    } catch (error) {
        console.log(`   ⚠️  Analysis error: ${error.message}`);
        return null;
    }
}

// Main processing
const { data: reviews } = await supabase
    .from('product_reviews')
    .select('*')
    .is('ai_sentiment', null);

if (!reviews || reviews.length === 0) {
    console.log('✅ All reviews already analyzed!\n');
    process.exit(0);
}

console.log(`Found ${reviews.length} unprocessed reviews\n`);

let processed = 0;
let failed = 0;

for (let i = 0; i < reviews.length; i++) {
    const review = reviews[i];
    console.log(`[${i + 1}/${reviews.length}] Processing review...`);
    console.log(`   Rating: ${review.rating}/5`);
    console.log(`   Text: "${review.review_text.substring(0, 60)}..."`);

    const analysis = await analyzeSentiment(review.review_text);

    if (analysis) {
        const { error } = await supabase
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

        if (!error) {
            console.log(`   ✓ ${analysis.sentiment} (${(analysis.confidence_score * 100).toFixed(0)}% confident)`);
            processed++;
        } else {
            console.log(`   ✗ Update failed`);
            failed++;
        }
    } else {
        failed++;
    }

    // Rate limit: 5 requests/minute = 12 seconds between requests
    if (i < reviews.length - 1) {
        console.log(`   ⏳ Waiting 12 seconds (rate limit)...\n`);
        await new Promise(resolve => setTimeout(resolve, 12000));
    }
}

console.log('\n═══════════════════════════════════════');
console.log(`✅ Complete! Processed: ${processed} | Failed: ${failed}`);
console.log('═══════════════════════════════════════\n');
