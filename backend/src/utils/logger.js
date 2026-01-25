/**
 * Sistema de logging mejorado
 * Proporciona logging estructurado para debugging y monitoreo
 */

const fs = require('fs');
const path = require('path');

// Crear directorio de logs si no existe
const logsDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

const LOG_LEVELS = {
  ERROR: 'ERROR',
  WARN: 'WARN',
  INFO: 'INFO',
  DEBUG: 'DEBUG'
};

class Logger {
  constructor() {
    this.logToFile = process.env.LOG_TO_FILE === 'true';
    this.logLevel = process.env.LOG_LEVEL || 'INFO';
  }

  formatMessage(level, message, meta = {}) {
    const timestamp = new Date().toISOString();
    const metaStr = Object.keys(meta).length > 0 ? JSON.stringify(meta) : '';
    return `[${timestamp}] [${level}] ${message} ${metaStr}\n`;
  }

  writeToFile(level, message, meta) {
    if (!this.logToFile) return;

    const logFile = path.join(logsDir, `app-${new Date().toISOString().split('T')[0]}.log`);
    const formattedMessage = this.formatMessage(level, message, meta);

    fs.appendFile(logFile, formattedMessage, (err) => {
      if (err) console.error('Error escribiendo log:', err);
    });
  }

  error(message, meta = {}) {
    console.error(`❌ ${message}`, meta);
    this.writeToFile(LOG_LEVELS.ERROR, message, meta);
  }

  warn(message, meta = {}) {
    console.warn(`⚠️  ${message}`, meta);
    this.writeToFile(LOG_LEVELS.WARN, message, meta);
  }

  info(message, meta = {}) {
    console.log(`ℹ️  ${message}`, meta);
    this.writeToFile(LOG_LEVELS.INFO, message, meta);
  }

  debug(message, meta = {}) {
    if (this.logLevel === 'DEBUG' || process.env.NODE_ENV === 'development') {
      console.log(`🔍 ${message}`, meta);
      this.writeToFile(LOG_LEVELS.DEBUG, message, meta);
    }
  }

  // Métodos específicos para contextos de negocio
  orderCreated(orderId, userId, total) {
    this.info(`Orden creada: ${orderId}`, { userId, total });
  }

  customerCreated(customerId, userId) {
    this.info(`Cliente creado: ${customerId}`, { userId });
  }

  loginAttempt(email, success, reason = '') {
    this.info(`Login attempt: ${email}`, { success, reason });
  }

  apiRequest(method, url, userId, statusCode, duration) {
    this.debug(`API Request: ${method} ${url}`, { userId, statusCode, duration });
  }
}

module.exports = new Logger();
