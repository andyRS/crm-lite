const fs = require('fs').promises;
const path = require('path');

// Middleware de logging de seguridad
const securityLogger = (req, res, next) => {
  const timestamp = new Date().toISOString();
  const ip = req.ip || req.connection.remoteAddress || 'unknown';
  const userAgent = req.get('User-Agent') || 'unknown';
  const method = req.method;
  const url = req.url;
  const userId = req.user ? req.user.id : 'unauthenticated';

  // Log básico de requests
  const logEntry = `[${timestamp}] ${method} ${url} - IP: ${ip} - User: ${userId} - UA: ${userAgent.substring(0, 100)}\n`;

  // Escribir a archivo de log (en producción usar un logger como Winston)
  const logFile = path.join(__dirname, '../../logs/security.log');
  fs.appendFile(logFile, logEntry).catch(err => {
    console.error('Error writing security log:', err);
  });

  // Log en consola para desarrollo
  if (process.env.NODE_ENV !== 'production') {
    console.log(`[SECURITY] ${method} ${url} - User: ${userId} - IP: ${ip}`);
  }

  next();
};

// Función para log de eventos de seguridad críticos
const logSecurityEvent = (event, details) => {
  const timestamp = new Date().toISOString();
  const logEntry = `[${timestamp}] SECURITY EVENT: ${event} - ${JSON.stringify(details)}\n`;

  const logFile = path.join(__dirname, '../../logs/security-events.log');
  fs.appendFile(logFile, logEntry).catch(err => {
    console.error('Error writing security event log:', err);
  });

  // Log en consola con colores para eventos críticos
  console.log(`\x1b[31m[SECURITY EVENT] ${event}:\x1b[0m`, details);
};

// Middleware para detectar ataques comunes
const attackDetection = (req, res, next) => {
  const suspiciousPatterns = [
    /\.\./,  // Path traversal
    /<script/i,  // XSS attempts
    /union.*select/i,  // SQL injection
    /eval\(/i,  // Code injection
    /base64/i,  // Potential encoded attacks
  ];

  const checkString = JSON.stringify(req.body) + JSON.stringify(req.query) + req.url;

  for (const pattern of suspiciousPatterns) {
    if (pattern.test(checkString)) {
      logSecurityEvent('POTENTIAL_ATTACK_DETECTED', {
        pattern: pattern.toString(),
        ip: req.ip,
        url: req.url,
        userAgent: req.get('User-Agent'),
        body: req.body,
        query: req.query
      });

      // Opcional: bloquear la request
      // return res.status(403).json({ msg: 'Request blocked due to suspicious content' });
    }
  }

  next();
};

module.exports = {
  securityLogger,
  logSecurityEvent,
  attackDetection
};