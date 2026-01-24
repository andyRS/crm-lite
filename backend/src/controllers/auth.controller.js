const bcrypt = require("../../node_modules/bcryptjs/umd");
const jwt = require("jsonwebtoken");
const { User } = require("../models");

/**
 * REGISTER
 * - Valida campos
 * - Hashea password
 * - NO devuelve password
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

    // Verificar si el usuario ya existe
    const exists = await User.findOne({ where: { email } });
    if (exists) {
      return res.status(409).json({
        msg: "El email ya está registrado",
      });
    }

    const hashed = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashed,
      role: role || 'user', // default to user if not provided
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
 * - Genera JWT
 */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validaciones
    if (!email || !password) {
      return res.status(400).json({
        msg: "Email y password son obligatorios",
      });
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ msg: "Usuario no existe" });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ msg: "Credenciales inválidas" });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

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
    res.status(500).json({ msg: "Error al iniciar sesión" });
  }
};
