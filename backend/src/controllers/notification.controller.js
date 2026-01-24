const { Notification } = require("../models");

exports.getAll = async (req, res) => {
  try {
    const notifications = await Notification.findAll({
      where: { userId: req.user.id },
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
    await Notification.create({
      userId,
      title,
      message,
      type,
      relatedId,
      relatedType
    });
  } catch (error) {
    console.error("Error creating notification:", error);
  }
};