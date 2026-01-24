const express = require("express");
const router = express.Router();
const notificationController = require("../controllers/notification.controller");
const authMiddleware = require("../middlewares/auth.middleware");

router.get("/", authMiddleware, notificationController.getAll);
router.put("/:id/read", authMiddleware, notificationController.markAsRead);
router.put("/mark-all-read", authMiddleware, notificationController.markAllAsRead);
router.get("/unread-count", authMiddleware, notificationController.getUnreadCount);

module.exports = router;