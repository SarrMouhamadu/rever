const rateLimit = require('express-rate-limit');

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: { error: 'Trop de tentatives. Réessayez plus tard.' },
});

const chatLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  message: { error: 'Limite de messages IA atteinte.' },
});

const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 50,
  message: { error: 'Limite d’uploads atteinte.' },
});

const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  message: { error: 'Trop de messages de contact.' },
});

module.exports = { authLimiter, chatLimiter, uploadLimiter, contactLimiter };
