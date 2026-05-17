const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'change-me-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

const signToken = (user) =>
  jwt.sign(
    { id: user.id, role: user.role, pseudo: user.pseudo },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );

const verifyToken = (token) => jwt.verify(token, JWT_SECRET);

const publicUser = (row) => ({
  id: row.id,
  first_name: row.first_name,
  last_name: row.last_name,
  pseudo: row.pseudo,
  role: row.role,
  avatar: row.avatar ?? null,
});

module.exports = { signToken, verifyToken, publicUser, JWT_SECRET };
