const express = require("express");
const router = express.Router();
const productController = require("../controllers/product.controller");
const authMiddleware = require("../middlewares/auth.middleware");
const { validate } = require("../middlewares/validation.middleware");
const { checkPermission } = require("../middlewares/permissions.middleware");

router.get("/", authMiddleware, productController.getAll);

router.post("/",
  authMiddleware,
  validate(require("../middlewares/validation.middleware").schemas.product.create),
  checkPermission('products', 'create'),
  productController.create
);

router.put("/:id",
  authMiddleware,
  validate(require("../middlewares/validation.middleware").schemas.product.update),
  checkPermission('products', 'update'),
  productController.update
);

router.delete("/:id",
  authMiddleware,
  checkPermission('products', 'delete'),
  productController.remove
);

router.get("/low-stock", authMiddleware, productController.getLowStock);

module.exports = router;