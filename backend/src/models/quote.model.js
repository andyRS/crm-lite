const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const Quote = sequelize.define("Quote", {
  quoteNumber: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
  },
  customerId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('draft', 'sent', 'approved', 'rejected', 'expired'),
    defaultValue: 'draft',
  },
  total: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  validUntil: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  notes: {
    type: DataTypes.TEXT,
  },
  discount: {
    type: DataTypes.DECIMAL(5, 2),
    defaultValue: 0,
  },
  currency: {
    type: DataTypes.ENUM('DOP', 'USD'),
    defaultValue: 'DOP',
    allowNull: false,
    comment: 'Moneda: DOP (Pesos Dominicanos) o USD (Dólares)'
  },
  // Información de cliente no registrado
  clientName: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Nombre del cliente (para clientes no registrados)'
  },
  clientEmail: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Email del cliente (para clientes no registrados)'
  },
  clientPhone: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Teléfono del cliente (para clientes no registrados)'
  },
  clientCompany: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Empresa del cliente (para clientes no registrados)'
  },
});

module.exports = Quote;