const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const Product = sequelize.define("Product", {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [2, 200]
    }
  },
  description: {
    type: DataTypes.TEXT,
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0
    }
  },
  cost: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
    validate: {
      min: 0
    }
  },
  stock: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    validate: {
      min: 0
    }
  },
  minStock: {
    type: DataTypes.INTEGER,
    defaultValue: 5,
    validate: {
      min: 0
    }
  },
  maxStock: {
    type: DataTypes.INTEGER,
    validate: {
      min: 0
    }
  },
  sku: {
    type: DataTypes.STRING,
    unique: true,
    validate: {
      len: [3, 50]
    }
  },
  barcode: {
    type: DataTypes.STRING,
  },
  weight: {
    type: DataTypes.DECIMAL(8, 3),
    validate: {
      min: 0
    }
  },
  dimensions: {
    type: DataTypes.JSON, // {length, width, height, unit}
  },
  active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  taxable: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  taxRate: {
    type: DataTypes.DECIMAL(5, 2),
    defaultValue: 0,
  },
  // Control de inventario
  trackInventory: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  allowBackorders: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  // Metadata
  metadata: {
    type: DataTypes.JSON,
  },
});

module.exports = Product;