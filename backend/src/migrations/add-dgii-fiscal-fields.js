// Migración: agregar campos fiscales DGII (NCF, retenciones) a invoices
require('dotenv').config();
const { sequelize } = require('../config/db');

const columnsToAdd = [
  { name: 'fiscalType', ddl: "ENUM('ncf','ecf') NOT NULL DEFAULT 'ncf'" },
  { name: 'ncfType', ddl: "VARCHAR(2) NULL" },
  { name: 'ncf', ddl: "VARCHAR(19) NULL" },
  { name: 'ncfSequence_id', ddl: "INT NULL" },
  { name: 'retentionApplies', ddl: "TINYINT(1) NOT NULL DEFAULT 0" },
  { name: 'itbisRetentionPercentage', ddl: "DECIMAL(5,2) NULL" },
  { name: 'itbisRetentionAmount', ddl: "DECIMAL(10,2) NOT NULL DEFAULT 0.00" },
  { name: 'isrRetentionPercentage', ddl: "DECIMAL(5,2) NULL" },
  { name: 'isrRetentionAmount', ddl: "DECIMAL(10,2) NOT NULL DEFAULT 0.00" },
  { name: 'netTotal', ddl: "DECIMAL(10,2) NULL" },
];

async function migrate() {
  try {
    console.log('🔄 Iniciando migración: campos fiscales DGII en invoices...');

    for (const col of columnsToAdd) {
      const [existing] = await sequelize.query(
        `SHOW COLUMNS FROM \`invoices\` LIKE '${col.name}'`
      );

      if (existing.length > 0) {
        console.log(`ℹ️  Columna ${col.name} ya existe`);
        continue;
      }

      await sequelize.query(`ALTER TABLE \`invoices\` ADD COLUMN \`${col.name}\` ${col.ddl}`);
      console.log(`✅ Columna ${col.name} agregada`);
    }

    // Ampliar ENUM de status para incluir 'credited' (factura anulada/ajustada por nota de crédito)
    const [statusColumn] = await sequelize.query(
      "SHOW COLUMNS FROM `invoices` LIKE 'status'"
    );
    if (statusColumn.length > 0 && !statusColumn[0].Type.includes('credited')) {
      await sequelize.query(`
        ALTER TABLE \`invoices\`
        MODIFY COLUMN \`status\` ENUM('draft','pending','paid','overdue','cancelled','credited') DEFAULT 'draft'
      `);
      console.log('✅ Estado "credited" agregado al ENUM de status');
    } else {
      console.log('ℹ️  ENUM de status ya incluye "credited"');
    }

    // Índice único para ncf (permitiendo múltiples NULL, comportamiento estándar de MySQL en UNIQUE)
    const [indexExists] = await sequelize.query(
      "SHOW INDEX FROM `invoices` WHERE Key_name = 'invoices_ncf_unique'"
    );
    if (indexExists.length === 0) {
      await sequelize.query(
        "ALTER TABLE `invoices` ADD UNIQUE INDEX `invoices_ncf_unique` (`ncf`)"
      );
      console.log('✅ Índice único agregado sobre ncf');
    } else {
      console.log('ℹ️  Índice único sobre ncf ya existe');
    }

    console.log('✨ Migración completada exitosamente');
  } catch (error) {
    console.error('❌ Error en la migración:', error.message);
    throw error;
  } finally {
    await sequelize.close();
  }
}

if (require.main === module) {
  migrate()
    .then(() => {
      console.log('✅ Script de migración finalizado');
      process.exit(0);
    })
    .catch((err) => {
      console.error('❌ Script de migración falló:', err);
      process.exit(1);
    });
}

module.exports = { migrate };
