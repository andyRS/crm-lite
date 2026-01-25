/**
 * Middleware global de manejo de errores
 * Centraliza el manejo de errores para toda la aplicación
 */

class AppError extends Error {
  constructor(message, statusCode, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }
}

// Errores específicos
class ValidationError extends AppError {
  constructor(message) {
    super(message, 400);
  }
}

class NotFoundError extends AppError {
  constructor(resource) {
    super(`${resource} no encontrado`, 404);
  }
}

class UnauthorizedError extends AppError {
  constructor(message = 'No autorizado') {
    super(message, 401);
  }
}

class ForbiddenError extends AppError {
  constructor(message = 'Acceso denegado') {
    super(message, 403);
  }
}

class ConflictError extends AppError {
  constructor(message) {
    super(message, 409);
  }
}

// Manejo de errores de Sequelize
const handleSequelizeError = (err) => {
  if (err.name === 'SequelizeValidationError') {
    const errors = err.errors.map(e => e.message);
    return new ValidationError(`Errores de validación: ${errors.join(', ')}`);
  }
  
  if (err.name === 'SequelizeUniqueConstraintError') {
    const field = err.errors[0].path;
    return new ConflictError(`El ${field} ya existe en el sistema`);
  }
  
  if (err.name === 'SequelizeForeignKeyConstraintError') {
    return new ValidationError('Referencia inválida a otro recurso');
  }
  
  if (err.name === 'SequelizeDatabaseError') {
    return new AppError('Error de base de datos', 500, false);
  }

  return err;
};

// Manejo de errores de JWT
const handleJWTError = () => new UnauthorizedError('Token inválido');
const handleJWTExpiredError = () => new UnauthorizedError('Token expirado');

// Enviar error en desarrollo
const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack
  });
};

// Enviar error en producción
const sendErrorProd = (err, res) => {
  // Error operacional confiable: enviar mensaje al cliente
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message
    });
  } 
  // Error de programación u otro error desconocido: no filtrar detalles
  else {
    console.error('ERROR 💥', err);
    res.status(500).json({
      status: 'error',
      message: 'Algo salió muy mal'
    });
  }
};

// Middleware global de manejo de errores
const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else {
    let error = { ...err };
    error.message = err.message;

    // Manejo de errores específicos
    if (err.name === 'JsonWebTokenError') error = handleJWTError();
    if (err.name === 'TokenExpiredError') error = handleJWTExpiredError();
    if (err.name?.startsWith('Sequelize')) error = handleSequelizeError(err);
    
    sendErrorProd(error, res);
  }
};

// Middleware para capturar errores asíncronos
const catchAsync = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};

// Middleware para rutas no encontradas
const notFound = (req, res, next) => {
  const err = new NotFoundError(`Ruta ${req.originalUrl}`);
  next(err);
};

module.exports = {
  AppError,
  ValidationError,
  NotFoundError,
  UnauthorizedError,
  ForbiddenError,
  ConflictError,
  errorHandler,
  catchAsync,
  notFound
};
