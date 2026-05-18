const { Pool } = require('pg');
const { hashPassword, verifyPassword, isBcryptHash } = require('./lib/password');
const { publicUser } = require('./lib/auth');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://localhost:5432/rever',
  ssl: process.env.DATABASE_SSL === 'true'
    ? { rejectUnauthorized: process.env.DATABASE_SSL_REJECT_UNAUTHORIZED !== 'false' }
    : false,
});

const query = (text, params) => pool.query(text, params);

const initDb = async () => {
  try {
    await query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        first_name VARCHAR(255) NOT NULL,
        last_name VARCHAR(255) NOT NULL,
        contact VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        pseudo VARCHAR(255) UNIQUE NOT NULL,
        role VARCHAR(50) DEFAULT 'user',
        avatar TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar TEXT`);

    await query(`
      CREATE TABLE IF NOT EXISTS posts (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        text TEXT NOT NULL,
        image_url TEXT,
        likes INTEGER DEFAULT 0,
        is_reported BOOLEAN DEFAULT FALSE,
        reports_count INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await query(`ALTER TABLE posts ADD COLUMN IF NOT EXISTS is_anonymous BOOLEAN DEFAULT TRUE`);

    await query(`
      CREATE TABLE IF NOT EXISTS post_likes (
        post_id INTEGER REFERENCES posts(id) ON DELETE CASCADE,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (post_id, user_id)
      )
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS comments (
        id SERIAL PRIMARY KEY,
        post_id INTEGER REFERENCES posts(id) ON DELETE CASCADE,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        text TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS messages (
        id SERIAL PRIMARY KEY,
        sender_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        receiver_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        text TEXT NOT NULL,
        is_read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await query(`ALTER TABLE messages ADD COLUMN IF NOT EXISTS is_read BOOLEAN DEFAULT FALSE`);

    await query(`
      CREATE TABLE IF NOT EXISTS quotes (
        id SERIAL PRIMARY KEY,
        text TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS contact_messages (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await query(`CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at DESC)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_comments_post_id ON comments(post_id)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_messages_receiver ON messages(receiver_id, is_read)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_messages_pair ON messages(sender_id, receiver_id)`);

    const adminPassword = process.env.ADMIN_INITIAL_PASSWORD || 'ChangeMeAdmin2026!';
    const adminHash = await hashPassword(adminPassword);
    await query(
      `INSERT INTO users (first_name, last_name, contact, password, pseudo, role)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (contact) DO UPDATE SET password = EXCLUDED.password, role = 'admin'`,
      ['Coach', 'Admin', 'admin', adminHash, 'admin', 'admin']
    );

    if (process.env.NODE_ENV !== 'production') {
      console.log('[dev] Compte admin : contact "admin" — définir ADMIN_INITIAL_PASSWORD en production.');
    }

    const quoteCount = await query('SELECT COUNT(*)::int AS count FROM quotes');
    if (quoteCount.rows[0].count === 0) {
      await query(
        `INSERT INTO quotes (text) VALUES ($1)`,
        ['Le premier pas vers le bien-être est d’oser exprimer ce que l’on ressent. Vous êtes au bon endroit.']
      );
    }

    await migratePlainPasswords();
    console.log('Base de données initialisée avec succès');
  } catch (error) {
    console.error('Erreur lors de l\'initialisation de la base de données:', error);
  }
};

const migratePlainPasswords = async () => {
  const { rows } = await query(`SELECT id, password FROM users WHERE password NOT LIKE '$2%'`);
  for (const row of rows) {
    const hashed = await hashPassword(row.password);
    await query('UPDATE users SET password = $1 WHERE id = $2', [hashed, row.id]);
  }
};

const registerUser = async (firstName, lastName, contact, password, pseudo) => {
  const hashed = await hashPassword(password);
  const { rows } = await query(
    `INSERT INTO users (first_name, last_name, contact, password, pseudo)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, first_name, last_name, pseudo, role, avatar`,
    [firstName, lastName, contact, hashed, pseudo]
  );
  return publicUser(rows[0]);
};

const loginUser = async (loginIdentifier, password) => {
  const { rows } = await query(
    `SELECT id, first_name, last_name, pseudo, role, avatar, password
     FROM users WHERE contact = $1 OR pseudo = $1`,
    [loginIdentifier]
  );
  const user = rows[0];
  if (!user || !(await verifyPassword(password, user.password))) {
    return null;
  }
  if (!isBcryptHash(user.password)) {
    const hashed = await hashPassword(password);
    await query('UPDATE users SET password = $1 WHERE id = $2', [hashed, user.id]);
  }
  return publicUser(user);
};

const createPost = async (userId, text, imageUrl, isAnonymous = true) => {
  const { rows } = await query(
    `INSERT INTO posts (user_id, text, image_url, is_anonymous) VALUES ($1, $2, $3, $4) RETURNING id`,
    [userId, text, imageUrl, isAnonymous]
  );
  return { id: rows[0].id };
};

const likePost = async (postId, userId) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const inserted = await client.query(
      `INSERT INTO post_likes (post_id, user_id) VALUES ($1, $2)
       ON CONFLICT DO NOTHING RETURNING post_id`,
      [postId, userId]
    );
    if (inserted.rowCount > 0) {
      await client.query(`UPDATE posts SET likes = likes + 1 WHERE id = $1`, [postId]);
    }
    await client.query('COMMIT');
    const { rows } = await query(
      `SELECT p.likes,
              EXISTS(SELECT 1 FROM post_likes pl WHERE pl.post_id = p.id AND pl.user_id = $2) AS liked_by_me
       FROM posts p WHERE p.id = $1`,
      [postId, userId]
    );
    return rows[0] || { likes: 0, liked_by_me: false };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

const addComment = async (postId, userId, text) => {
  const { rows } = await query(
    `INSERT INTO comments (post_id, user_id, text) VALUES ($1, $2, $3)
     RETURNING id, post_id, user_id, text, created_at`,
    [postId, userId, text]
  );
  const comment = rows[0];
  const userRow = await query('SELECT pseudo FROM users WHERE id = $1', [userId]);
  return { ...comment, username: userRow.rows[0].pseudo };
};

const getFeed = async (userId, limit = 20, offset = 0) => {
  const { rows: posts } = await query(
    `SELECT p.id, p.user_id, p.text, p.image_url, p.likes, p.created_at,
            p.is_reported, p.reports_count, p.is_anonymous,
            CASE WHEN p.is_anonymous = TRUE THEN 'Anonyme' ELSE u.pseudo END AS username,
            CASE WHEN p.is_anonymous = TRUE THEN NULL ELSE u.avatar END AS user_avatar,
            EXISTS(SELECT 1 FROM post_likes pl WHERE pl.post_id = p.id AND pl.user_id = $3) AS liked_by_me
     FROM posts p
     JOIN users u ON p.user_id = u.id
     ORDER BY p.created_at DESC
     LIMIT $1 OFFSET $2`,
    [limit, offset, userId]
  );

  if (posts.length === 0) {
    return { posts: [], hasMore: false };
  }

  const postIds = posts.map((p) => p.id);
  const { rows: comments } = await query(
    `SELECT c.id, c.post_id, c.user_id, c.text, c.created_at, u.pseudo AS username
     FROM comments c
     JOIN users u ON c.user_id = u.id
     WHERE c.post_id = ANY($1::int[])
     ORDER BY c.created_at ASC`,
    [postIds]
  );

  const commentsByPost = {};
  for (const c of comments) {
    if (!commentsByPost[c.post_id]) commentsByPost[c.post_id] = [];
    commentsByPost[c.post_id].push(c);
  }

  const enriched = posts.map((p) => ({
    ...p,
    liked_by_me: p.liked_by_me,
    comments: commentsByPost[p.id] || [],
  }));

  const { rows: countRows } = await query(`SELECT COUNT(*)::int AS total FROM posts`);
  const total = countRows[0].total;

  return {
    posts: enriched,
    hasMore: offset + limit < total,
    total,
  };
};

const getMessages = async (userId1, userId2, limit = 50, offset = 0) => {
  const { rows } = await query(
    `SELECT m.*,
            u1.pseudo AS sender_pseudo,
            u2.pseudo AS receiver_pseudo
     FROM messages m
     JOIN users u1 ON m.sender_id = u1.id
     JOIN users u2 ON m.receiver_id = u2.id
     WHERE (m.sender_id = $1 AND m.receiver_id = $2)
        OR (m.sender_id = $2 AND m.receiver_id = $1)
     ORDER BY m.created_at ASC
     LIMIT $3 OFFSET $4`,
    [userId1, userId2, limit, offset]
  );
  return rows;
};

const getOtherUser = async (userId) => {
  const { rows } = await query(
    `SELECT id, first_name, last_name, pseudo, role, avatar FROM users WHERE id = $1`,
    [userId]
  );
  return rows[0];
};

const sendMessage = async (senderId, receiverId, text) => {
  const { rows } = await query(
    `INSERT INTO messages (sender_id, receiver_id, text) VALUES ($1, $2, $3) RETURNING id`,
    [senderId, receiverId, text]
  );
  return { id: rows[0].id };
};

const getConversations = async (userId) => {
  const { rows } = await query(
    `SELECT u.id, u.first_name, u.last_name, u.pseudo, u.role, u.avatar,
            (SELECT COUNT(*)::int FROM messages
             WHERE sender_id = u.id AND receiver_id = $1 AND is_read = FALSE) AS unread_count
     FROM users u
     WHERE u.id IN (
       SELECT sender_id FROM messages WHERE receiver_id = $1
       UNION
       SELECT receiver_id FROM messages WHERE sender_id = $1
     )`,
    [userId]
  );
  return rows;
};

const getCoachesWithUnread = async (userId) => {
  const { rows } = await query(
    `SELECT u.id, u.first_name, u.last_name, u.pseudo, u.role, u.avatar,
            (SELECT COUNT(*)::int FROM messages
             WHERE sender_id = u.id AND receiver_id = $1 AND is_read = FALSE) AS unread_count
     FROM users u
     WHERE u.role = 'coach' AND u.id != $1`,
    [userId]
  );
  return rows;
};

const getUnreadCount = async (userId) => {
  const { rows } = await query(
    `SELECT COUNT(*)::int AS count FROM messages WHERE receiver_id = $1 AND is_read = FALSE`,
    [userId]
  );
  return rows[0].count;
};

const markMessagesAsRead = async (senderId, receiverId) => {
  await query(
    `UPDATE messages SET is_read = TRUE
     WHERE sender_id = $1 AND receiver_id = $2 AND is_read = FALSE`,
    [senderId, receiverId]
  );
};

const getAdminUsers = async () => {
  const { rows } = await query(
    `SELECT u.id, u.first_name, u.last_name, u.contact, u.pseudo, u.avatar, u.role, u.created_at,
            COUNT(p.id)::int AS post_count
     FROM users u
     LEFT JOIN posts p ON u.id = p.user_id
     WHERE u.role != 'admin'
     GROUP BY u.id
     ORDER BY u.created_at DESC`
  );
  return rows;
};

const updateAvatar = async (userId, avatarUrl) => {
  const { rows } = await query(
    `UPDATE users SET avatar = $1 WHERE id = $2
     RETURNING id, first_name, last_name, pseudo, role, avatar`,
    [avatarUrl, userId]
  );
  return publicUser(rows[0]);
};

const getUserById = async (userId) => {
  const { rows } = await query(
    `SELECT id, first_name, last_name, pseudo, role, avatar FROM users WHERE id = $1`,
    [userId]
  );
  return rows[0] ? publicUser(rows[0]) : null;
};

const updateUserRole = async (userId, role) => {
  const { rows } = await query(
    `UPDATE users SET role = $1 WHERE id = $2
     RETURNING id, first_name, last_name, pseudo, role, avatar`,
    [role, userId]
  );
  return publicUser(rows[0]);
};

const createUserWithRole = async (firstName, lastName, contact, password, pseudo, role) => {
  const hashed = await hashPassword(password);
  const { rows } = await query(
    `INSERT INTO users (first_name, last_name, contact, password, pseudo, role)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id, first_name, last_name, pseudo, role, avatar`,
    [firstName, lastName, contact, hashed, pseudo, role]
  );
  return publicUser(rows[0]);
};

const getMetrics = async () => {
  const [usersResult, postsResult, commentsResult, messagesResult, usersByRoleResult] =
    await Promise.all([
      query('SELECT COUNT(*)::int AS total FROM users'),
      query('SELECT COUNT(*)::int AS total FROM posts'),
      query('SELECT COUNT(*)::int AS total FROM comments'),
      query('SELECT COUNT(*)::int AS total FROM messages'),
      query('SELECT role, COUNT(*)::int AS count FROM users GROUP BY role'),
    ]);

  const usersByRole = { user: 0, coach: 0, admin: 0 };
  usersByRoleResult.rows.forEach((row) => {
    usersByRole[row.role] = row.count;
  });

  return {
    totalUsers: usersResult.rows[0].total,
    totalPosts: postsResult.rows[0].total,
    totalComments: commentsResult.rows[0].total,
    totalMessages: messagesResult.rows[0].total,
    usersByRole,
  };
};

const reportPost = async (postId) => {
  await query(
    `UPDATE posts SET is_reported = TRUE, reports_count = reports_count + 1 WHERE id = $1`,
    [postId]
  );
};

const getReportedPosts = async () => {
  const { rows } = await query(
    `SELECT p.*, u.pseudo AS username
     FROM posts p
     JOIN users u ON p.user_id = u.id
     WHERE p.is_reported = TRUE
     ORDER BY p.reports_count DESC`
  );
  return rows;
};

const approvePost = async (postId) => {
  await query(`UPDATE posts SET is_reported = FALSE, reports_count = 0 WHERE id = $1`, [postId]);
};

const deletePost = async (postId) => {
  await query(`DELETE FROM post_likes WHERE post_id = $1`, [postId]);
  await query(`DELETE FROM comments WHERE post_id = $1`, [postId]);
  await query(`DELETE FROM posts WHERE id = $1`, [postId]);
};

const getLatestQuote = async () => {
  const { rows } = await query('SELECT text FROM quotes ORDER BY created_at DESC LIMIT 1');
  return rows[0]?.text ||
    'Le premier pas vers le bien-être est d’oser exprimer ce que l’on ressent. Vous êtes au bon endroit.';
};

const createQuote = async (text) => {
  const { rows } = await query('INSERT INTO quotes (text) VALUES ($1) RETURNING id', [text]);
  return rows[0];
};

const getPostById = async (postId) => {
  const { rows } = await query('SELECT * FROM posts WHERE id = $1', [postId]);
  return rows[0];
};

const updatePost = async (postId, text) => {
  await query('UPDATE posts SET text = $1 WHERE id = $2', [text, postId]);
};

const saveContactMessage = async (name, email, message) => {
  await query(
    `INSERT INTO contact_messages (name, email, message) VALUES ($1, $2, $3)`,
    [name, email, message]
  );
};

const deleteUserAccount = async (userId) => {
  await query('DELETE FROM users WHERE id = $1', [userId]);
};

const exportUserData = async (userId) => {
  const [user, posts, comments, sent, received] = await Promise.all([
    query(
      `SELECT id, first_name, last_name, contact, pseudo, role, created_at FROM users WHERE id = $1`,
      [userId]
    ),
    query('SELECT id, text, image_url, likes, created_at FROM posts WHERE user_id = $1', [userId]),
    query(
      `SELECT c.id, c.text, c.created_at, c.post_id FROM comments c WHERE c.user_id = $1`,
      [userId]
    ),
    query(
      `SELECT id, receiver_id, text, created_at FROM messages WHERE sender_id = $1`,
      [userId]
    ),
    query(
      `SELECT id, sender_id, text, created_at FROM messages WHERE receiver_id = $1`,
      [userId]
    ),
  ]);

  return {
    profile: user.rows[0],
    posts: posts.rows,
    comments: comments.rows,
    messagesSent: sent.rows,
    messagesReceived: received.rows,
    exportedAt: new Date().toISOString(),
  };
};

initDb();

module.exports = {
  pool,
  query,
  registerUser,
  loginUser,
  createPost,
  likePost,
  addComment,
  getFeed,
  getAdminUsers,
  getMessages,
  sendMessage,
  getOtherUser,
  updateAvatar,
  getUserById,
  getMetrics,
  updateUserRole,
  createUserWithRole,
  getConversations,
  getCoachesWithUnread,
  getUnreadCount,
  markMessagesAsRead,
  reportPost,
  getReportedPosts,
  approvePost,
  deletePost,
  getLatestQuote,
  createQuote,
  getPostById,
  updatePost,
  saveContactMessage,
  deleteUserAccount,
  exportUserData,
};
