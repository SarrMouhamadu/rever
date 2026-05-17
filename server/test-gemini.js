const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

console.log('=== Test API Gemini ===');
console.log('API Key:', process.env.GEMINI_API_KEY.substring(0, 10) + '...');

const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

async function test() {
  try {
    console.log('\n1. Création du modèle gemini-2.0-flash...');
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    
    console.log('\n2. Test du modèle...');
    const result = await model.generateContent('Bonjour, tu peux me dire bonjour ?');
    const response = await result.response;
    const text = response.text();
    console.log('✅ Réponse:', text);
    
    console.log('\n3. Test avec historique...');
    const chat = model.startChat({
      history: [
        {
          role: 'user',
          parts: [{ text: 'Je traverse des périodes vraiment difficiles' }],
        },
      ],
    });
    
    const result2 = await chat.sendMessage('Peux-tu m\'aider ?');
    const response2 = await result2.response;
    console.log('✅ Réponse avec historique:', response2.text());
    
    console.log('\n=== Test terminé avec succès ===');
  } catch (error) {
    console.error('\n❌ Erreur:', error.message);
    if (error.response) {
      console.error('Response:', error.response);
    }
  }
}

test();
