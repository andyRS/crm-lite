const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const Invoice = sequelize.define(
  "Invoice",
  {
    invoiceNumber: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    customer_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    order_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    invoiceDate: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    dueDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    subtotal: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.00,
    },
    taxRate: {
      type: DataTypes.DECIMAL(5, 2),
      defaultValue: 18.00, // 18% ITBIS en República Dominicana
    },
    taxAmount: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.00,
    },
    discountAmount: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.00,
    },
    total: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('draft', 'pending', 'paid', 'overdue', 'cancelled'),
      defaultValue: 'draft',
    },
    paymentMethod: {
      type: DataTypes.ENUM('cash', 'card', 'transfer', 'check', 'other'),
      allowNull: true,
    },
    currency: {
      type: DataTypes.ENUM('DOP', 'USD'),
      defaultValue: 'DOP',
      allowNull: false,
      comment: 'Moneda: DOP (Pesos Dominicanos) o USD (Dólares)'
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    paidAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: "invoices",
    timestamps: true,
  }
);

module.exports = Invoice;
