// Migración para agregar columna currency a la tabla invoices
require('dotenv').config();
const { sequelize } = require('../config/db');

async function migrate() {
  try {
    console.log('🔄 Iniciando migración: Agregar columna currency a invoices...');

    // Verificar si la columna currency ya existe
    const [columns] = await sequelize.query(
      "SHOW COLUMNS FROM `invoices` LIKE 'currency'"
    );

    if (columns.length > 0) {
      console.log('✅ La columna currency ya existe en invoices');
      return;
    }

    // Agregar columna currency
    await sequelize.query(`
      ALTER TABLE \`invoices\`
      ADD COLUMN \`currency\` ENUM('DOP', 'USD') NOT NULL DEFAULT 'DOP'
      COMMENT 'Moneda: DOP (Pesos Dominicanos) o USD (Dólares)'
      AFTER \`paymentMethod\`
    `);

    console.log('✅ Migración completada exitosamente');
    console.log('✅ Columna currency agregada a la tabla invoices');

  } catch (error) {
    console.error('❌ Error en la migración:', error.message);
    throw error;
  } finally {
    await sequelize.close();
  }
}

// Ejecutar migración si se llama directamente
if (require.main === module) {
  migrate()
    .then(() => {
      console.log('✅ Script de migración finalizado');
      process.exit(0);
    })
    .catch(err => {
      console.error('❌ Script de migración falló:', err);
      process.exit(1);
    });
}

module.exports = { migrate };
