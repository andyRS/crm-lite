const express = require("express");
const router = express.Router();
const orderController = require("../controllers/order.controller");
const authMiddleware = require("../middlewares/auth.middleware");
const { validate } = require("../middlewares/validation.middleware");
const { checkPermission } = require("../middlewares/permissions.middleware");

router.get("/", authMiddleware, orderController.getAll);

router.post("/",
  authMiddleware,
  validate(require("../middlewares/validation.middleware").schemas.order.create),
  checkPermission('orders', 'create'),
  orderController.create
);

router.put("/:id",
  authMiddleware,
  validate(require("../middlewares/validation.middleware").schemas.order.update),
  checkPermission('orders', 'update'),
  orderController.update
);

router.delete("/:id",
  authMiddleware,
  checkPermission('orders', 'delete'),
  orderController.remove
);

module.exports = router;