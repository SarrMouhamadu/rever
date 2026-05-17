const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

async function chatWithAI(userMessage, history = []) {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const formattedHistory = history.map(msg => ({
      role: msg.role === 'ai' ? 'model' : 'user',
      parts: [{ text: msg.text }],
    }));

    const chat = model.startChat({
      history: formattedHistory,
    });

    let prompt = userMessage;
    if (history.length === 0) {
      prompt = `Tu es "Coach IA", une IA bienveillante, à l'écoute et rassurante. 
Réponds de manière empathique, concise et chaleureuse. Tu es là pour écouter et soutenir les gens qui traversent des moments difficiles.

Message de l'utilisateur : ${userMessage}`;
    }

    const result = await chat.sendMessage(prompt);
    
    return { text: result.response.text() };
  } catch (error) {
    console.error("Erreur Gemini Chat :", error);
    return { text: "Je suis là pour t'écouter. Peux-tu m'en dire plus sur ce que tu traverses ?" };
  }
}

module.exports = { chatWithAI };
