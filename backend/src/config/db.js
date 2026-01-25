const Sequelize = require("sequelize");

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: "mysql",
    logging: false,
    pool: {
      max: 10,
      min: 0,
      acquire: 60000,
      idle: 10000,
      evict: 1000
    },
    dialectOptions: {
      connectTimeout: 60000,
      decimalNumbers: true
    },
    retry: {
      max: 3
    },
    define: {
      timestamps: true,
      underscored: false,
      freezeTableName: false
    }
  }
);

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    // Silencioso - el mensaje se mostrará en server.js
  } catch (error) {
    console.error("❌ Error al conectar con MySQL:", error.message);
    process.exit(1);
  }
};

module.exports = { sequelize, connectDB };
