const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const PaymentMethod = sequelize.define("PaymentMethod", {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  type: {
    type: DataTypes.ENUM('cash', 'card', 'bank_transfer', 'check', 'digital_wallet'),
    allowNull: false,
  },
  provider: {
    type: DataTypes.STRING, // Visa, Mastercard, PayPal, etc.
  },
  lastFour: {
    type: DataTypes.STRING(4), // Últimos 4 dígitos de tarjeta
  },
  expiryMonth: {
    type: DataTypes.INTEGER,
  },
  expiryYear: {
    type: DataTypes.INTEGER,
  },
  isDefault: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  // Datos tokenizados para seguridad (no almacenar números completos)
  token: {
    type: DataTypes.STRING,
  },
  metadata: {
    type: DataTypes.JSON, // Información adicional del método de pago
  },
});

module.exports = PaymentMethod;