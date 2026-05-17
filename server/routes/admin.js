const express = require('express');
const db = require('../database');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();

router.use(requireAuth, requireRole('admin'));

router.get('/users', async (_req, res) => {
  try {
    res.json(await db.getAdminUsers());
  } catch {
    res.status(500).json({ error: 'Erreur récupération utilisateurs' });
  }
});

router.get('/metrics', async (_req, res) => {
  try {
    res.json(await db.getMetrics());
  } catch {
    res.status(500).json({ error: 'Erreur récupération métriques' });
  }
});

router.put('/users/:userId/role', async (req, res) => {
  try {
    const { role } = req.body;
    if (!['user', 'coach', 'admin'].includes(role)) {
      return res.status(400).json({ error: 'Rôle invalide' });
    }
    if (parseInt(req.params.userId, 10) === req.user.id) {
      return res.status(400).json({ error: 'Vous ne pouvez pas modifier votre propre rôle.' });
    }
    res.json(await db.updateUserRole(req.params.userId, role));
  } catch {
    res.status(500).json({ error: 'Erreur mise à jour rôle' });
  }
});

router.post('/users', async (req, res) => {
  try {
    const { firstName, lastName, contact, password, pseudo, role } = req.body;
    if (!firstName || !lastName || !contact || !password || !pseudo || !role) {
      return res.status(400).json({ error: 'Tous les champs sont requis' });
    }
    if (!['user', 'coach', 'admin'].includes(role)) {
      return res.status(400).json({ error: 'Rôle invalide' });
    }
    const user = await db.createUserWithRole(firstName, lastName, contact, password, pseudo, role);
    res.json(user);
  } catch (error) {
    if (error.code === '23505') {
      return res.status(400).json({ error: 'Ce pseudo ou contact existe déjà' });
    }
    res.status(500).json({ error: 'Erreur création utilisateur' });
  }
});

router.get('/reported-posts', async (_req, res) => {
  try {
    res.json(await db.getReportedPosts());
  } catch {
    res.status(500).json({ error: 'Erreur posts signalés' });
  }
});

router.post('/posts/:postId/approve', async (req, res) => {
  try {
    await db.approvePost(req.params.postId);
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: 'Erreur approbation' });
  }
});

router.delete('/posts/:postId', async (req, res) => {
  try {
    await db.deletePost(req.params.postId);
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: 'Erreur suppression' });
  }
});

module.exports = router;
