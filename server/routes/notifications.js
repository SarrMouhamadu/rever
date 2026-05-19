const express = require('express');
const { verifyToken } = require('../lib/auth');
const { addClient, removeClient } = require('../lib/notificationHub');

const router = express.Router();

router.get('/subscribe', (req, res) => {
  const token = req.query.token;
  if (!token) {
    return res.status(401).json({ error: 'Token manquant.' });
  }

  let user;
  try {
    user = verifyToken(token);
  } catch (err) {
    return res.status(401).json({ error: 'Session invalide ou expirée.' });
  }

  // Set headers for Server-Sent Events
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'X-Accel-Buffering': 'no' // Prevent Nginx proxy buffering
  });

  // Register client
  addClient(user.id, res);
  console.log(`[SSE] Utilisateur ${user.pseudo} (ID: ${user.id}) connecté aux notifications.`);

  // Remove client on connection closed
  req.on('close', () => {
    removeClient(user.id, res);
    console.log(`[SSE] Connexion notifications fermée pour l'utilisateur ${user.pseudo} (ID: ${user.id}).`);
  });
});

module.exports = router;
