const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://localhost:5432/rever',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

const initDb = async () => {
  try {
    await pool.query(`
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
    
    await pool.query(`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar TEXT
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS posts (
        id SERIAL PRIMARY KEY,
        user_id INTEGER,
        text TEXT NOT NULL,
        image_url TEXT,
        likes INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    await pool.query(`
      ALTER TABLE posts ADD COLUMN IF NOT EXISTS image_url TEXT
    `);

    await pool.query(`
      ALTER TABLE posts 
      ADD COLUMN IF NOT EXISTS is_reported BOOLEAN DEFAULT FALSE,
      ADD COLUMN IF NOT EXISTS reports_count INTEGER DEFAULT 0
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS comments (
        id SERIAL PRIMARY KEY,
        post_id INTEGER,
        user_id INTEGER,
        text TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS messages (
        id SERIAL PRIMARY KEY,
        sender_id INTEGER,
        receiver_id INTEGER,
        text TEXT NOT NULL,
        is_read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await pool.query(`
      ALTER TABLE messages ADD COLUMN IF NOT EXISTS is_read BOOLEAN DEFAULT FALSE
    `);

    const insertUser = async (firstName, lastName, contact, password, pseudo, role) => {
      await pool.query(`
        INSERT INTO users (first_name, last_name, contact, password, pseudo, role) 
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (contact) DO NOTHING
      `, [firstName, lastName, contact, password, pseudo, role]);
    };

    await insertUser('Coach', 'Admin', 'admin', 'admin', 'admin', 'admin');

    console.log('Base de données initialisée avec succès');
  } catch (error) {
    console.error('Erreur lors de l\'initialisation de la base de données:', error);
  }
};

initDb();

const registerUser = (firstName, lastName, contact, password, pseudo) => {
  return new Promise((resolve, reject) => {
    pool.query(
      `INSERT INTO users (first_name, last_name, contact, password, pseudo) VALUES ($1, $2, $3, $4, $5) RETURNING id, pseudo, role`, 
      [firstName, lastName, contact, password, pseudo], 
      (err, result) => {
        if (err) reject(err);
        else resolve(result.rows[0]);
      }
    );
  });
};

const loginUser = (loginIdentifier, password) => {
  return new Promise((resolve, reject) => {
    pool.query(
      `SELECT id, first_name, last_name, pseudo, role FROM users WHERE (contact = $1 OR pseudo = $1) AND password = $2`, 
      [loginIdentifier, password], 
      (err, result) => {
        if (err) reject(err);
        else resolve(result.rows[0]);
      }
    );
  });
};

const createPost = (userId, text, imageUrl) => {
  return new Promise((resolve, reject) => {
    pool.query(`INSERT INTO posts (user_id, text, image_url) VALUES ($1, $2, $3) RETURNING id`, [userId, text, imageUrl], (err, result) => {
      if (err) reject(err); else resolve({ id: result.rows[0].id });
    });
  });
};

const likePost = (postId) => {
  return new Promise((resolve, reject) => {
    pool.query(`UPDATE posts SET likes = likes + 1 WHERE id = $1`, [postId], (err) => {
      if (err) reject(err); else resolve();
    });
  });
};

const addComment = (postId, userId, text) => {
  return new Promise((resolve, reject) => {
    pool.query(`INSERT INTO comments (post_id, user_id, text) VALUES ($1, $2, $3) RETURNING id`, [postId, userId, text], (err, result) => {
      if (err) reject(err); else resolve({ id: result.rows[0].id });
    });
  });
};

const getFeed = async () => {
  try {
    const postsResult = await pool.query(`
      SELECT p.*, u.pseudo as username, u.avatar as user_avatar 
      FROM posts p 
      JOIN users u ON p.user_id = u.id 
      ORDER BY p.created_at DESC
    `);
    
    const posts = postsResult.rows;
    
    for (let post of posts) {
      const commentsResult = await pool.query(`
        SELECT c.*, u.pseudo as username 
        FROM comments c 
        JOIN users u ON c.user_id = u.id 
        WHERE c.post_id = $1 
        ORDER BY c.created_at ASC
      `, [post.id]);
      post.comments = commentsResult.rows;
    }
    
    return posts;
  } catch (error) {
    throw error;
  }
};

const getMessages = (userId1, userId2) => {
  return new Promise((resolve, reject) => {
    pool.query(`
      SELECT m.*, 
             u1.pseudo as sender_pseudo, 
             u1.first_name as sender_first_name,
             u1.last_name as sender_last_name,
             u1.avatar as sender_avatar,
             u2.pseudo as receiver_pseudo,
             u2.first_name as receiver_first_name,
             u2.last_name as receiver_last_name,
             u2.avatar as receiver_avatar
      FROM messages m
      JOIN users u1 ON m.sender_id = u1.id
      JOIN users u2 ON m.receiver_id = u2.id
      WHERE (sender_id = $1 AND receiver_id = $2) OR (sender_id = $2 AND receiver_id = $1)
      ORDER BY m.created_at ASC
    `, [userId1, userId2], (err, result) => {
      if (err) reject(err);
      else resolve(result.rows);
    });
  });
};

const getOtherUser = (userId) => {
  return new Promise((resolve, reject) => {
    pool.query(`
      SELECT id, first_name, last_name, pseudo, role, avatar 
      FROM users 
      WHERE id = $1
    `, [userId], (err, result) => {
      if (err) reject(err);
      else resolve(result.rows[0]);
    });
  });
};

const sendMessage = (senderId, receiverId, text) => {
  return new Promise((resolve, reject) => {
    pool.query(`INSERT INTO messages (sender_id, receiver_id, text) VALUES ($1, $2, $3) RETURNING id`, 
      [senderId, receiverId, text], (err, result) => {
      if (err) reject(err);
      else resolve({ id: result.rows[0].id });
    });
  });
};

const getCoaches = () => {
  return new Promise((resolve, reject) => {
    pool.query(`
      SELECT id, first_name, last_name, pseudo, role, avatar 
      FROM users 
      WHERE role = 'coach'
    `, [], (err, result) => {
      if (err) reject(err);
      else resolve(result.rows);
    });
  });
};

const getConversations = (userId) => {
  return new Promise((resolve, reject) => {
    pool.query(`
      SELECT 
        u.id, u.first_name, u.last_name, u.pseudo, u.role, u.avatar,
        (SELECT COUNT(*) FROM messages WHERE sender_id = u.id AND receiver_id = $1 AND is_read = FALSE) as unread_count
      FROM users u
      WHERE u.id IN (
        SELECT sender_id FROM messages WHERE receiver_id = $1
        UNION
        SELECT receiver_id FROM messages WHERE sender_id = $1
      )
    `, [userId], (err, result) => {
      if (err) reject(err);
      else resolve(result.rows);
    });
  });
};

const getCoachesWithUnread = (userId) => {
  return new Promise((resolve, reject) => {
    pool.query(`
      SELECT 
        u.id, u.first_name, u.last_name, u.pseudo, u.role, u.avatar,
        (SELECT COUNT(*) FROM messages WHERE sender_id = u.id AND receiver_id = $1 AND is_read = FALSE) as unread_count
      FROM users u 
      WHERE u.role = 'coach' AND u.id != $1
    `, [userId], (err, result) => {
      if (err) reject(err);
      else resolve(result.rows);
    });
  });
};

const getUnreadCount = (userId) => {
  return new Promise((resolve, reject) => {
    pool.query(`SELECT COUNT(*) as count FROM messages WHERE receiver_id = $1 AND is_read = FALSE`, [userId], (err, result) => {
      if(err) reject(err); else resolve(parseInt(result.rows[0].count) || 0);
    });
  });
};

const markMessagesAsRead = (senderId, receiverId) => {
  return new Promise((resolve, reject) => {
    pool.query(`UPDATE messages SET is_read = TRUE WHERE sender_id = $1 AND receiver_id = $2 AND is_read = FALSE`, [senderId, receiverId], (err) => {
      if(err) reject(err); else resolve();
    });
  });
};

const getAdminUsers = () => {
  return new Promise((resolve, reject) => {
    pool.query(`
      SELECT u.id, u.first_name, u.last_name, u.contact, u.pseudo, u.avatar, u.created_at, COUNT(p.id) as post_count
      FROM users u
      LEFT JOIN posts p ON u.id = p.user_id
      WHERE u.role != 'admin'
      GROUP BY u.id
      ORDER BY u.created_at DESC
    `, [], (err, result) => {
      if (err) reject(err);
      else resolve(result.rows);
    });
  });
};

const updateAvatar = (userId, avatarUrl) => {
  return new Promise((resolve, reject) => {
    pool.query(`
      UPDATE users SET avatar = $1 WHERE id = $2
      RETURNING id, first_name, last_name, pseudo, role, avatar
    `, [avatarUrl, userId], (err, result) => {
      if (err) reject(err);
      else resolve(result.rows[0]);
    });
  });
};

const getUserById = (userId) => {
  return new Promise((resolve, reject) => {
    pool.query(`
      SELECT id, first_name, last_name, pseudo, role, avatar 
      FROM users 
      WHERE id = $1
    `, [userId], (err, result) => {
      if (err) reject(err);
      else resolve(result.rows[0]);
    });
  });
};

const updateUserRole = (userId, role) => {
  return new Promise((resolve, reject) => {
    pool.query(`
      UPDATE users SET role = $1 WHERE id = $2
      RETURNING id, first_name, last_name, pseudo, role, avatar
    `, [role, userId], (err, result) => {
      if (err) reject(err);
      else resolve(result.rows[0]);
    });
  });
};

const createUserWithRole = (firstName, lastName, contact, password, pseudo, role) => {
  return new Promise((resolve, reject) => {
    pool.query(
      `INSERT INTO users (first_name, last_name, contact, password, pseudo, role) 
       VALUES ($1, $2, $3, $4, $5, $6) 
       RETURNING id, first_name, last_name, pseudo, role`, 
      [firstName, lastName, contact, password, pseudo, role], 
      (err, result) => {
        if (err) reject(err);
        else resolve(result.rows[0]);
      }
    );
  });
};

const getMetrics = () => {
  return new Promise(async (resolve, reject) => {
    try {
      const [usersResult, postsResult, commentsResult, messagesResult] = await Promise.all([
        pool.query('SELECT COUNT(*) as total FROM users'),
        pool.query('SELECT COUNT(*) as total FROM posts'),
        pool.query('SELECT COUNT(*) as total FROM comments'),
        pool.query('SELECT COUNT(*) as total FROM messages')
      ]);
      
      const usersByRoleResult = await pool.query(`
        SELECT role, COUNT(*) as count 
        FROM users 
        GROUP BY role
      `);
      
      const totalUsers = parseInt(usersResult.rows[0].total);
      const totalPosts = parseInt(postsResult.rows[0].total);
      const totalComments = parseInt(commentsResult.rows[0].total);
      const totalMessages = parseInt(messagesResult.rows[0].total);
      
      const usersByRole = {};
      usersByRoleResult.rows.forEach(row => {
        usersByRole[row.role] = parseInt(row.count);
      });
      
      resolve({
        totalUsers,
        totalPosts,
        totalComments,
        totalMessages,
        usersByRole: {
          user: usersByRole.user || 0,
          coach: usersByRole.coach || 0,
          admin: usersByRole.admin || 0
        }
      });
    } catch (error) {
      reject(error);
    }
  });
};

const reportPost = (postId) => {
  return new Promise((resolve, reject) => {
    pool.query(`
      UPDATE posts 
      SET is_reported = TRUE, reports_count = reports_count + 1 
      WHERE id = $1
    `, [postId], (err) => {
      if (err) reject(err); else resolve();
    });
  });
};

const getReportedPosts = () => {
  return new Promise((resolve, reject) => {
    pool.query(`
      SELECT p.*, u.pseudo as username 
      FROM posts p 
      JOIN users u ON p.user_id = u.id 
      WHERE p.is_reported = TRUE 
      ORDER BY p.reports_count DESC
    `, [], (err, result) => {
      if (err) reject(err); else resolve(result.rows);
    });
  });
};

const approvePost = (postId) => {
  return new Promise((resolve, reject) => {
    pool.query(`
      UPDATE posts SET is_reported = FALSE, reports_count = 0 WHERE id = $1
    `, [postId], (err) => {
      if (err) reject(err); else resolve();
    });
  });
};

const deletePost = (postId) => {
  return new Promise((resolve, reject) => {
    pool.query(`DELETE FROM comments WHERE post_id = $1`, [postId], (err) => {
      if (err) return reject(err);
      pool.query(`DELETE FROM posts WHERE id = $1`, [postId], (err) => {
        if (err) reject(err); else resolve();
      });
    });
  });
};

module.exports = { 
  pool, registerUser, loginUser, createPost, likePost, addComment, getFeed, 
  getAdminUsers, getMessages, sendMessage, getOtherUser, updateAvatar, getUserById, getMetrics, updateUserRole, createUserWithRole, getCoaches, getConversations, getCoachesWithUnread, getUnreadCount, markMessagesAsRead,
  reportPost, getReportedPosts, approvePost, deletePost
};
