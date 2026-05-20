const express = require('express');
const db = require('../database');
const { requireAuth } = require('../middleware/auth');
const { getPublicKey, isPushEnabled } = require('../lib/pushService');

const router = express.Router();

router.get('/vapid-public-key', (_req, res) => {
  const publicKey = getPublicKey();
  if (!publicKey) {
    return res.status(503).json({ error: 'Web Push non configuré sur le serveur.' });
  }
  res.json({ publicKey });
});

router.post('/subscribe', requireAuth, async (req, res) => {
  try {
    if (!isPushEnabled()) {
      return res.status(503).json({ error: 'Web Push non configuré.' });
    }
    const { endpoint, keys } = req.body;
    if (!endpoint || !keys?.p256dh || !keys?.auth) {
      return res.status(400).json({ error: 'Abonnement push invalide.' });
    }
    await db.savePushSubscription(req.user.id, {
      endpoint,
      p256dh: keys.p256dh,
      auth: keys.auth,
      userAgent: req.headers['user-agent'] || null,
    });
    res.json({ success: true });
  } catch (err) {
    console.error('[Push] subscribe error:', err);
    res.status(500).json({ error: "Erreur lors de l'abonnement push." });
  }
});

router.delete('/subscribe', requireAuth, async (req, res) => {
  try {
    const { endpoint } = req.body;
    if (!endpoint) {
      return res.status(400).json({ error: 'endpoint requis.' });
    }
    await db.deletePushSubscription(endpoint, req.user.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Erreur lors du désabonnement.' });
  }
});

module.exports = router;
