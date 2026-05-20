const { Pool } = require('pg');
const bcrypt = require('bcrypt');

const databaseUrl = process.env.DATABASE_URL || 'postgresql://rever_user:rever_password@localhost:5432/rever';
const pool = new Pool({
  connectionString: databaseUrl,
  ssl: process.env.DATABASE_SSL === 'true'
    ? { rejectUnauthorized: process.env.DATABASE_SSL_REJECT_UNAUTHORIZED !== 'false' }
    : false,
});

async function run() {
  try {
    console.log('=== DIRECT ADMIN RESET ===');
    console.log('Using database URL:', databaseUrl.replace(/:[^:@]+@/, ':***@'));
    
    const password = 'ChangeMeAdmin2026!';
    const saltRounds = 12;
    console.log('Hashing password...');
    const hash = await bcrypt.hash(password, saltRounds);
    
    // Check if admin exists
    const { rows } = await pool.query("SELECT id, contact, pseudo FROM users WHERE contact = 'admin'");
    if (rows.length > 0) {
      console.log('Admin user found in DB, resetting password...');
      await pool.query(
        "UPDATE users SET password = $1, role = 'admin', pseudo = 'admin', first_name = 'Coach', last_name = 'Admin' WHERE contact = 'admin'",
        [hash]
      );
      console.log('✅ Admin password updated successfully!');
    } else {
      console.log('Admin user not found, inserting...');
      await pool.query(
        "INSERT INTO users (first_name, last_name, contact, password, pseudo, role) VALUES ($1, $2, $3, $4, $5, $6)",
        ['Coach', 'Admin', 'admin', hash, 'admin', 'admin']
      );
      console.log('✅ Admin user created successfully!');
    }
  } catch (err) {
    console.error('❌ Error resetting admin:', err);
  } finally {
    await pool.end();
  }
}

run();
