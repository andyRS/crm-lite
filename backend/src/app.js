const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

const authRoutes = require("./routes/auth.routes");
const customerRoutes = require("./routes/customer.routes");
const dashboardRoutes = require("./routes/dashboard.routes");
const productRoutes = require("./routes/product.routes");
const categoryRoutes = require("./routes/category.routes");
const orderRoutes = require("./routes/order.routes");
const notificationRoutes = require("./routes/notification.routes");
const quoteRoutes = require("./routes/quote.routes");
const reportRoutes = require("./routes/report.routes");
const paymentRoutes = require("./routes/payment.routes");

const app = express();

// Middlewares de seguridad
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // límite de 100 requests por windowMs
  message: "Demasiadas solicitudes desde esta IP, por favor intenta más tarde.",
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(limiter);

// Rate limiting más estricto para rutas de autenticación
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // límite de 5 requests por windowMs
  message: "Demasiados intentos de login, por favor intenta más tarde.",
  standardHeaders: true,
  legacyHeaders: false,
});

app.use("/api/auth/login", authLimiter);

app.use(cors({
  origin: process.env.CORS_ORIGIN || "http://localhost:5173",
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Sanitización básica de inputs
app.use((req, res, next) => {
  for (const key in req.body) {
    if (typeof req.body[key] === 'string') {
      req.body[key] = req.body[key].trim();
    }
  }
  next();
});

app.use("/api/auth", authRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/quotes", quoteRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/payments", paymentRoutes);

module.exports = app;
