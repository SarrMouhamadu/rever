const express = require('express');
const db = require('../database');
const { requireAuth, requireSelf } = require('../middleware/auth');

const router = express.Router();

router.get('/:userId1/:userId2', requireAuth, async (req, res) => {
  try {
    const uid1 = parseInt(req.params.userId1, 10);
    const uid2 = parseInt(req.params.userId2, 10);
    if (req.user.id !== uid1 && req.user.id !== uid2 && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Accès refusé.' });
    }
    const limit = Math.min(parseInt(req.query.limit, 10) || 50, 100);
    const offset = parseInt(req.query.offset, 10) || 0;
    const messages = await db.getMessages(uid1, uid2, limit, offset);
    res.json(messages);
  } catch {
    res.status(500).json({ error: 'Erreur récupération messages.' });
  }
});

router.post('/', requireAuth, async (req, res) => {
  try {
    const { receiverId, text } = req.body;
    if (!receiverId || !text?.trim()) {
      return res.status(400).json({ error: 'Destinataire et message requis.' });
    }
    await db.sendMessage(req.user.id, receiverId, text);
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: 'Erreur envoi message.' });
  }
});

router.post('/read', requireAuth, async (req, res) => {
  try {
    const { senderId } = req.body;
    if (!senderId) return res.status(400).json({ error: 'senderId requis.' });
    await db.markMessagesAsRead(senderId, req.user.id);
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: 'Erreur' });
  }
});

const usersRouter = express.Router();

usersRouter.get('/:userId/conversations', requireAuth, requireSelf('userId'), async (req, res) => {
  try {
    const data = await db.getConversations(req.params.userId);
    res.json(data);
  } catch {
    res.status(500).json({ error: 'Erreur' });
  }
});

usersRouter.get('/:userId/coaches', requireAuth, requireSelf('userId'), async (req, res) => {
  try {
    const data = await db.getCoachesWithUnread(req.params.userId);
    res.json(data);
  } catch {
    res.status(500).json({ error: 'Erreur' });
  }
});

usersRouter.get('/:userId/unread', requireAuth, requireSelf('userId'), async (req, res) => {
  try {
    const count = await db.getUnreadCount(req.params.userId);
    res.json({ count });
  } catch {
    res.status(500).json({ error: 'Erreur' });
  }
});

usersRouter.get('/:userId', requireAuth, async (req, res) => {
  try {
    const user = await db.getOtherUser(req.params.userId);
    if (!user) return res.status(404).json({ error: 'Utilisateur non trouvé' });
    res.json(user);
  } catch {
    res.status(500).json({ error: 'Erreur' });
  }
});

usersRouter.get('/by-id/:userId', requireAuth, async (req, res) => {
  try {
    const user = await db.getUserById(req.params.userId);
    if (!user) return res.status(404).json({ error: 'Utilisateur non trouvé' });
    res.json(user);
  } catch {
    res.status(500).json({ error: 'Erreur' });
  }
});

usersRouter.put('/:userId/avatar', requireAuth, requireSelf('userId'), async (req, res) => {
  try {
    const { avatarUrl } = req.body;
    if (!avatarUrl) return res.status(400).json({ error: "URL de l'avatar requis" });
    const updated = await db.updateAvatar(req.params.userId, avatarUrl);
    res.json(updated);
  } catch {
    res.status(500).json({ error: 'Erreur' });
  }
});

module.exports = { messagesRouter: router, usersRouter };
