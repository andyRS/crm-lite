require('dotenv').config({ path: '.env.railway' });
const { sequelize } = require('./src/config/db');
const bcrypt = require('bcryptjs');

const NUEVA_PASSWORD = 'Demo123!';

async function main() {
  try {
    const [users] = await sequelize.query('SELECT id, email FROM Users');
    for (const user of users) {
      const hash = await bcrypt.hash(NUEVA_PASSWORD, 10);
      await sequelize.query('UPDATE Users SET password = ? WHERE id = ?', { replacements: [hash, user.id] });
      console.log(`✅ Password actualizada para: ${user.email}`);
    }
    console.log(`\nTodas las contraseñas fueron actualizadas a: ${NUEVA_PASSWORD}`);
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

main();
