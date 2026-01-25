/**
 * Validación y configuración de variables de entorno
 * Asegura que todas las variables necesarias estén configuradas
 */

require('dotenv').config();

const requiredEnvVars = [
  'DB_NAME',
  'DB_USER',
  'DB_PASSWORD',
  'DB_HOST',
  'JWT_SECRET'
];

const optionalEnvVars = {
  DB_PORT: '3306',
  PORT: '5000',
  NODE_ENV: 'development',
  LOG_TO_FILE: 'false',
  LOG_LEVEL: 'INFO',
  SESSION_TIMEOUT: '1d',
  BCRYPT_ROUNDS: '12',
  MAX_LOGIN_ATTEMPTS: '5',
  LOCKOUT_TIME: '900000', // 15 minutos en ms
  CORS_ORIGIN: 'http://localhost:5173'
};

/**
 * Valida que existan todas las variables de entorno requeridas
 * @throws {Error} Si falta alguna variable requerida
 */
function validateEnv() {
  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

  if (missingVars.length > 0) {
    throw new Error(
      `❌ Faltan las siguientes variables de entorno requeridas: ${missingVars.join(', ')}\n` +
      `Por favor, crea un archivo .env basado en .env.example`
    );
  }

  // Advertencias para variables opcionales no configuradas (solo en desarrollo)
  if (process.env.NODE_ENV === 'development') {
    Object.entries(optionalEnvVars).forEach(([varName, defaultValue]) => {
      if (!process.env[varName]) {
        process.env[varName] = defaultValue;
      }
    });
  } else {
    // En producción, solo asignar valores por defecto sin mostrar advertencias
    Object.entries(optionalEnvVars).forEach(([varName, defaultValue]) => {
      if (!process.env[varName]) {
        process.env[varName] = defaultValue;
      }
    });
  }

  // Validaciones específicas
  if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
    console.warn('⚠️  JWT_SECRET es muy corto. Se recomienda al menos 32 caracteres para seguridad.');
  }

  if (process.env.NODE_ENV === 'production' && process.env.DB_PASSWORD === 'password') {
    throw new Error('❌ No uses la contraseña por defecto en producción');
  }

  console.log('✅ Variables de entorno validadas correctamente');
}

/**
 * Obtiene la configuración completa de la aplicación
 * @returns {Object} Configuración de la aplicación
 */
function getConfig() {
  return {
    env: process.env.NODE_ENV || 'development',
    port: parseInt(process.env.PORT) || 5000,
    database: {
      name: process.env.DB_NAME,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT) || 3306
    },
    jwt: {
      secret: process.env.JWT_SECRET,
      expiresIn: process.env.SESSION_TIMEOUT || '1d'
    },
    security: {
      bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS) || 12,
      maxLoginAttempts: parseInt(process.env.MAX_LOGIN_ATTEMPTS) || 5,
      lockoutTime: parseInt(process.env.LOCKOUT_TIME) || 900000
    },
    cors: {
      origin: process.env.CORS_ORIGIN || 'http://localhost:5173'
    },
    logging: {
      toFile: process.env.LOG_TO_FILE === 'true',
      level: process.env.LOG_LEVEL || 'INFO'
    },
    email: {
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT) || 587,
      user: process.env.EMAIL_USER,
      password: process.env.EMAIL_PASS,
      enabled: !!(process.env.EMAIL_USER && process.env.EMAIL_PASS)
    },
    payments: {
      defaultGateway: process.env.DEFAULT_PAYMENT_GATEWAY || 'stripe',
      stripe: {
        secretKey: process.env.STRIPE_SECRET_KEY,
        publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
        enabled: !!process.env.STRIPE_SECRET_KEY
      }
    }
  };
}

module.exports = {
  validateEnv,
  getConfig
};
