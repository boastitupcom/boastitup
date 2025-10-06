import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

console.log('Testing Gemini API...\n');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

const reviewText = "This product is amazing! Very comfortable and great quality. Worth the money!";

console.log('Review:', reviewText);
console.log('\nAnalyzing with Gemini...\n');

const prompt = `Analyze this review and return ONLY valid JSON:
"${reviewText}"

Return:
{"sentiment": "positive", "confidence_score": 0.95, "key_themes": ["comfort", "quality", "value"], "tags": ["comfortable", "quality"], "categories": ["comfort", "quality"]}`;

try {
    const result = await model.generateContent(prompt);
    const response = result.response.text();
    console.log('Gemini Response:', response);

    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
        const analysis = JSON.parse(jsonMatch[0]);
        console.log('\n✓ Parsed Analysis:');
        console.log(JSON.stringify(analysis, null, 2));
    }
} catch (error) {
    console.error('✗ Error:', error.message);
}
