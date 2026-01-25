const { User } = require('../models');
const bcrypt = require('bcryptjs');
const { Op } = require('sequelize');

// Obtener todos los usuarios (solo admin)
exports.getAllUsers = async (req, res) => {
  try {
    const { user } = req;
    
    // Solo admin puede ver todos los usuarios
    if (user.role !== 'admin') {
      return res.status(403).json({ msg: 'No tienes permisos para ver usuarios' });
    }
    
    const users = await User.findAll({
      attributes: ['id', 'name', 'email', 'role', 'createdAt', 'updatedAt'],
      order: [['createdAt', 'DESC']]
    });
    
    res.json(users);
  } catch (err) {
    console.error('Error al obtener usuarios:', err);
    res.status(500).json({ msg: 'Error al obtener usuarios' });
  }
};

// Obtener un usuario por ID
exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const { user } = req;
    
    // Admin puede ver cualquier usuario, otros solo su propio perfil
    if (user.role !== 'admin' && user.id !== parseInt(id)) {
      return res.status(403).json({ msg: 'No tienes permisos para ver este usuario' });
    }
    
    const targetUser = await User.findByPk(id, {
      attributes: ['id', 'name', 'email', 'role', 'createdAt', 'updatedAt']
    });
    
    if (!targetUser) {
      return res.status(404).json({ msg: 'Usuario no encontrado' });
    }
    
    res.json(targetUser);
  } catch (err) {
    console.error('Error al obtener usuario:', err);
    res.status(500).json({ msg: 'Error al obtener usuario' });
  }
};

// Crear usuario (solo admin)
exports.createUser = async (req, res) => {
  try {
    const { user } = req;
    const { name, email, password, role } = req.body;
    
    // Solo admin puede crear usuarios
    if (user.role !== 'admin') {
      return res.status(403).json({ msg: 'No tienes permisos para crear usuarios' });
    }
    
    // Validar datos requeridos
    if (!name || !email || !password) {
      return res.status(400).json({ msg: 'Nombre, email y contraseña son obligatorios' });
    }
    
    // Verificar si el email ya existe
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ msg: 'El email ya está registrado' });
    }
    
    // Validar rol
    const validRoles = ['admin', 'manager', 'user'];
    if (role && !validRoles.includes(role)) {
      return res.status(400).json({ msg: 'Rol inválido' });
    }
    
    // Encriptar contraseña
    const hashedPassword = await bcrypt.hash(password, 12);
    
    // Crear usuario
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role || 'user'
    });
    
    // Devolver usuario sin contraseña
    const userResponse = {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      createdAt: newUser.createdAt
    };
    
    res.status(201).json(userResponse);
  } catch (err) {
    console.error('Error al crear usuario:', err);
    res.status(500).json({ msg: 'Error al crear usuario' });
  }
};

// Actualizar usuario
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { user } = req;
    const { name, email, password, role } = req.body;
    
    const targetUser = await User.findByPk(id);
    
    if (!targetUser) {
      return res.status(404).json({ msg: 'Usuario no encontrado' });
    }
    
    // Verificar permisos
    const isSelfUpdate = user.id === parseInt(id);
    const isAdmin = user.role === 'admin';
    
    if (!isSelfUpdate && !isAdmin) {
      return res.status(403).json({ msg: 'No tienes permisos para actualizar este usuario' });
    }
    
    // Solo admin puede cambiar roles
    if (role && role !== targetUser.role && !isAdmin) {
      return res.status(403).json({ msg: 'No tienes permisos para cambiar roles' });
    }
    
    // Validar email único si se está cambiando
    if (email && email !== targetUser.email) {
      const existingUser = await User.findOne({ 
        where: { 
          email,
          id: { [Op.ne]: id }
        } 
      });
      
      if (existingUser) {
        return res.status(400).json({ msg: 'El email ya está en uso' });
      }
    }
    
    // Preparar datos de actualización
    const updateData = {};
    
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (role && isAdmin) updateData.role = role;
    if (password) {
      updateData.password = await bcrypt.hash(password, 12);
    }
    
    // Actualizar usuario
    await targetUser.update(updateData);
    
    // Devolver usuario actualizado sin contraseña
    const updatedUser = {
      id: targetUser.id,
      name: targetUser.name,
      email: targetUser.email,
      role: targetUser.role,
      updatedAt: targetUser.updatedAt
    };
    
    res.json(updatedUser);
  } catch (err) {
    console.error('Error al actualizar usuario:', err);
    res.status(500).json({ msg: 'Error al actualizar usuario' });
  }
};

