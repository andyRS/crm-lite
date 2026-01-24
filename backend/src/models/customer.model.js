const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const Customer = sequelize.define("Customer", {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [2, 100]
    }
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true,
      notEmpty: true
    }
  },
  phone: {
    type: DataTypes.STRING,
    validate: {
      is: /^[\+]?[1-9][\d]{0,15}$/
    }
  },
  // Información de facturación
  billingAddress: {
    type: DataTypes.TEXT,
  },
  taxId: {
    type: DataTypes.STRING, // RUC, NIT, etc.
  },
  // Información financiera
  creditLimit: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
  },
  currentDebt: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
  },
  paymentTerms: {
    type: DataTypes.ENUM('cash', '7_days', '15_days', '30_days', '60_days'),
    defaultValue: 'cash',
  },
  // Estado del cliente
  status: {
    type: DataTypes.ENUM('active', 'inactive', 'suspended', 'blacklisted'),
    defaultValue: 'active',
  },
  notes: {
    type: DataTypes.TEXT,
  },
  // Metadata adicional
  metadata: {
    type: DataTypes.JSON,
  },
});

module.exports = Customer;
