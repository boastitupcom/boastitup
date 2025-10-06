import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

console.log('Listing available Gemini models...\n');

try {
    const models = await genAI.listModels();
    console.log('Available models:');
    for await (const model of models) {
        console.log(`- ${model.name}`);
    }
} catch (error) {
    console.error('Error:', error.message);
    console.log('\nAPI Key might be invalid or expired.');
    console.log('Get a new one at: https://makersuite.google.com/app/apikey');
}
