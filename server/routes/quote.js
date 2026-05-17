const express = require('express');
const db = require('../database');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();

router.get('/', async (_req, res) => {
  try {
    const text = await db.getLatestQuote();
    res.json({ text });
  } catch {
    res.status(500).json({ error: 'Erreur citation' });
  }
});

router.post('/', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    const { text } = req.body;
    if (!text?.trim()) {
      return res.status(400).json({ error: 'Texte requis.' });
    }
    await db.createQuote(text);
    res.json({ success: true, text });
  } catch {
    res.status(500).json({ error: 'Erreur mise à jour citation' });
  }
});

module.exports = router;
