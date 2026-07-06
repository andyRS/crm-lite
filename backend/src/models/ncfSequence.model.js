const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

// Catálogo oficial DGII de tipos de comprobante fiscal (los más relevantes para pyme)
const NCF_TYPES = ["01", "02", "03", "04", "11", "14", "15", "16"];

const NcfSequence = sequelize.define(
  "NcfSequence",
  {
    fiscalType: {
      // 'ncf' = comprobante tradicional por rango autorizado. 'ecf' = factura electrónica DGII (preparado, sin firmar/enviar aún)
      type: DataTypes.ENUM("ncf", "ecf"),
      defaultValue: "ncf",
      allowNull: false,
    },
    ncfType: {
      type: DataTypes.STRING(2),
      allowNull: false,
      validate: {
        isIn: [NCF_TYPES],
      },
    },
    prefix: {
      // Letra de serie DGII, ej. 'B' para NCF tradicional o 'E' para e-CF
      type: DataTypes.STRING(1),
      defaultValue: "B",
    },
    rangeStart: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    rangeEnd: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    currentNumber: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    expirationDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    alertThreshold: {
      // Avisar cuando queden <= N comprobantes disponibles
      type: DataTypes.INTEGER,
      defaultValue: 50,
    },
  },
  {
    tableName: "ncf_sequences",
    timestamps: true,
  }
);

NcfSequence.NCF_TYPES = NCF_TYPES;

module.exports = NcfSequence;
