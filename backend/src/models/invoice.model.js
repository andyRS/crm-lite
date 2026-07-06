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
      type: DataTypes.ENUM('draft', 'pending', 'paid', 'overdue', 'cancelled', 'credited'),
      defaultValue: 'draft',
    },
    fiscalType: {
      // 'ncf' = comprobante tradicional. 'ecf' = factura electrónica DGII (preparado para cuando aplique)
      type: DataTypes.ENUM('ncf', 'ecf'),
      defaultValue: 'ncf',
      allowNull: false,
    },
    ncfType: {
      // Catálogo DGII: 01 Consumidor Final, 02 Crédito Fiscal, 14 Régimen Especial, etc.
      type: DataTypes.STRING(2),
      allowNull: true,
    },
    ncf: {
      type: DataTypes.STRING(19),
      allowNull: true,
      unique: true,
    },
    ncfSequence_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    retentionApplies: {
      // Informativo: cuánto le retendrá el cliente (Estado/Gran Contribuyente) a esta pyme al pagar
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    itbisRetentionPercentage: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
    },
    itbisRetentionAmount: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.00,
    },
    isrRetentionPercentage: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
    },
    isrRetentionAmount: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.00,
    },
    netTotal: {
      // Total menos retenciones informativas: lo que efectivamente cobra la pyme
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
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
