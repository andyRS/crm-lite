require("dotenv").config();
const app = require("./app");
const { connectDB, sequelize } = require("./config/db");
const http = require('http');
const socketIo = require('socket.io');
const { createNotification } = require('./controllers/notification.controller');

// Inicializar servidor HTTP
const server = http.createServer(app);

// Configurar Socket.IO
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"]
  }
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

connectDB();

sequelize.sync().then(() => {
  console.log("📦 Modelos sincronizados");

  // Iniciar tareas programadas después de sincronizar la BD
  require('./services/cron.service');
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 WebSocket server ready`);
});
