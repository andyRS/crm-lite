const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const InvoiceItem = sequelize.define(
  "InvoiceItem",
  {
    invoice_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    product_id: {
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
    total: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
  },
  {
    tableName: "invoice_items",
    timestamps: true,
  }
);

module.exports = InvoiceItem;
