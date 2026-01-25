const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const Customer = sequelize.define("Customer", {
  clientId: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: true,
    comment: 'ID único del cliente (formato: CLI-XXX)'
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [2, 100]
    }
  },
  lastName: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [2, 100]
    }
  },
  cedula: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      notEmpty: true,
      is: {
        args: /^[0-9]{11}$/,
        msg: 'La cédula debe tener exactamente 11 dígitos numéricos'
      }
    },
    comment: 'Cédula de identidad (República Dominicana) - 11 dígitos'
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
    allowNull: false,
    validate: {
      notEmpty: true,
      is: /^[\+]?[1-9][\d]{0,15}$/
    }
  },
  address: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      notEmpty: true
    },
    comment: 'Dirección física del cliente'
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
