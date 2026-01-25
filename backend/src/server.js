require("dotenv").config();

// Validar variables de entorno antes de iniciar
const { validateEnv, getConfig } = require('./config/env.config');
try {
  validateEnv();
} catch (error) {
  console.error('\n❌ Error de configuración:', error.message);
  process.exit(1);
}

const app = require("./app");
const { connectDB, sequelize } = require("./config/db");
const http = require('http');
const socketIo = require('socket.io');
const { createNotification } = require('./controllers/notification.controller');
const logger = require('./utils/logger');

const config = getConfig();

// Inicializar servidor HTTP
const server = http.createServer(app);

// Configurar Socket.IO - TEMPORALMENTE DESHABILITADO PARA DEBUG
/*
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true
  },
  // Evitar que Socket.IO interfiera con rutas HTTP normales
  allowEIO3: true,
  transports: ['websocket', 'polling']
});

// Conexiones de Socket.IO
io.on('connection', (socket) => {
  console.log('Usuario conectado:', socket.id);

  // Unir usuario a su sala personal
  socket.on('join', (userId) => {
    socket.join(`user_${userId}`);
    console.log(`Usuario ${userId} se unió a su sala`);
  });

  socket.on('disconnect', () => {
    console.log('Usuario desconectado:', socket.id);
  });
});

// Hacer io disponible globalmente para enviar notificaciones
global.io = io;
*/

connectDB();

// Sincronización de base de datos
sequelize.sync().then(() => {
  const PORT = config.port;
  server.listen(PORT, () => {
    console.log('\n🚀 ================================');
    console.log('   CRM Lite Server');
    console.log('================================');
    console.log(`✅ Servidor iniciado correctamente`);
    console.log(`🌐 http://localhost:${PORT}`);
    console.log(`📊 Base de datos conectada`);
    console.log(`🔧 Entorno: ${config.env}`);
    console.log('================================\n');
  });
}).catch((error) => {
  console.error('\n❌ Error al iniciar el servidor:');
  console.error('   ' + error.message);
  process.exit(1);
});
