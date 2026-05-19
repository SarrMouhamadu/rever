const express = require('express');
const db = require('../database');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// Get friendship status with another user
router.get('/status/:otherId', requireAuth, async (req, res) => {
  try {
    const otherId = parseInt(req.params.otherId, 10);
    if (!otherId) return res.status(400).json({ error: 'Identifiant invalide.' });
    const friendship = await db.getFriendshipStatus(req.user.id, otherId);
    res.json(friendship);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur lors de la récupération du statut de relation.' });
  }
});

// Send friend request
router.post('/request', requireAuth, async (req, res) => {
  try {
    const { receiverId } = req.body;
    if (!receiverId) return res.status(400).json({ error: 'Destinataire requis.' });
    if (req.user.id === parseInt(receiverId, 10)) {
      return res.status(400).json({ error: 'Vous ne pouvez pas vous ajouter en ami.' });
    }
    const result = await db.sendFriendRequest(req.user.id, parseInt(receiverId, 10));
    res.json({ success: true, relation: result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur lors de l\'envoi de la demande d\'ami.' });
  }
});

// Accept friend request
router.post('/accept', requireAuth, async (req, res) => {
  try {
    const { senderId } = req.body;
    if (!senderId) return res.status(400).json({ error: 'Expéditeur requis.' });
    const result = await db.acceptFriendRequest(req.user.id, parseInt(senderId, 10));
    if (!result) {
      return res.status(400).json({ error: 'Aucune demande d\'ami en attente trouvée.' });
    }
    res.json({ success: true, relation: result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur lors de l\'acceptation de la demande d\'ami.' });
  }
});

// Decline friend request or remove friend
router.post('/decline', requireAuth, async (req, res) => {
  try {
    const { otherId } = req.body;
    if (!otherId) return res.status(400).json({ error: 'Utilisateur requis.' });
    await db.declineFriendRequestOrRemoveFriend(req.user.id, parseInt(otherId, 10));
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur lors du traitement de l\'action.' });
  }
});

module.exports = router;
