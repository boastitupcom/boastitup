import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

console.log('Final Gemini API Test\n');
console.log('═══════════════════════════════════════\n');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const modelsToTry = [
    'gemini-1.5-flash-latest',
    'gemini-1.5-pro-latest',
    'gemini-1.5-flash',
    'gemini-1.5-pro',
    'gemini-pro'
];

for (const modelName of modelsToTry) {
    console.log(`Testing: ${modelName}...`);
    try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent('Say hello in one word');
        const text = result.response.text();

        console.log(`✓ SUCCESS with "${modelName}"`);
        console.log(`Response: ${text}\n`);
        console.log('═══════════════════════════════════════');
        console.log(`\n✅ Use this model name: ${modelName}\n`);
        break;
    } catch (error) {
        const errorMsg = error.message || error.toString();
        if (errorMsg.includes('API_KEY_INVALID')) {
            console.log(`✗ API key is invalid or not activated`);
            console.log(`\nℹ️  Steps to fix:`);
            console.log(`1. Go to: https://aistudio.google.com/apikey`);
            console.log(`2. Create a new API key`);
            console.log(`3. Make sure "Generative Language API" is enabled`);
            console.log(`4. Update .env file with new key\n`);
            break;
        } else if (errorMsg.includes('404') || errorMsg.includes('not found')) {
            console.log(`✗ Model not available`);
        } else {
            console.log(`✗ Error: ${errorMsg.substring(0, 100)}`);
        }
    }
}

console.log('═══════════════════════════════════════\n');
