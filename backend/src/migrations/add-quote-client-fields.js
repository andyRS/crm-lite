/**
 * Migration: Add client fields to Quotes table
 * Purpose: Add support for non-registered clients in quotes
 * Adds: clientName, clientEmail, clientPhone, clientCompany
 */

require('dotenv').config();
const { sequelize } = require('../config/db');

async function migrate() {
  try {
    console.log('🔄 Ejecutando migración: agregar campos de cliente a Quotes...');
    
    const columns = [
      { name: 'clientName', comment: 'Nombre del cliente (para clientes no registrados)' },
      { name: 'clientEmail', comment: 'Email del cliente (para clientes no registrados)' },
      { name: 'clientPhone', comment: 'Teléfono del cliente (para clientes no registrados)' },
      { name: 'clientCompany', comment: 'Empresa del cliente (para clientes no registrados)' }
    ];

    for (const column of columns) {
      try {
        // Verificar si la columna existe
        const [results] = await sequelize.query(`
          SELECT COLUMN_NAME 
          FROM INFORMATION_SCHEMA.COLUMNS 
          WHERE TABLE_SCHEMA = DATABASE() 
          AND TABLE_NAME = 'Quotes' 
          AND COLUMN_NAME = '${column.name}'
        `);

        if (results.length === 0) {
          // La columna no existe, agregarla
          await sequelize.query(`
            ALTER TABLE Quotes 
            ADD COLUMN ${column.name} VARCHAR(255) NULL 
            COMMENT '${column.comment}'
          `);
          console.log(`✅ Campo ${column.name} agregado`);
        } else {
          console.log(`ℹ️  Campo ${column.name} ya existe`);
        }
      } catch (error) {
        console.error(`❌ Error agregando ${column.name}:`, error.message);
      }
    }

    console.log('✨ Migración completada exitosamente!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error en migración:', error.message);
    process.exit(1);
  }
}

migrate();
