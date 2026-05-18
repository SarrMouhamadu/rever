const express = require('express');
const db = require('../database');

const router = express.Router();

router.post('/ping', async (req, res) => {
  try {
    const { visitorId, isHeartbeat } = req.body;
    if (!visitorId || typeof visitorId !== 'string') {
      return res.status(400).json({ error: 'visitorId est requis.' });
    }
    await db.recordVisitor(visitorId, !!isHeartbeat);
    res.json({ success: true });
  } catch (err) {
    console.error('Error tracking visitor:', err);
    res.status(500).json({ error: 'Erreur lors du suivi.' });
  }
});

module.exports = router;
