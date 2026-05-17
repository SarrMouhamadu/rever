const { verifyToken } = require('../lib/auth');

const requireAuth = (req, res, next) => {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentification requise.' });
  }
  try {
    req.user = verifyToken(header.slice(7));
    next();
  } catch {
    return res.status(401).json({ error: 'Session invalide ou expirée.' });
  }
};

const requireRole = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return res.status(403).json({ error: 'Accès refusé.' });
  }
  next();
};

const requireSelf = (paramName = 'userId') => (req, res, next) => {
  const targetId = parseInt(req.params[paramName], 10);
  if (req.user.role === 'admin' || req.user.id === targetId) {
    return next();
  }
  return res.status(403).json({ error: 'Action non autorisée.' });
};

module.exports = { requireAuth, requireRole, requireSelf };
