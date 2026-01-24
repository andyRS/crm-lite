const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const Order = sequelize.define("Order", {
  orderNumber: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'),
    defaultValue: 'pending',
  },
  paymentStatus: {
    type: DataTypes.ENUM('unpaid', 'partial', 'paid', 'refunded', 'overpaid'),
    defaultValue: 'unpaid',
  },
  subtotal: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0
    }
  },
  taxAmount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
    validate: {
      min: 0
    }
  },
  discountAmount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
    validate: {
      min: 0
    }
  },
  total: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0
    }
  },
  currency: {
    type: DataTypes.STRING(3),
    defaultValue: 'USD',
  },
  notes: {
    type: DataTypes.TEXT,
  },
  orderDate: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  deliveryDate: {
    type: DataTypes.DATE,
  },
  // Información de envío
  shippingAddress: {
    type: DataTypes.TEXT,
  },
  shippingMethod: {
    type: DataTypes.STRING,
  },
  shippingCost: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
    validate: {
      min: 0
    }
  },
  trackingNumber: {
    type: DataTypes.STRING,
  },
  // Información adicional
  priority: {
    type: DataTypes.ENUM('low', 'normal', 'high', 'urgent'),
    defaultValue: 'normal',
  },
  source: {
    type: DataTypes.ENUM('web', 'phone', 'email', 'in_person', 'api'),
    defaultValue: 'web',
  },
  // Metadata
  metadata: {
    type: DataTypes.JSON,
  },
});

module.exports = Order;