const { pool, query } = require('./database');
const { hashPassword } = require('./lib/password');

async function run() {
  try {
    console.log('\n=== DIAGNOSTIC & RÉINITIALISATION DE L\'ADMIN ===');
    
    // 1. Lister les utilisateurs existants pour comprendre le problème
    const { rows: users } = await query('SELECT id, first_name, last_name, contact, pseudo, role FROM users');
    console.log('Utilisateurs actuels dans la base de données :', users);
    
    // 2. Nettoyer les conflits potentiels sur le pseudo "admin"
    const pseudoConflict = users.find(u => u.pseudo === 'admin');
    if (pseudoConflict && pseudoConflict.contact !== 'admin') {
      console.log(`⚠️ Conflit détecté : Le pseudo "admin" est déjà utilisé par l'utilisateur (ID: ${pseudoConflict.id}, contact: "${pseudoConflict.contact}").`);
      console.log('Mise à jour du pseudo conflictuel pour libérer "admin"...');
      await query("UPDATE users SET pseudo = 'user_old_admin_' || id WHERE id = $1", [pseudoConflict.id]);
    }
    
    // 3. Créer ou réinitialiser le compte administrateur
    const adminPassword = 'ChangeMeAdmin2026!';
    const adminHash = await hashPassword(adminPassword);
    
    const adminUser = users.find(u => u.contact === 'admin');
    if (adminUser) {
      console.log('🔄 Compte avec le contact "admin" trouvé. Réinitialisation forcée du mot de passe et du rôle en "admin"...');
      await query(
        `UPDATE users 
         SET password = $1, role = 'admin', pseudo = 'admin', first_name = 'Coach', last_name = 'Admin' 
         WHERE contact = 'admin'`,
        [adminHash]
      );
    } else {
      console.log('➕ Aucun compte avec le contact "admin" trouvé. Création d\'un compte administrateur propre...');
      await query(
        `INSERT INTO users (first_name, last_name, contact, password, pseudo, role)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        ['Coach', 'Admin', 'admin', adminHash, 'admin', 'admin']
      );
    }
    
    console.log('\n✅ SUCCÈS : Compte admin configuré !');
    console.log('👉 Identifiant de connexion (Pseudo ou Email) : admin');
    console.log('👉 Mot de passe : ChangeMeAdmin2026!');
    console.log('================================================\n');
    
  } catch (err) {
    console.error('❌ Erreur lors de l\'exécution du script :', err);
  } finally {
    await pool.end();
  }
}

run();
