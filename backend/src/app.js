const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth.routes");
const customerRoutes = require("./routes/customer.routes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/customers", customerRoutes);

module.exports = app;
