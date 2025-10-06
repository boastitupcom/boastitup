import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

console.log('Testing Gemini 2.x Models (2025)\n');
console.log('═══════════════════════════════════════\n');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Current stable models for free tier
const modelsToTry = [
    'gemini-2.0-flash-lite',
    'gemini-2.0-flash',
    'gemini-2.5-flash-lite',
    'gemini-2.5-flash'
];

for (const modelName of modelsToTry) {
    console.log(`Testing: ${modelName}...`);
    try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent('Say "Hello" in one word');
        const text = result.response.text();

        console.log(`✓ SUCCESS!`);
        console.log(`Model: ${modelName}`);
        console.log(`Response: ${text}\n`);
        console.log('═══════════════════════════════════════');
        console.log(`\n✅ Working model found: ${modelName}\n`);

        // Test with actual review analysis
        console.log('Testing review analysis...\n');
        const reviewPrompt = `Analyze this review and return ONLY valid JSON:
"Amazing product! Very comfortable and great quality."

Return format:
{"sentiment": "positive", "confidence_score": 0.95, "key_themes": ["comfort", "quality"], "tags": ["comfortable", "quality"], "categories": ["comfort", "quality"]}`;

        const analysisResult = await model.generateContent(reviewPrompt);
        const analysisText = analysisResult.response.text();
        console.log('Analysis Response:', analysisText);

        break;
    } catch (error) {
        console.log(`✗ Failed: ${error.message.substring(0, 100)}...\n`);
    }
}

console.log('\n═══════════════════════════════════════\n');
