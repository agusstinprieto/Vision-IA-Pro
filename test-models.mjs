import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI('AIzaSyCoqNRFXAi6eokkBgrB9YXaJ9D3Wn-RT20');

async function listModels() {
    try {
        const models = await genAI.listModels();
        console.log('Available models:');
        for await (const model of models) {
            console.log(`- ${model.name}`);
            console.log(`  Supported methods: ${model.supportedGenerationMethods?.join(', ')}`);
        }
    } catch (error) {
        console.error('Error listing models:', error);
    }
}

listModels();
