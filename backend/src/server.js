require("dotenv").config();
const app = require("./app");
const { connectDB, sequelize } = require("./config/db");

connectDB();

sequelize.sync({ alter: true }).then(() => {
  console.log("📦 Modelos sincronizados");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
