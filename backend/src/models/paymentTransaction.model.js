const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const PaymentTransaction = sequelize.define("PaymentTransaction", {
  transactionId: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  type: {
    type: DataTypes.ENUM('charge', 'refund', 'authorization', 'capture', 'void'),
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('pending', 'success', 'failed', 'cancelled'),
    defaultValue: 'pending',
  },
  gateway: {
    type: DataTypes.STRING, // stripe, paypal, mercadopago, etc.
  },
  gatewayTransactionId: {
    type: DataTypes.STRING,
  },
  gatewayResponse: {
    type: DataTypes.JSON,
  },
  processedAt: {
    type: DataTypes.DATE,
  },
  errorCode: {
    type: DataTypes.STRING,
  },
  errorMessage: {
    type: DataTypes.TEXT,
  },
  metadata: {
    type: DataTypes.JSON,
  },
});

module.exports = PaymentTransaction;