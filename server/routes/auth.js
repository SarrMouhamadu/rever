const express = require('express');
const db = require('../database');
const { signToken } = require('../lib/auth');
const { requireAuth } = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimit');

const router = express.Router();

router.post('/register', authLimiter, async (req, res) => {
  try {
    const { firstName, lastName, contact, password, pseudo } = req.body;
    if (!firstName || !lastName || !contact || !password || !pseudo) {
      return res.status(400).json({ error: 'Tous les champs sont requis.' });
    }
    if (password.length < 8) {
      return res.status(400).json({ error: 'Le mot de passe doit contenir au moins 8 caractères.' });
    }
    const user = await db.registerUser(firstName, lastName, contact, password, pseudo);
    const token = signToken(user);
    res.json({ user, token });
  } catch (error) {
    if (error.code === '23505') {
      return res.status(400).json({ error: 'Ce pseudo ou contact existe déjà.' });
    }
    res.status(500).json({ error: "Erreur lors de l'inscription." });
  }
});

router.post('/login', authLimiter, async (req, res) => {
  try {
    const { login, password } = req.body;
    if (!login || !password) {
      return res.status(400).json({ error: 'Identifiant et mot de passe requis.' });
    }
    const user = await db.loginUser(login, password);
    if (!user) {
      return res.status(401).json({ error: 'Identifiants incorrects.' });
    }
    res.json({ user, token: signToken(user) });
  } catch {
    res.status(500).json({ error: 'Erreur de connexion.' });
  }
});

router.get('/me', requireAuth, async (req, res) => {
  const user = await db.getUserById(req.user.id);
  if (!user) return res.status(404).json({ error: 'Utilisateur introuvable.' });
  res.json(user);
});

router.delete('/me', requireAuth, async (req, res) => {
  await db.deleteUserAccount(req.user.id);
  res.json({ success: true });
});

router.get('/me/export', requireAuth, async (req, res) => {
  const data = await db.exportUserData(req.user.id);
  res.json(data);
});

module.exports = router;
