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
    allowNull: false,
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
});

module.exports = Quote;