const { Notification } = require("../models");

exports.getAll = async (req, res) => {
  try {
    const { Op } = require('sequelize');
    
    // Excluir notificaciones genéricas de bienvenida/prueba
    const excludePatterns = [
      'Bienvenido al sistema',
      'Tu cuenta ha sido configurada',
      'sistema ERP',
      'Algunos productos necesitan reabastecimiento' // Mensajes genéricos sin datos específicos
    ];
    
    const notifications = await Notification.findAll({
      where: {
        userId: req.user.id,
        [Op.and]: excludePatterns.map(pattern => ({
          title: { [Op.notLike]: `%${pattern}%` },
          message: { [Op.notLike]: `%${pattern}%` }
        }))
      },
      order: [['createdAt', 'DESC']],
      limit: 50
    });
    res.json(notifications);
  } catch (error) {
    console.error("Error getting notifications:", error);
    res.status(500).json({ msg: "Error al obtener notificaciones" });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const notification = await Notification.findByPk(id);

    if (!notification) {
      return res.status(404).json({ message: "Notificación no encontrada" });
    }

    if (notification.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ msg: "No tienes permisos para esta notificación" });
    }

    await notification.update({ read: true });
    res.json({ msg: "Notificación marcada como leída" });
  } catch (error) {
    console.error("Error marking notification as read:", error);
    res.status(500).json({ message: "Error al marcar notificación como leída" });
  }
};

exports.markAllAsRead = async (req, res) => {
  try {
    await Notification.update(
      { read: true },
      { where: { userId: req.user.id, read: false } }
    );
    res.json({ msg: "Todas las notificaciones marcadas como leídas" });
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    res.status(500).json({ message: "Error al marcar notificaciones como leídas" });
  }
};

exports.getUnreadCount = async (req, res) => {
  try {
    const count = await Notification.count({
      where: { userId: req.user.id, read: false }
    });
    res.json({ count });
  } catch (error) {
    console.error("Error getting unread count:", error);
    res.status(500).json({ message: "Error al obtener conteo de notificaciones" });
  }
};

// Función helper para crear notificaciones
exports.createNotification = async (userId, title, message, type = 'info', relatedId = null, relatedType = null) => {
  try {
    const notification = await Notification.create({
      userId,
      title,
      message,
      type,
      relatedId,
      relatedType
    });
    
    // Si hay Socket.IO disponible, enviar notificación en tiempo real
    if (global.io) {
      global.io.to(`user_${userId}`).emit('notification', {
        id: notification.id,
        title,
        message,
        type,
        createdAt: notification.createdAt
      });
    }
    
    return notification;
  } catch (error) {
    console.error("Error creating notification:", error);
  }
};

// Función para notificar a múltiples usuarios (admins, managers, etc)
exports.notifyUsers = async (userIds, title, message, type = 'info', relatedId = null, relatedType = null) => {
  try {
    const notifications = await Promise.all(
      userIds.map(userId => 
        exports.createNotification(userId, title, message, type, relatedId, relatedType)
      )
    );
    return notifications;
  } catch (error) {
    console.error("Error notifying users:", error);
  }
};

// Función para notificar a todos los admins
exports.notifyAdmins = async (title, message, type = 'info', relatedId = null, relatedType = null) => {
  try {
    const { User } = require("../models");
    const admins = await User.findAll({
      where: { role: 'admin' },
      attributes: ['id']
    });
    
    const adminIds = admins.map(admin => admin.id);
    return exports.notifyUsers(adminIds, title, message, type, relatedId, relatedType);
  } catch (error) {
    console.error("Error notifying admins:", error);
  }
};

// Función para notificar a managers y admins
exports.notifyManagers = async (title, message, type = 'info', relatedId = null, relatedType = null) => {
  try {
    const { User } = require("../models");
    const managers = await User.findAll({
      where: { role: ['admin', 'manager'] },
      attributes: ['id']
    });
    
    const managerIds = managers.map(manager => manager.id);
    return exports.notifyUsers(managerIds, title, message, type, relatedId, relatedType);
  } catch (error) {
    console.error("Error notifying managers:", error);
  }
};

// Función para limpiar notificaciones de prueba
exports.cleanTestNotifications = async (req, res) => {
  try {
    const { Op } = require('sequelize');
    
    // Eliminar notificaciones genéricas de bienvenida o prueba
    const testPatterns = [
      'Bienvenido al sistema',
      'Tu cuenta ha sido configurada',
      'Sistema ERP',
      'sistema ERP',
      'Algunos productos necesitan reabastecimiento'
    ];
    
    const deleted = await Notification.destroy({
      where: {
        userId: req.user.id,
        [Op.or]: testPatterns.map(pattern => ({
          [Op.or]: [
            { title: { [Op.like]: `%${pattern}%` } },
            { message: { [Op.like]: `%${pattern}%` } }
          ]
        }))
      }
    });
    
    res.json({ msg: `${deleted} notificaciones de prueba eliminadas`, count: deleted });
  } catch (error) {
    console.error("Error cleaning test notifications:", error);
    res.status(500).json({ msg: "Error al limpiar notificaciones" });
  }
};

// Función para eliminar todas las notificaciones del usuario
exports.deleteAll = async (req, res) => {
  try {
    const deleted = await Notification.destroy({
      where: { userId: req.user.id }
    });
    res.json({ msg: "Todas las notificaciones han sido eliminadas", count: deleted });
  } catch (error) {
    console.error("Error deleting all notifications:", error);
    res.status(500).json({ msg: "Error al eliminar notificaciones" });
  }
};