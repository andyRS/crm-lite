/**
 * Migration: Make customerId nullable in Quotes table
 * Purpose: Allow quotes for non-registered clients
 */

require('dotenv').config();
const { sequelize } = require('../config/db');

async function migrate() {
  try {
    console.log('🔄 Ejecutando migración: hacer customerId nullable en Quotes...');
    
    // Modificar la columna customerId para permitir NULL
    await sequelize.query(`
      ALTER TABLE Quotes 
      MODIFY COLUMN customerId INT NULL
    `);
    console.log('✅ Columna customerId ahora permite NULL');

    console.log('✨ Migración completada exitosamente!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error en migración:', error.message);
    process.exit(1);
  }
}

migrate();
