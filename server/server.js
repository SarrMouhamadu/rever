const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const { chatWithAI } = require('./geminiService');
const { 
  registerUser, loginUser, createPost, likePost, addComment, getFeed, 
  getAdminUsers, getMessages, sendMessage, getOtherUser, updateAvatar, getUserById, getMetrics, updateUserRole, createUserWithRole, getCoaches, getConversations, getCoachesWithUnread, getUnreadCount, markMessagesAsRead
} = require('./database');

const app = express();
const port = 5001; 

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only images are allowed!'), false);
    }
  }
});

// --- ROUTES AUTHENTIFICATION ---

app.post('/api/register', async (req, res) => {
  try {
    const { firstName, lastName, contact, password, pseudo } = req.body;
    if (!firstName || !lastName || !contact || !password || !pseudo) {
      return res.status(400).json({ error: "Tous les champs sont requis." });
    }
    const user = await registerUser(firstName, lastName, contact, password, pseudo);
    res.json(user);
  } catch (error) {
    if (error.message.includes('UNIQUE')) {
      res.status(400).json({ error: "Ce pseudo ou contact existe déjà." });
    } else {
      res.status(500).json({ error: "Erreur lors de l'inscription." });
    }
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { login, password } = req.body;
    if (!login || !password) return res.status(400).json({ error: "Identifiant et mot de passe requis." });
    const user = await loginUser(login, password);
    if (!user) {
      return res.status(401).json({ error: "Identifiants incorrects." });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: "Erreur de connexion." });
  }
});

// --- ROUTES FEED (PUBLICATIONS) ---

app.get('/api/posts', async (req, res) => {
  try {
    const feed = await getFeed();
    res.json(feed);
  } catch (error) {
    res.status(500).json({ error: "Erreur lors de la récupération du feed" });
  }
});

app.post('/api/posts', upload.single('image'), async (req, res) => {
  try {
    const { userId, text } = req.body;
    const imageUrl = req.file ? `http://localhost:5001/uploads/${req.file.filename}` : null;
    await createPost(userId, text, imageUrl);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Erreur lors de la création" });
  }
});

app.post('/api/posts/:id/like', async (req, res) => {
  try {
    await likePost(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Erreur lors du like" });
  }
});

app.post('/api/posts/:id/comment', async (req, res) => {
  try {
    const { userId, text } = req.body;
    await addComment(req.params.id, userId, text);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Erreur lors de l'ajout du commentaire" });
  }
});

// --- ROUTE CHATBOT (IA) ---

app.post('/api/chat', async (req, res) => {
  try {
    const { message, history } = req.body;
    const aiResponse = await chatWithAI(message, history);
    res.json(aiResponse);
  } catch (error) {
    res.status(500).json({ error: "Erreur Chat IA" });
  }
});

// --- ROUTES CHAT COACH (HUMAIN) ---

app.get('/api/users/:userId/conversations', async (req, res) => {
  try {
    const data = await getConversations(req.params.userId);
    res.json(data);
  } catch (err) { res.status(500).json({ error: "Erreur" }); }
});

app.get('/api/users/:userId/coaches', async (req, res) => {
  try {
    const data = await getCoachesWithUnread(req.params.userId);
    res.json(data);
  } catch (err) { res.status(500).json({ error: "Erreur" }); }
});

app.get('/api/users/:userId/unread', async (req, res) => {
  try {
    const count = await getUnreadCount(req.params.userId);
    res.json({ count });
  } catch (err) { res.status(500).json({ error: "Erreur" }); }
});

app.post('/api/messages/read', async (req, res) => {
  try {
    const { senderId, receiverId } = req.body;
    await markMessagesAsRead(senderId, receiverId);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: "Erreur" }); }
});

app.get('/api/messages/:userId1/:userId2', async (req, res) => {
  try {
    const messages = await getMessages(req.params.userId1, req.params.userId2);
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: "Erreur récupération messages." });
  }
});

app.post('/api/messages', async (req, res) => {
  try {
    const { senderId, receiverId, text } = req.body;
    await sendMessage(senderId, receiverId, text);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Erreur envoi message." });
  }
});

// --- ROUTES ADMIN ---

app.get('/api/admin/users', async (req, res) => {
  try {
    const stats = await getAdminUsers();
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: "Erreur lors de la récupération des utilisateurs" });
  }
});

app.get('/api/admin/metrics', async (req, res) => {
  try {
    const metrics = await getMetrics();
    res.json(metrics);
  } catch (error) {
    res.status(500).json({ error: "Erreur lors de la récupération des métriques" });
  }
});

app.put('/api/admin/users/:userId/role', async (req, res) => {
  try {
    const { role } = req.body;
    if (!role || !['user', 'coach', 'admin'].includes(role)) {
      return res.status(400).json({ error: "Rôle invalide" });
    }
    const updatedUser = await updateUserRole(req.params.userId, role);
    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ error: "Erreur lors de la mise à jour du rôle" });
  }
});

app.post('/api/admin/users', async (req, res) => {
  try {
    const { firstName, lastName, contact, password, pseudo, role } = req.body;
    if (!firstName || !lastName || !contact || !password || !pseudo || !role) {
      return res.status(400).json({ error: "Tous les champs sont requis" });
    }
    if (!['user', 'coach', 'admin'].includes(role)) {
      return res.status(400).json({ error: "Rôle invalide" });
    }
    const user = await createUserWithRole(firstName, lastName, contact, password, pseudo, role);
    res.json(user);
  } catch (error) {
    if (error.message.includes('UNIQUE')) {
      res.status(400).json({ error: "Ce pseudo ou contact existe déjà" });
    } else {
      res.status(500).json({ error: "Erreur lors de la création de l'utilisateur" });
    }
  }
});

// Nouvelle route pour récupérer les informations d'un utilisateur
app.get('/api/users/:userId', async (req, res) => {
  try {
    const user = await getOtherUser(req.params.userId);
    if (!user) {
      return res.status(404).json({ error: "Utilisateur non trouvé" });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: "Erreur lors de la récupération de l'utilisateur" });
  }
});

app.get('/api/users/by-id/:userId', async (req, res) => {
  try {
    const user = await getUserById(req.params.userId);
    if (!user) {
      return res.status(404).json({ error: "Utilisateur non trouvé" });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: "Erreur lors de la récupération de l'utilisateur" });
  }
});

app.put('/api/users/:userId/avatar', async (req, res) => {
  try {
    const { avatarUrl } = req.body;
    if (!avatarUrl) {
      return res.status(400).json({ error: "URL de l'avatar requis" });
    }
    const updatedUser = await updateAvatar(req.params.userId, avatarUrl);
    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ error: "Erreur lors de la mise à jour de l'avatar" });
  }
});

app.listen(port, '0.0.0.0', () => console.log(`Serveur démarré sur http://0.0.0.0:${port}`));
