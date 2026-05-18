const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const postsRoutes = require('./routes/posts');
const { messagesRouter, usersRouter } = require('./routes/messages');
const adminRoutes = require('./routes/admin');
const quoteRoutes = require('./routes/quote');
const chatRoutes = require('./routes/chat');
const contactRoutes = require('./routes/contact');
const analyticsRoutes = require('./routes/analytics');
const { pool } = require('./database');

const app = express();
const port = process.env.PORT || 5001;

const allowedOrigins = (process.env.CORS_ORIGINS || 'http://localhost:5173,http://127.0.0.1:5173,https://annonyme.pro,https://www.annonyme.pro')
  .split(',')
  .map((o) => o.trim());

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Origine non autorisée'));
    }
  },
  credentials: true,
}));
app.use(express.json({ limit: '1mb' }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/health', async (_req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  } catch {
    res.status(503).json({ status: 'error' });
  }
});

app.use('/api', authRoutes);
app.use('/api/posts', postsRoutes);
app.use('/api/messages', messagesRouter);
app.use('/api/users', usersRouter);
app.use('/api/admin', adminRoutes);
app.use('/api/quote', quoteRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/analytics', analyticsRoutes);

app.use((err, _req, res, _next) => {
  if (err.message === 'Origine non autorisée') {
    return res.status(403).json({ error: err.message });
  }
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ error: 'Fichier trop volumineux (max 5 Mo).' });
  }
  console.error(err);
  res.status(500).json({ error: 'Erreur serveur.' });
});

if (require.main === module) {
  const bindHost = process.env.NODE_ENV === 'production' ? '0.0.0.0' : '127.0.0.1';
  app.listen(port, bindHost, () => {
    console.log(`Serveur démarré sur http://${bindHost}:${port}`);
  });
}

module.exports = app;
