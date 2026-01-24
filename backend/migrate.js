require("dotenv").config();
const { sequelize } = require("./src/config/db");

async function runMigrations() {
  try {
    console.log('🔄 Ejecutando migraciones de base de datos...');

    // Ejecutar queries SQL usando Sequelize
    const queries = [
      // Agregar campos a Customers
      `ALTER TABLE Customers ADD COLUMN billingAddress TEXT`,
      `ALTER TABLE Customers ADD COLUMN taxId VARCHAR(50)`,
      `ALTER TABLE Customers ADD COLUMN creditLimit DECIMAL(10,2) DEFAULT 0`,
      `ALTER TABLE Customers ADD COLUMN currentDebt DECIMAL(10,2) DEFAULT 0`,
      `ALTER TABLE Customers ADD COLUMN paymentTerms ENUM('cash', '7_days', '15_days', '30_days', '60_days') DEFAULT 'cash'`,
      `ALTER TABLE Customers ADD COLUMN status ENUM('active', 'inactive', 'suspended', 'blacklisted') DEFAULT 'active'`,
      `ALTER TABLE Customers ADD COLUMN notes TEXT`,
      `ALTER TABLE Customers ADD COLUMN metadata JSON`,

      // Agregar campos a Products
      `ALTER TABLE Products ADD COLUMN barcode VARCHAR(100)`,
      `ALTER TABLE Products ADD COLUMN weight DECIMAL(8,3)`,
      `ALTER TABLE Products ADD COLUMN dimensions JSON`,
      `ALTER TABLE Products ADD COLUMN taxable BOOLEAN DEFAULT TRUE`,
      `ALTER TABLE Products ADD COLUMN taxRate DECIMAL(5,2) DEFAULT 0`,
      `ALTER TABLE Products ADD COLUMN trackInventory BOOLEAN DEFAULT TRUE`,
      `ALTER TABLE Products ADD COLUMN allowBackorders BOOLEAN DEFAULT FALSE`,
      `ALTER TABLE Products ADD COLUMN maxStock INT`,
      `ALTER TABLE Products ADD COLUMN metadata JSON`,

      // Agregar campos a Orders
      `ALTER TABLE Orders ADD COLUMN paymentStatus ENUM('unpaid', 'partial', 'paid', 'refunded', 'overpaid') DEFAULT 'unpaid'`,
      `ALTER TABLE Orders ADD COLUMN subtotal DECIMAL(10,2) NOT NULL DEFAULT 0`,
      `ALTER TABLE Orders ADD COLUMN taxAmount DECIMAL(10,2) DEFAULT 0`,
      `ALTER TABLE Orders ADD COLUMN discountAmount DECIMAL(10,2) DEFAULT 0`,
      `ALTER TABLE Orders ADD COLUMN shippingAddress TEXT`,
      `ALTER TABLE Orders ADD COLUMN shippingMethod VARCHAR(100)`,
      `ALTER TABLE Orders ADD COLUMN shippingCost DECIMAL(10,2) DEFAULT 0`,
      `ALTER TABLE Orders ADD COLUMN trackingNumber VARCHAR(100)`,
      `ALTER TABLE Orders ADD COLUMN priority ENUM('low', 'normal', 'high', 'urgent') DEFAULT 'normal'`,
      `ALTER TABLE Orders ADD COLUMN source ENUM('web', 'phone', 'email', 'in_person', 'api') DEFAULT 'web'`,
      `ALTER TABLE Orders ADD COLUMN metadata JSON`,

      // Agregar campos de seguridad a Users
      `ALTER TABLE Users ADD COLUMN failedLoginAttempts INT DEFAULT 0`,
      `ALTER TABLE Users ADD COLUMN lockedUntil DATETIME NULL`,
      `ALTER TABLE Users ADD COLUMN lastLogin DATETIME NULL`,
      `ALTER TABLE Users ADD COLUMN tokenVersion INT DEFAULT 0`,
    ];

    for (const query of queries) {
      try {
        await sequelize.query(query);
        console.log('✅ Columna agregada:', query.split('ADD COLUMN')[1]?.trim() || query.substring(0, 50));
      } catch (error) {
        // Ignorar errores de columnas que ya existen
        if (error.message.includes('Duplicate column name')) {
          console.log('⚠️  Columna ya existe, omitiendo');
        } else {
          console.log('⚠️  Error en query:', error.message);
        }
      }
    }

    // Crear tablas nuevas si no existen
    const createTables = [
      `CREATE TABLE IF NOT EXISTS PaymentMethods (
        id INT AUTO_INCREMENT PRIMARY KEY,
        customer_id INT NOT NULL,
        name VARCHAR(100) NOT NULL,
        type ENUM('cash', 'card', 'bank_transfer', 'check', 'digital_wallet') NOT NULL,
        provider VARCHAR(50),
        lastFour VARCHAR(4),
        expiryMonth INT,
        expiryYear INT,
        isDefault BOOLEAN DEFAULT FALSE,
        isActive BOOLEAN DEFAULT TRUE,
        token VARCHAR(255),
        metadata JSON,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (customer_id) REFERENCES Customers(id) ON DELETE CASCADE
      )`,

      `CREATE TABLE IF NOT EXISTS Payments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        order_id INT NOT NULL,
        paymentMethod_id INT NOT NULL,
        paymentNumber VARCHAR(50) UNIQUE NOT NULL,
        amount DECIMAL(10,2) NOT NULL,
        currency VARCHAR(3) DEFAULT 'USD',
        status ENUM('pending', 'processing', 'completed', 'failed', 'refunded', 'cancelled') DEFAULT 'pending',
        paymentDate DATETIME DEFAULT CURRENT_TIMESTAMP,
        processedAt DATETIME,
        reference VARCHAR(100),
        notes TEXT,
        gatewayResponse JSON,
        errorMessage TEXT,
        refundAmount DECIMAL(10,2) DEFAULT 0,
        refundDate DATETIME,
        refundReason TEXT,
        processedBy_id INT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (order_id) REFERENCES Orders(id) ON DELETE CASCADE,
        FOREIGN KEY (paymentMethod_id) REFERENCES PaymentMethods(id) ON DELETE CASCADE,
        FOREIGN KEY (processedBy_id) REFERENCES Users(id)
      )`,

      `CREATE TABLE IF NOT EXISTS PaymentTransactions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        payment_id INT NOT NULL,
        transactionId VARCHAR(100) UNIQUE NOT NULL,
        amount DECIMAL(10,2) NOT NULL,
        type ENUM('charge', 'refund', 'authorization', 'capture', 'void') NOT NULL,
        status ENUM('pending', 'success', 'failed', 'cancelled') DEFAULT 'pending',
        gateway VARCHAR(50),
        gatewayTransactionId VARCHAR(100),
        gatewayResponse JSON,
        processedAt DATETIME,
        errorCode VARCHAR(50),
        errorMessage TEXT,
        metadata JSON,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (payment_id) REFERENCES Payments(id) ON DELETE CASCADE
      )`
    ];

    for (const query of createTables) {
      try {
        await sequelize.query(query);
        console.log('✅ Tabla creada o ya existe');
      } catch (error) {
        console.log('⚠️  Error creando tabla:', error.message);
      }
    }

    // Actualizar datos existentes
    try {
      await sequelize.query(`
        UPDATE Orders SET
          subtotal = total,
          paymentStatus = CASE
            WHEN status = 'delivered' THEN 'paid'
            ELSE 'unpaid'
          END
        WHERE subtotal = 0 OR subtotal IS NULL
      `);
      console.log('✅ Datos de órdenes actualizados');
    } catch (error) {
      console.log('⚠️  Error actualizando órdenes:', error.message);
    }

    console.log('🎉 Migraciones completadas exitosamente');

  } catch (error) {
    console.error('❌ Error en migraciones:', error.message);
  } finally {
    await sequelize.close();
  }
}

runMigrations();