// Solicitar eliminación de usuario (users necesitan aprobación)
exports.requestDeleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { user } = req;
    
    const targetUser = await User.findByPk(id);
    
    if (!targetUser) {
      return res.status(404).json({ msg: 'Usuario no encontrado' });
    }
    
    // Admin puede eliminar directamente
    if (user.role === 'admin') {
      // No permitir auto-eliminación de admin
      if (user.id === parseInt(id)) {
        return res.status(400).json({ msg: 'No puedes eliminar tu propia cuenta de administrador' });
      }
      
      await targetUser.destroy();
      return res.json({ msg: 'Usuario eliminado exitosamente', deleted: true });
    }
    
    // Usuarios normales necesitan autorización
    // Aquí se podría implementar un sistema de notificaciones/solicitudes
    // Por ahora retornamos que necesita autorización
    return res.status(403).json({ 
      msg: 'Necesitas autorización del administrador para eliminar este usuario',
      requiresAuth: true,
      userId: id
    });
    
  } catch (err) {
    console.error('Error al procesar eliminación:', err);
    res.status(500).json({ msg: 'Error al procesar la solicitud' });
  }
};

// Eliminar usuario (solo admin)
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { user } = req;
    
    // Solo admin puede eliminar
    if (user.role !== 'admin') {
      return res.status(403).json({ msg: 'No tienes permisos para eliminar usuarios' });
    }
    
    const targetUser = await User.findByPk(id);
    
    if (!targetUser) {
      return res.status(404).json({ msg: 'Usuario no encontrado' });
    }
    
    // No permitir auto-eliminación de admin
    if (user.id === parseInt(id)) {
      return res.status(400).json({ msg: 'No puedes eliminar tu propia cuenta de administrador' });
    }
    
    await targetUser.destroy();
    
    res.json({ msg: 'Usuario eliminado exitosamente' });
  } catch (err) {
    console.error('Error al eliminar usuario:', err);
    res.status(500).json({ msg: 'Error al eliminar usuario' });
  }
};

// Cambiar contraseña
exports.changePassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { user } = req;
    const { currentPassword, newPassword } = req.body;
    
    // Solo puede cambiar su propia contraseña o admin puede cambiar cualquiera
    if (user.id !== parseInt(id) && user.role !== 'admin') {
      return res.status(403).json({ msg: 'No tienes permisos para cambiar esta contraseña' });
    }
    
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ msg: 'La nueva contraseña debe tener al menos 6 caracteres' });
    }
    
    const targetUser = await User.findByPk(id);
    
    if (!targetUser) {
      return res.status(404).json({ msg: 'Usuario no encontrado' });
    }
    
    // Si no es admin, verificar contraseña actual
    if (user.role !== 'admin') {
      if (!currentPassword) {
        return res.status(400).json({ msg: 'Debes proporcionar tu contraseña actual' });
      }
      
      const isValidPassword = await bcrypt.compare(currentPassword, targetUser.password);
      if (!isValidPassword) {
        return res.status(400).json({ msg: 'Contraseña actual incorrecta' });
      }
    }
    
    // Actualizar contraseña
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    await targetUser.update({ password: hashedPassword });
    
    res.json({ msg: 'Contraseña actualizada exitosamente' });
  } catch (err) {
    console.error('Error al cambiar contraseña:', err);
    res.status(500).json({ msg: 'Error al cambiar contraseña' });
  }
};

// Obtener estadísticas de usuarios (solo admin)
exports.getUserStats = async (req, res) => {
  try {
    const { user } = req;
    
    if (user.role !== 'admin') {
      return res.status(403).json({ msg: 'No tienes permisos para ver estadísticas' });
    }
    
    const totalUsers = await User.count();
    const adminUsers = await User.count({ where: { role: 'admin' } });
    const managerUsers = await User.count({ where: { role: 'manager' } });
    const regularUsers = await User.count({ where: { role: 'user' } });
    
    res.json({
      total: totalUsers,
      admins: adminUsers,
      managers: managerUsers,
      users: regularUsers
    });
  } catch (err) {
    console.error('Error al obtener estadísticas:', err);
    res.status(500).json({ msg: 'Error al obtener estadísticas' });
  }
};

module.exports = exports;
