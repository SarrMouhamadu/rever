const express = require('express');
const db = require('../database');
const { contactLimiter } = require('../middleware/rateLimit');

const router = express.Router();

router.post('/', contactLimiter, async (req, res) => {
  try {
    const { name, email, message } = req.body;
    if (!name?.trim() || !email?.trim() || !message?.trim()) {
      return res.status(400).json({ error: 'Tous les champs sont requis.' });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Email invalide.' });
    }
    await db.saveContactMessage(name.trim(), email.trim(), message.trim());
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: 'Erreur lors de l\'envoi.' });
  }
});

module.exports = router;
