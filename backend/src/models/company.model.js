const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

// Singleton: siempre existe una única fila con id = 1 (instancia por empresa, no multi-tenant)
const Company = sequelize.define(
  "Company",
  {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    rnc: {
      type: DataTypes.STRING(11),
      allowNull: false,
      validate: {
        is: /^[0-9]{9}$|^[0-9]{11}$/, // RNC (9 dígitos) o Cédula de negocio unipersonal (11 dígitos)
      },
    },
    email: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: { isEmail: true },
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    address: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    defaultCurrency: {
      type: DataTypes.ENUM("DOP", "USD"),
      defaultValue: "DOP",
    },
    defaultTaxRate: {
      type: DataTypes.DECIMAL(5, 2),
      defaultValue: 18.0,
    },
    logoUrl: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    bankName: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    bankAccountHolder: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    bankAccountNumber: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    primaryColor: {
      type: DataTypes.STRING,
      defaultValue: "#4F46E5",
    },
    secondaryColor: {
      type: DataTypes.STRING,
      defaultValue: "#6B7280",
    },
    invoiceFooterNotes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: "company",
    timestamps: true,
  }
);

module.exports = Company;
