const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const QuoteItem = sequelize.define("QuoteItem", {
  quoteId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  productId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  discount: {
    type: DataTypes.DECIMAL(5, 2),
    defaultValue: 0,
  },
});

module.exports = QuoteItem;