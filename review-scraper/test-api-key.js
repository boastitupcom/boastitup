import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

console.log('Testing Gemini API Key...\n');
console.log('API Key:', process.env.GEMINI_API_KEY);
console.log('');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    console.log('Attempting to generate content...\n');

    const result = await model.generateContent('Say hello');
    const text = result.response.text();

    console.log('✓ SUCCESS!');
    console.log('Response:', text);
} catch (error) {
    console.log('✗ FULL ERROR:');
    console.log(error);
}
