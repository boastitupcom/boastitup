import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const modelNames = [
    'gemini-pro',
    'gemini-1.5-pro',
    'gemini-1.5-flash',
    'gemini-1.0-pro',
    'models/gemini-pro',
    'models/gemini-1.5-flash'
];

console.log('Testing different Gemini model names...\n');

for (const modelName of modelNames) {
    console.log(`Testing: ${modelName}`);
    try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent('Say hello in one word');
        const text = result.response.text();
        console.log(`✓ SUCCESS with ${modelName}: ${text}\n`);
        break;
    } catch (error) {
        console.log(`✗ Failed: ${error.message.substring(0, 80)}...\n`);
    }
}
