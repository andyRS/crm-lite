const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const CreditDebitNote = sequelize.define(
  "CreditDebitNote",
  {
    noteType: {
      // 'credit_note' (NCF tipo 04) o 'debit_note' (NCF tipo 03)
      type: DataTypes.ENUM("credit_note", "debit_note"),
      allowNull: false,
    },
    ncfType: {
      type: DataTypes.STRING(2),
      allowNull: false, // '03' nota débito, '04' nota crédito
    },
    ncf: {
      type: DataTypes.STRING(19),
      allowNull: false,
      unique: true,
    },
    ncfSequence_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    invoice_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    customer_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    issueDate: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    reason: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("active", "cancelled"),
      defaultValue: "active",
    },
  },
  {
    tableName: "credit_debit_notes",
    timestamps: true,
  }
);

module.exports = CreditDebitNote;
