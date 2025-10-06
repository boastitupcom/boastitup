import { GoogleGenerativeAI } from '@google/generative-ai';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
const genAI = new GoogleGenerativeAI('AIzaSyDOv-ClPxN6ofcFbo4cPS3AzU3voMiaBus');
const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

async function testReport() {
  const productId = 'ba55c9ce-34ff-4b1f-a3d0-a8242dae93e2'; // Nitra Whey

  console.log('Fetching reviews...');
  const { data: reviews, error } = await supabase
    .from('product_reviews')
    .select('*')
    .eq('product_id', productId);

  if (error) {
    console.error('Error:', error);
    return;
  }

  console.log(`Found ${reviews.length} reviews`);

  if (reviews.length === 0) {
    console.log('No reviews found for this product');
    return;
  }

  const reviewTexts = reviews.slice(0, 5).map((r, i) =>
    `Review ${i + 1} (${r.rating}/5): ${r.review_text}`
  ).join('\n\n');

  console.log('\nGenerating report with Gemini 2.0 Flash Exp...\n');

  const prompt = `Analyze these product reviews and generate a customer sentiment report:

${reviewTexts}

Format as Amazon-style customer report with:
- Overall sentiment summary (1-2 sentences)
- Top 2-3 themes mentioned
- Brief snippets from reviews`;

  const result = await model.generateContent(prompt);
  const report = result.response.text();

  console.log('--- REPORT ---\n');
  console.log(report);
  console.log('\n--- END ---\n');
  console.log('✅ Report generated successfully!');
}

testReport().catch(console.error);
