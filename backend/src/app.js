const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

const { securityLogger, attackDetection } = require('./middlewares/security.middleware');

// Importar rutas
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const customerRoutes = require('./routes/customer.routes');
const dashboardRoutes = require('./routes/dashboard.routes');
const productRoutes = require('./routes/product.routes');
const categoryRoutes = require('./routes/category.routes');
const orderRoutes = require('./routes/order.routes');
const notificationRoutes = require('./routes/notification.routes');
const quoteRoutes = require('./routes/quote.routes');
const reportRoutes = require('./routes/report.routes');
const paymentRoutes = require('./routes/payment.routes');
const invoiceRoutes = require('./routes/invoice.routes');
const stripeRoutes = require('./routes/stripe.routes');

const app = express();

// CORS Habilitado - Permitir múltiples puertos de desarrollo
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Middlewares de seguridad - TEMPORALMENTE DESHABILITADO PARA DEBUG
/*
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));
*/

// Rate limiting - TEMPORALMENTE DESHABILITADO PARA DEBUG
/*
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
  skipSuccessfulRequests: true, // No contar requests exitosos
});

// Rate limiting para creación de recursos
const createLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 20, // límite de 20 creaciones por windowMs
  message: "Demasiadas creaciones, por favor intenta más tarde.",
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiting para endpoints de búsqueda
const searchLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 50, // límite de 50 búsquedas por windowMs
  message: "Demasiadas búsquedas, por favor intenta más tarde.",
  standardHeaders: true,
  legacyHeaders: false,
});

app.use("/api/auth/login", authLimiter);
app.use("/api/auth/register", createLimiter);
app.use("/api/users", createLimiter);
app.use("/api/customers", createLimiter);
app.use("/api/products", createLimiter);
app.use("/api/orders", createLimiter);
*/

/*
// app.use(cors({
  origin: function (origin, callback) {
    // Permitir requests sin origin (como mobile apps o curl)
    if (!origin) return callback(null, true);

    const allowedOrigins = [
      'http://localhost:5173',  // Vite dev server
      'http://localhost:3000',  // React dev server
      'http://127.0.0.1:5173',
      'http://127.0.0.1:3000'
    ];

    // En producción, verificar que el origen esté en la lista permitida
    if (process.env.NODE_ENV === 'production') {
      // Solo permitir dominios específicos en producción
      const isAllowed = allowedOrigins.some(allowed => origin.startsWith(allowed.split(':')[1]));
      if (isAllowed) {
        return callback(null, true);
      } else {
        return callback(new Error('Not allowed by CORS'));
      }
    }

    // En desarrollo, permitir localhost
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));
*/

// app.use(express.json({ limit: '10mb' }));
// app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Middlewares de seguridad y logging
// app.use(securityLogger);
// app.use(attackDetection);

// Sanitización avanzada de inputs (prevención XSS) - TEMPORALMENTE DESHABILITADA
/*
app.use((req, res, next) => {
  // Función para sanitizar strings
  const sanitizeString = (str) => {
    if (typeof str !== 'string') return str;
    return str
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<[^>]*>/g, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '')
      .replace(/vbscript:/gi, '')
      .replace(/data:text\/html/gi, '')
      .trim();
  };

  // Función para sanitizar objetos recursivamente
  const sanitizeObject = (obj) => {
    for (const key in obj) {
      if (typeof obj[key] === 'string') {
        obj[key] = sanitizeString(obj[key]);
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        sanitizeObject(obj[key]);
      }
    }
  };

  // Sanitizar body, query y params
  if (req.body && typeof req.body === 'object') {
    sanitizeObject(req.body);
  }
  if (req.query && typeof req.query === 'object') {
    sanitizeObject(req.query);
  }
  if (req.params && typeof req.params === 'object') {
    sanitizeObject(req.params);
  }

  next();
});
*/

// Middleware de paginación
const { paginationMiddleware } = require('./utils/pagination');
app.use(paginationMiddleware);

// Rutas de la API
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/quotes", quoteRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/invoices", invoiceRoutes);
app.use("/api/stripe", stripeRoutes);

// Endpoint de salud del servidor
app.get("/health", (req, res) => {
  res.json({ 
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Endpoint de prueba simple
app.get("/test", (req, res) => {
  res.json({ message: "Server is working!", timestamp: new Date().toISOString() });
});

// Manejo de rutas no encontradas
const { notFound, errorHandler } = require('./middlewares/errorHandler.middleware');
app.use(notFound);

// Middleware global de manejo de errores (debe ser el último)
app.use(errorHandler);

module.exports = app;
