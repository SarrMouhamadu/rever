const express = require('express');
const { verifyToken } = require('../lib/auth');
const { requireAuth } = require('../middleware/auth');
const { addClient, removeClient } = require('../lib/notificationHub');
const db = require('../database');

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

router.get('/', requireAuth, async (req, res) => {
  try {
    const notifications = await db.getUserNotifications(req.user.id);
    res.json(notifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

router.put('/:id/read', requireAuth, async (req, res) => {
  try {
    await db.markNotificationAsRead(req.params.id, req.user.id);
    res.json({ success: true });
  } catch (error) {
    console.error('Error marking notification read:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

router.put('/read-all', requireAuth, async (req, res) => {
  try {
    await db.markAllNotificationsAsRead(req.user.id);
    res.json({ success: true });
  } catch (error) {
    console.error('Error marking all read:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;
