-- Script de migración para agregar nuevas funcionalidades de pagos y validaciones
-- Ejecutar este script en MySQL después de detener el servidor

USE crm_lite;

-- Agregar campos a la tabla Customers
ALTER TABLE Customers
ADD COLUMN billingAddress TEXT,
ADD COLUMN taxId VARCHAR(50),
ADD COLUMN creditLimit DECIMAL(10,2) DEFAULT 0,
ADD COLUMN currentDebt DECIMAL(10,2) DEFAULT 0,
ADD COLUMN paymentTerms ENUM('cash', '7_days', '15_days', '30_days', '60_days') DEFAULT 'cash',
ADD COLUMN status ENUM('active', 'inactive', 'suspended', 'blacklisted') DEFAULT 'active',
ADD COLUMN notes TEXT,
ADD COLUMN metadata JSON;

-- Agregar campos a la tabla Products
ALTER TABLE Products
ADD COLUMN barcode VARCHAR(100),
ADD COLUMN weight DECIMAL(8,3),
ADD COLUMN dimensions JSON,
ADD COLUMN taxable BOOLEAN DEFAULT TRUE,
ADD COLUMN taxRate DECIMAL(5,2) DEFAULT 0,
ADD COLUMN trackInventory BOOLEAN DEFAULT TRUE,
ADD COLUMN allowBackorders BOOLEAN DEFAULT FALSE,
ADD COLUMN metadata JSON;

-- Agregar campos a la tabla Orders
ALTER TABLE Orders
ADD COLUMN paymentStatus ENUM('unpaid', 'partial', 'paid', 'refunded', 'overpaid') DEFAULT 'unpaid',
ADD COLUMN subtotal DECIMAL(10,2) NOT NULL DEFAULT 0,
ADD COLUMN taxAmount DECIMAL(10,2) DEFAULT 0,
ADD COLUMN discountAmount DECIMAL(10,2) DEFAULT 0,
ADD COLUMN shippingAddress TEXT,
ADD COLUMN shippingMethod VARCHAR(100),
ADD COLUMN shippingCost DECIMAL(10,2) DEFAULT 0,
ADD COLUMN trackingNumber VARCHAR(100),
ADD COLUMN priority ENUM('low', 'normal', 'high', 'urgent') DEFAULT 'normal',
ADD COLUMN source ENUM('web', 'phone', 'email', 'in_person', 'api') DEFAULT 'web',
ADD COLUMN metadata JSON;

-- Agregar campos a la tabla OrderItems
ALTER TABLE OrderItems
ADD COLUMN taxAmount DECIMAL(10,2) DEFAULT 0,
ADD COLUMN discount DECIMAL(10,2) DEFAULT 0;

-- Crear tabla PaymentMethods
CREATE TABLE PaymentMethods (
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
);

-- Crear tabla Payments
CREATE TABLE Payments (
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
);

-- Crear tabla PaymentTransactions
CREATE TABLE PaymentTransactions (
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
);

-- Crear índices para mejor rendimiento
CREATE INDEX idx_payment_methods_customer ON PaymentMethods(customer_id);
CREATE INDEX idx_payments_order ON Payments(order_id);
CREATE INDEX idx_payments_status ON Payments(status);
CREATE INDEX idx_payment_transactions_payment ON PaymentTransactions(payment_id);

-- Actualizar datos existentes para compatibilidad
UPDATE Orders SET
  subtotal = total,
  paymentStatus = CASE
    WHEN status = 'delivered' THEN 'paid'
    ELSE 'unpaid'
  END
WHERE subtotal = 0;

UPDATE Customers SET status = 'active' WHERE status IS NULL;
UPDATE Products SET taxable = TRUE WHERE taxable IS NULL;
UPDATE Products SET trackInventory = TRUE WHERE trackInventory IS NULL;