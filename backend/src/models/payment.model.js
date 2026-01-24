const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const Payment = sequelize.define("Payment", {
  paymentNumber: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  currency: {
    type: DataTypes.STRING(3),
    defaultValue: 'USD',
  },
  status: {
    type: DataTypes.ENUM('pending', 'processing', 'completed', 'failed', 'refunded', 'cancelled'),
    defaultValue: 'pending',
  },
  paymentDate: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  processedAt: {
    type: DataTypes.DATE,
  },
  reference: {
    type: DataTypes.STRING, // Referencia externa del pago
  },
  notes: {
    type: DataTypes.TEXT,
  },
  // Información de procesamiento
  gatewayResponse: {
    type: DataTypes.JSON, // Respuesta completa del gateway de pago
  },
  errorMessage: {
    type: DataTypes.TEXT,
  },
  // Información de reembolso
  refundAmount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
  },
  refundDate: {
    type: DataTypes.DATE,
  },
  refundReason: {
    type: DataTypes.TEXT,
  },
});

module.exports = Payment;