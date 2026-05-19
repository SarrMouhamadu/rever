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

    await query(`ALTER TABLE posts ADD COLUMN IF NOT EXISTS is_anonymous BOOLEAN DEFAULT FALSE`);
    await query(`UPDATE posts SET is_anonymous = FALSE WHERE created_at < '2026-05-18 09:00:00'`);
    await query(`ALTER TABLE posts ADD COLUMN IF NOT EXISTS report_reasons TEXT`);

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
    await query(`ALTER TABLE messages ADD COLUMN IF NOT EXISTS is_anonymous BOOLEAN DEFAULT FALSE`);
    await query(`ALTER TABLE messages ADD COLUMN IF NOT EXISTS post_id INTEGER REFERENCES posts(id) ON DELETE SET NULL`);

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

    await query(`
      CREATE TABLE IF NOT EXISTS visitors (
        id SERIAL PRIMARY KEY,
        visitor_id VARCHAR(100) UNIQUE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_active TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        duration_seconds INTEGER DEFAULT 0
      )
    `);

    await query(`ALTER TABLE visitors ADD COLUMN IF NOT EXISTS duration_seconds INTEGER DEFAULT 0`);

    await query(`
      CREATE TABLE IF NOT EXISTS friends (
        id SERIAL PRIMARY KEY,
        user_id_1 INTEGER REFERENCES users(id) ON DELETE CASCADE,
        user_id_2 INTEGER REFERENCES users(id) ON DELETE CASCADE,
        status VARCHAR(50) DEFAULT 'pending',
        sender_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id_1, user_id_2)
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
  
  const postRow = await query('SELECT user_id, is_anonymous FROM posts WHERE id = $1', [postId]);
  const userRow = await query('SELECT pseudo, first_name, last_name FROM users WHERE id = $1', [userId]);
  
  const isPostAuthor = postRow.rows[0].user_id === userId;
  const isAnonymousPost = postRow.rows[0].is_anonymous;
  
  let username = userRow.rows[0].pseudo;
  if (isPostAuthor) {
    if (isAnonymousPost) {
      username = 'Anonyme (Auteur)';
    } else {
      const initials = (userRow.rows[0].first_name.charAt(0) + userRow.rows[0].last_name.charAt(0)).toUpperCase();
      username = `${initials} (Auteur)`;
    }
  }
  
  return { ...comment, username };
};

const deleteComment = async (commentId, userId) => {
  // Only the author of the comment (or an admin) can delete it
  const { rowCount } = await query(
    `DELETE FROM comments WHERE id = $1 AND (user_id = $2 OR EXISTS (SELECT 1 FROM users WHERE id = $2 AND role = 'admin'))`,
    [commentId, userId]
  );
  return rowCount > 0;
};

const getFeed = async (userId, limit = 20, offset = 0) => {
  const { rows: posts } = await query(
    `SELECT p.id, p.user_id, p.text, p.image_url, p.likes, p.created_at,
            p.is_reported, p.reports_count, p.is_anonymous,
            CASE 
              WHEN p.is_anonymous = TRUE THEN 'Anonyme' 
              WHEN p.user_id = $3 THEN u.pseudo 
              ELSE UPPER(LEFT(u.first_name, 1) || LEFT(u.last_name, 1)) 
            END AS username,
            CASE 
              WHEN p.is_anonymous = TRUE THEN NULL 
              WHEN p.user_id = $3 THEN u.avatar 
              ELSE NULL 
            END AS user_avatar,
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
    `SELECT c.id, c.post_id, c.user_id, c.text, c.created_at, 
            CASE 
              WHEN p.is_anonymous = TRUE AND c.user_id = p.user_id THEN 'Anonyme (Auteur)'
              WHEN p.is_anonymous = FALSE AND c.user_id = p.user_id THEN UPPER(LEFT(u.first_name, 1) || LEFT(u.last_name, 1)) || ' (Auteur)'
              ELSE u.pseudo 
            END AS username
     FROM comments c
     JOIN users u ON c.user_id = u.id
     JOIN posts p ON c.post_id = p.id
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

const getMessages = async (userId1, userId2, postId = null, limit = 50, offset = 0) => {
  let queryText;
  let params;
  if (postId) {
    queryText = `
      SELECT m.*,
             CASE 
               WHEN m.is_anonymous = TRUE THEN 'Anonyme' 
               WHEN u1.role = 'user' THEN UPPER(LEFT(u1.first_name, 1) || LEFT(u1.last_name, 1))
               ELSE u1.pseudo 
             END AS sender_pseudo,
             CASE 
               WHEN m.is_anonymous = TRUE THEN 'Anonyme' 
               WHEN u2.role = 'user' THEN UPPER(LEFT(u2.first_name, 1) || LEFT(u2.last_name, 1))
               ELSE u2.pseudo 
             END AS receiver_pseudo
      FROM messages m
      JOIN users u1 ON m.sender_id = u1.id
      JOIN users u2 ON m.receiver_id = u2.id
      WHERE ((m.sender_id = $1 AND m.receiver_id = $2) OR (m.sender_id = $2 AND m.receiver_id = $1))
        AND m.post_id = $3 AND m.is_anonymous = TRUE
      ORDER BY m.created_at ASC
      LIMIT $4 OFFSET $5`;
    params = [userId1, userId2, postId, limit, offset];
  } else {
    queryText = `
      SELECT m.*,
             CASE WHEN u1.role = 'user' THEN UPPER(LEFT(u1.first_name, 1) || LEFT(u1.last_name, 1)) ELSE u1.pseudo END AS sender_pseudo,
             CASE WHEN u2.role = 'user' THEN UPPER(LEFT(u2.first_name, 1) || LEFT(u2.last_name, 1)) ELSE u2.pseudo END AS receiver_pseudo
      FROM messages m
      JOIN users u1 ON m.sender_id = u1.id
      JOIN users u2 ON m.receiver_id = u2.id
      WHERE ((m.sender_id = $1 AND m.receiver_id = $2) OR (m.sender_id = $2 AND m.receiver_id = $1))
        AND m.is_anonymous = FALSE
      ORDER BY m.created_at ASC
      LIMIT $3 OFFSET $4`;
    params = [userId1, userId2, limit, offset];
  }
  const { rows } = await query(queryText, params);
  return rows;
};

const getOtherUser = async (userId) => {
  const { rows } = await query(
    `SELECT id, 
            CASE WHEN role = 'user' THEN UPPER(LEFT(first_name, 1)) ELSE first_name END AS first_name,
            CASE WHEN role = 'user' THEN UPPER(LEFT(last_name, 1)) ELSE last_name END AS last_name,
            CASE WHEN role = 'user' THEN UPPER(LEFT(first_name, 1) || LEFT(last_name, 1)) ELSE pseudo END AS pseudo,
            role, 
            CASE WHEN role = 'user' THEN NULL ELSE avatar END AS avatar 
     FROM users WHERE id = $1`,
    [userId]
  );
  return rows[0];
};

const sendMessage = async (senderId, receiverId, text, isAnonymous = false, postId = null) => {
  const { rows } = await query(
    `INSERT INTO messages (sender_id, receiver_id, text, is_anonymous, post_id) 
     VALUES ($1, $2, $3, $4, $5) RETURNING id`,
    [senderId, receiverId, text, isAnonymous, postId]
  );
  return { id: rows[0].id };
};

const getConversations = async (userId) => {
  const { rows } = await query(
    `SELECT DISTINCT ON (u.id, is_anonymous, post_id)
           u.id AS id,
           CASE WHEN u.role = 'user' THEN UPPER(LEFT(u.first_name, 1)) ELSE u.first_name END AS first_name,
           CASE WHEN u.role = 'user' THEN UPPER(LEFT(u.last_name, 1)) ELSE u.last_name END AS last_name,
           CASE WHEN u.role = 'user' THEN UPPER(LEFT(u.first_name, 1) || LEFT(u.last_name, 1)) ELSE u.pseudo END AS pseudo,
           u.role AS role,
           CASE WHEN u.role = 'user' THEN NULL ELSE u.avatar END AS avatar,
           FALSE AS is_anonymous,
           NULL::integer AS post_id,
           (SELECT COUNT(*)::int FROM messages
            WHERE sender_id = u.id AND receiver_id = $1 AND is_read = FALSE AND is_anonymous = FALSE) AS unread_count,
           (SELECT EXISTS (
              SELECT 1 FROM friends 
              WHERE (user_id_1 = LEAST(u.id, $1) AND user_id_2 = GREATEST(u.id, $1) AND status = 'accepted')
           )) AS is_friend,
           (SELECT status FROM friends 
            WHERE (user_id_1 = LEAST(u.id, $1) AND user_id_2 = GREATEST(u.id, $1))) AS friendship_status,
           (SELECT sender_id FROM friends 
            WHERE (user_id_1 = LEAST(u.id, $1) AND user_id_2 = GREATEST(u.id, $1))) AS friendship_sender_id,
           MAX(m.created_at) AS last_message_time
    FROM users u
    JOIN messages m ON (m.sender_id = u.id AND m.receiver_id = $1) OR (m.sender_id = $1 AND m.receiver_id = u.id)
    WHERE m.is_anonymous = FALSE
    GROUP BY u.id
    
    UNION ALL
    
    SELECT DISTINCT ON (u.id, is_anonymous, post_id)
           u.id AS id,
           'Anonyme' AS first_name,
           'Anonyme' AS last_name,
           CASE WHEN p.user_id = u.id THEN 'Auteur Anonyme' ELSE 'Lecteur Anonyme' END AS pseudo,
           'user' AS role,
           NULL AS avatar,
           TRUE AS is_anonymous,
           m.post_id AS post_id,
           (SELECT COUNT(*)::int FROM messages
            WHERE sender_id = u.id AND receiver_id = $1 AND is_read = FALSE AND is_anonymous = TRUE AND post_id = m.post_id) AS unread_count,
           FALSE AS is_friend,
           NULL::varchar AS friendship_status,
           NULL::integer AS friendship_sender_id,
           MAX(m.created_at) AS last_message_time
    FROM users u
    JOIN messages m ON (m.sender_id = u.id AND m.receiver_id = $1) OR (m.sender_id = $1 AND m.receiver_id = u.id)
    JOIN posts p ON m.post_id = p.id
    WHERE m.is_anonymous = TRUE
    GROUP BY u.id, m.post_id, p.user_id
    
    ORDER BY last_message_time DESC`,
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
  const [usersResult, postsResult, commentsResult, messagesResult, usersByRoleResult, visitorsResult, visitorTimeResult] =
    await Promise.all([
      query('SELECT COUNT(*)::int AS total FROM users'),
      query('SELECT COUNT(*)::int AS total FROM posts'),
      query('SELECT COUNT(*)::int AS total FROM comments'),
      query('SELECT COUNT(*)::int AS total FROM messages'),
      query('SELECT role, COUNT(*)::int AS count FROM users GROUP BY role'),
      query('SELECT COUNT(*)::int AS total FROM visitors'),
      query('SELECT COALESCE(AVG(duration_seconds), 0)::int AS avg_duration, COALESCE(SUM(duration_seconds), 0)::int AS total_duration FROM visitors'),
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
    totalVisitors: visitorsResult.rows[0].total,
    avgDurationSeconds: visitorTimeResult.rows[0].avg_duration,
    totalDurationSeconds: visitorTimeResult.rows[0].total_duration,
    usersByRole,
  };
};

const reportPost = async (postId, reason) => {
  await query(
    `UPDATE posts 
     SET is_reported = TRUE, 
         reports_count = reports_count + 1,
         report_reasons = COALESCE(report_reasons || E'\n' || $2, $2)
     WHERE id = $1`,
    [postId, reason || 'Non spécifié']
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

const getCommunityStats = async () => {
  const { rows } = await query(`
    SELECT
      (SELECT COUNT(*)::int FROM users WHERE role = 'user') AS members,
      (SELECT COUNT(*)::int FROM users WHERE role = 'coach') AS coaches,
      (
        SELECT COUNT(DISTINCT u.id)::int FROM users u
        WHERE u.role = 'coach'
          AND EXISTS (
            SELECT 1 FROM messages m
            WHERE m.sender_id = u.id OR m.receiver_id = u.id
          )
      ) AS professionals
  `);
  return {
    activeMembers: rows[0].members,
    activeCoaches: rows[0].coaches,
    activeProfessionals: rows[0].professionals,
  };
};

const getContactMessages = async () => {
  const { rows } = await query(
    `SELECT id, name, email, message, created_at
     FROM contact_messages
     ORDER BY created_at DESC`
  );
  return rows;
};

const deleteContactMessage = async (id) => {
  const { rowCount } = await query(`DELETE FROM contact_messages WHERE id = $1`, [id]);
  return rowCount > 0;
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

const recordVisitor = async (visitorId, isHeartbeat = false) => {
  if (isHeartbeat) {
    await query(
      `INSERT INTO visitors (visitor_id, last_active, duration_seconds) VALUES ($1, CURRENT_TIMESTAMP, 20)
       ON CONFLICT (visitor_id) DO UPDATE SET last_active = CURRENT_TIMESTAMP, duration_seconds = visitors.duration_seconds + 20`,
      [visitorId]
    );
  } else {
    await query(
      `INSERT INTO visitors (visitor_id, last_active) VALUES ($1, CURRENT_TIMESTAMP)
       ON CONFLICT (visitor_id) DO UPDATE SET last_active = CURRENT_TIMESTAMP`,
      [visitorId]
    );
  }
};

const sendFriendRequest = async (senderId, receiverId) => {
  const user1 = Math.min(senderId, receiverId);
  const user2 = Math.max(senderId, receiverId);
  const { rows } = await query(
    `INSERT INTO friends (user_id_1, user_id_2, status, sender_id)
     VALUES ($1, $2, 'pending', $3)
     ON CONFLICT (user_id_1, user_id_2) DO UPDATE 
     SET status = 'pending', sender_id = $3
     WHERE friends.status = 'pending' OR friends.status = 'none' OR friends.status IS NULL
     RETURNING *`,
    [user1, user2, senderId]
  );
  return rows[0];
};

const acceptFriendRequest = async (userId, senderId) => {
  const user1 = Math.min(userId, senderId);
  const user2 = Math.max(userId, senderId);
  const { rows } = await query(
    `UPDATE friends 
     SET status = 'accepted' 
     WHERE user_id_1 = $1 AND user_id_2 = $2 AND status = 'pending' AND sender_id = $3
     RETURNING *`,
    [user1, user2, senderId]
  );
  return rows[0];
};

const declineFriendRequestOrRemoveFriend = async (userId, otherId) => {
  const user1 = Math.min(userId, otherId);
  const user2 = Math.max(userId, otherId);
  const { rows } = await query(
    `DELETE FROM friends 
     WHERE user_id_1 = $1 AND user_id_2 = $2
     RETURNING *`,
    [user1, user2]
  );
  return rows[0];
};

const getFriendshipStatus = async (userId, otherId) => {
  const user1 = Math.min(userId, otherId);
  const user2 = Math.max(userId, otherId);
  const { rows } = await query(
    `SELECT * FROM friends WHERE user_id_1 = $1 AND user_id_2 = $2`,
    [user1, user2]
  );
  if (rows.length === 0) {
    return { status: 'none', sender_id: null };
  }
  const rel = rows[0];
  let status = 'none';
  if (rel.status === 'accepted') {
    status = 'friends';
  } else if (rel.status === 'pending') {
    status = rel.sender_id === userId ? 'sent' : 'received';
  }
  return { status, sender_id: rel.sender_id };
};

initDb();

module.exports = {
  recordVisitor,
  pool,
  query,
  registerUser,
  loginUser,
  createPost,
  likePost,
  addComment,
  deleteComment,
  getFeed,
  getAdminUsers,
  getMessages,
  sendMessage,
  getOtherUser,
  updateAvatar,
  getUserById,
  getMetrics,
  getCommunityStats,
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
  getContactMessages,
  deleteContactMessage,
  deleteUserAccount,
  exportUserData,
  sendFriendRequest,
  acceptFriendRequest,
  declineFriendRequestOrRemoveFriend,
  getFriendshipStatus,
};
