const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const Notification = sequelize.define("Notification", {
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  type: {
    type: DataTypes.ENUM('info', 'success', 'warning', 'error'),
    defaultValue: 'info',
  },
  read: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  relatedId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  relatedType: {
    type: DataTypes.ENUM('order', 'customer', 'product', 'system'),
    allowNull: true,
  },
});

module.exports = Notification;