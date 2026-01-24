const bcrypt = require("../../node_modules/bcryptjs/umd");
const jwt = require("jsonwebtoken");
const { User } = require("../models");

// Configuración de seguridad
const BCRYPT_ROUNDS = parseInt(process.env.BCRYPT_ROUNDS) || 12;
const MAX_LOGIN_ATTEMPTS = parseInt(process.env.MAX_LOGIN_ATTEMPTS) || 5;
const LOCKOUT_TIME = parseInt(process.env.LOCKOUT_TIME) || 15 * 60 * 1000; // 15 minutos

// Función para validar contraseña segura
const validatePasswordStrength = (password) => {
  const errors = [];

  if (password.length < 8) {
    errors.push('La contraseña debe tener al menos 8 caracteres');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('La contraseña debe contener al menos una letra minúscula');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('La contraseña debe contener al menos una letra mayúscula');
  }

  if (!/\d/.test(password)) {
    errors.push('La contraseña debe contener al menos un número');
  }

  if (!/[@$!%*?&]/.test(password)) {
    errors.push('La contraseña debe contener al menos un carácter especial (@$!%*?&)');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Función para logging de seguridad
const logSecurityEvent = (event, details) => {
  const timestamp = new Date().toISOString();
  console.log(`[SECURITY ${timestamp}] ${event}:`, details);
};

/**
 * REGISTER
 * - Valida campos y contraseña segura
 * - Hashea password con rounds configurables
 * - NO devuelve password
 * - Log de registro
 */
exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // 🔐 Validaciones básicas
    if (!name || !email || !password) {
      return res.status(400).json({
        msg: "Nombre, email y password son obligatorios",
      });
    }

    // Validar fortaleza de contraseña
    const passwordValidation = validatePasswordStrength(password);
    if (!passwordValidation.isValid) {
      return res.status(400).json({
        msg: "Contraseña no cumple con los requisitos de seguridad",
        errors: passwordValidation.errors
      });
    }

    // Verificar si el usuario ya existe
    const exists = await User.findOne({ where: { email } });
    if (exists) {
      logSecurityEvent('REGISTRATION_ATTEMPT_DUPLICATE_EMAIL', { email, ip: req.ip });
      return res.status(409).json({
        msg: "El email ya está registrado",
      });
    }

    const hashed = await bcrypt.hash(password, BCRYPT_ROUNDS);

    const user = await User.create({
      name,
      email,
      password: hashed,
      role: role || 'user',
    });

    // Log de registro exitoso
    logSecurityEvent('USER_REGISTERED', {
      userId: user.id,
      email: user.email,
      role: user.role,
      ip: req.ip
    });

    // ✅ RESPUESTA SEGURA (SIN PASSWORD)
    res.status(201).json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
    });
  } catch (error) {
    console.error("Error register:", error);
    res.status(500).json({ msg: "Error al registrar usuario" });
  }
};

/**
 * LOGIN
 * - Verifica credenciales
 * - Implementa protección contra fuerza bruta
 * - Genera JWT con expiración configurable
 * - Log de eventos de seguridad
 */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validaciones
    if (!email || !password) {
      logSecurityEvent('LOGIN_ATTEMPT_MISSING_CREDENTIALS', { ip: req.ip });
      return res.status(400).json({
        msg: "Email y password son obligatorios",
      });
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
      logSecurityEvent('LOGIN_ATTEMPT_USER_NOT_FOUND', { email, ip: req.ip });
      return res.status(401).json({ msg: "Credenciales inválidas" });
    }

    // Verificar si la cuenta está bloqueada por intentos fallidos
    if (user.lockedUntil && user.lockedUntil > new Date()) {
      const remainingTime = Math.ceil((user.lockedUntil - new Date()) / 1000 / 60);
      logSecurityEvent('LOGIN_ATTEMPT_ACCOUNT_LOCKED', {
        userId: user.id,
        email: user.email,
        remainingMinutes: remainingTime,
        ip: req.ip
      });
      return res.status(429).json({
        msg: `Cuenta bloqueada. Intenta nuevamente en ${remainingTime} minutos.`
      });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      // Incrementar contador de intentos fallidos
      const failedAttempts = (user.failedLoginAttempts || 0) + 1;

      if (failedAttempts >= MAX_LOGIN_ATTEMPTS) {
        // Bloquear cuenta
        const lockedUntil = new Date(Date.now() + LOCKOUT_TIME);
        await user.update({
          failedLoginAttempts: failedAttempts,
          lockedUntil: lockedUntil
        });

        logSecurityEvent('ACCOUNT_LOCKED_BRUTE_FORCE', {
          userId: user.id,
          email: user.email,
          failedAttempts,
          ip: req.ip
        });

        return res.status(429).json({
          msg: `Cuenta bloqueada por múltiples intentos fallidos. Intenta nuevamente en 15 minutos.`
        });
      } else {
        await user.update({ failedLoginAttempts: failedAttempts });
        logSecurityEvent('LOGIN_FAILED_INVALID_PASSWORD', {
          userId: user.id,
          email: user.email,
          failedAttempts,
          ip: req.ip
        });
      }

      return res.status(401).json({ msg: "Credenciales inválidas" });
    }

    // Login exitoso - resetear contador de intentos fallidos
    await user.update({
      failedLoginAttempts: 0,
      lockedUntil: null,
      lastLogin: new Date()
    });

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.SESSION_TIMEOUT || "1d" }
    );

    logSecurityEvent('LOGIN_SUCCESSFUL', {
      userId: user.id,
      email: user.email,
      role: user.role,
      ip: req.ip
    });

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Error login:", error);
    logSecurityEvent('LOGIN_ERROR', { error: error.message, ip: req.ip });
    res.status(500).json({ msg: "Error al iniciar sesión" });
  }
};

/**
 * LOGOUT
 * - Invalida el token incrementando la versión
 * - Log del evento de seguridad
 */
exports.logout = async (req, res) => {
  try {
    // Incrementar la versión del token para invalidar tokens anteriores
    await User.increment('tokenVersion', { where: { id: req.user.id } });

    logSecurityEvent('LOGOUT_SUCCESSFUL', {
      userId: req.user.id,
      email: req.user.email,
      ip: req.ip
    });

    res.json({ msg: "Sesión cerrada exitosamente" });
  } catch (error) {
    console.error("Error logout:", error);
    logSecurityEvent('LOGOUT_ERROR', {
      userId: req.user.id,
      error: error.message,
      ip: req.ip
    });
    res.status(500).json({ msg: "Error al cerrar sesión" });
  }
};
