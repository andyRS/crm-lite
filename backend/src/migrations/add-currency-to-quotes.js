/**
 * Migration: Add currency field to Quotes table
 * Purpose: Add support for multi-currency in quotes
 * Adds: currency
 */

require('dotenv').config();
const { sequelize } = require('../config/db');

async function migrate() {
  try {
    console.log('🔄 Ejecutando migración: agregar campo currency a Quotes...');
    
    // Verificar si la columna currency existe
    const [results] = await sequelize.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'Quotes' 
      AND COLUMN_NAME = 'currency'
    `);

    if (results.length === 0) {
      // La columna no existe, agregarla
      await sequelize.query(`
        ALTER TABLE Quotes 
        ADD COLUMN currency VARCHAR(10) DEFAULT 'USD' 
        COMMENT 'Moneda de la cotización (USD, EUR, etc.)'
      `);
      console.log('✅ Campo currency agregado');
    } else {
      console.log('ℹ️  Campo currency ya existe');
    }

    // Verificar y agregar campos de cliente si no existen
    const clientFields = [
      { name: 'clientName', type: 'VARCHAR(255)', comment: 'Nombre del cliente' },
      { name: 'clientEmail', type: 'VARCHAR(255)', comment: 'Email del cliente' },
      { name: 'clientPhone', type: 'VARCHAR(50)', comment: 'Teléfono del cliente' },
      { name: 'clientCompany', type: 'VARCHAR(255)', comment: 'Empresa del cliente' }
    ];

    for (const field of clientFields) {
      const [fieldResults] = await sequelize.query(`
        SELECT COLUMN_NAME 
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'Quotes' 
        AND COLUMN_NAME = '${field.name}'
      `);

      if (fieldResults.length === 0) {
        await sequelize.query(`
          ALTER TABLE Quotes 
          ADD COLUMN ${field.name} ${field.type} NULL 
          COMMENT '${field.comment}'
        `);
        console.log(`✅ Campo ${field.name} agregado`);
      } else {
        console.log(`ℹ️  Campo ${field.name} ya existe`);
      }
    }

    console.log('✨ Migración completada exitosamente!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error en migración:', error);
    process.exit(1);
  }
}

migrate();
