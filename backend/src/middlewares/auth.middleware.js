const jwt = require("jsonwebtoken");
const { User } = require("../models");

const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ msg: "Token requerido" });
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ msg: "Formato de token inválido" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Verificar si el usuario existe
    const user = await User.findByPk(decoded.id);
    if (!user) {
      return res.status(401).json({ msg: "Usuario no encontrado" });
    }

    // Verificar si el token ha sido invalidado (por cambio de contraseña o logout)
    if (user.tokenVersion !== decoded.tokenVersion) {
      return res.status(401).json({ msg: "Token inválido - por favor inicia sesión nuevamente" });
    }

    // Verificar si la cuenta está bloqueada
    if (user.lockedUntil && user.lockedUntil > new Date()) {
      return res.status(401).json({ msg: "Cuenta temporalmente suspendida" });
    }

    req.user = {
      id: user.id,
      role: user.role,
      email: user.email
    };

    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ msg: "Token expirado - por favor inicia sesión nuevamente" });
    } else if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ msg: "Token inválido" });
    } else {
      console.error('Error en verificación de token:', err);
      return res.status(500).json({ msg: "Error interno del servidor" });
    }
  }
};

module.exports = authMiddleware;
