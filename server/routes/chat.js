const express = require('express');
const { chatWithAI } = require('../geminiService');
const { requireAuth } = require('../middleware/auth');
const { chatLimiter } = require('../middleware/rateLimit');

const router = express.Router();

router.post('/', requireAuth, chatLimiter, async (req, res) => {
  try {
    const { message, history } = req.body;
    if (!message?.trim()) {
      return res.status(400).json({ error: 'Message requis.' });
    }
    const aiResponse = await chatWithAI(message, history || []);
    res.json(aiResponse);
  } catch {
    res.status(500).json({ error: 'Erreur Chat IA' });
  }
});

module.exports = router;
