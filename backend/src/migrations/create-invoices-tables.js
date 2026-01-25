require("dotenv").config();
const { sequelize } = require("../config/db");

async function createInvoicesTables() {
  try {
    console.log("🔄 Creando tablas de facturas...");

    // Crear tabla de facturas
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS invoices (
        id INT AUTO_INCREMENT PRIMARY KEY,
        invoiceNumber VARCHAR(50) UNIQUE NOT NULL,
        customer_id INT NOT NULL,
        user_id INT NOT NULL,
        order_id INT NULL,
        invoiceDate DATE NOT NULL DEFAULT (CURRENT_DATE),
        dueDate DATE NULL,
        subtotal DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
        taxRate DECIMAL(5, 2) NOT NULL DEFAULT 18.00,
        taxAmount DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
        discountAmount DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
        total DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
        status ENUM('draft', 'pending', 'paid', 'overdue', 'cancelled') NOT NULL DEFAULT 'pending',
        paymentMethod ENUM('cash', 'card', 'transfer', 'check', 'other') NULL,
        notes TEXT NULL,
        paidAt DATE NULL,
        createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE SET NULL,
        INDEX idx_invoice_number (invoiceNumber),
        INDEX idx_customer (customer_id),
        INDEX idx_user (user_id),
        INDEX idx_status (status),
        INDEX idx_invoice_date (invoiceDate)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    console.log("✅ Tabla 'invoices' creada exitosamente");

    // Crear tabla de items de factura
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS invoice_items (
        id INT AUTO_INCREMENT PRIMARY KEY,
        invoice_id INT NOT NULL,
        product_id INT NOT NULL,
        quantity INT NOT NULL DEFAULT 1,
        price DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
        total DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
        createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
        INDEX idx_invoice (invoice_id),
        INDEX idx_product (product_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    console.log("✅ Tabla 'invoice_items' creada exitosamente");
    console.log("🎉 Migración completada exitosamente");

    process.exit(0);
  } catch (error) {
    console.error("❌ Error al crear tablas de facturas:", error);
    process.exit(1);
  }
}

createInvoicesTables();
