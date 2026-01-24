const express = require("express");
const router = express.Router();

const customerController = require("../controllers/customer.controller");
const auth = require("../middlewares/auth.middleware");
const { validate } = require("../middlewares/validation.middleware");
const { checkPermission } = require("../middlewares/permissions.middleware");

// Rutas protegidas con validaciones y permisos
router.get("/", auth, customerController.getAll);

router.post("/",
  auth,
  validate(require("../middlewares/validation.middleware").schemas.customer.create),
  checkPermission('customers', 'create'),
  customerController.create
);

router.put("/:id",
  auth,
  validate(require("../middlewares/validation.middleware").schemas.customer.update),
  checkPermission('customers', 'update'),
  customerController.update
);

router.delete("/:id",
  auth,
  checkPermission('customers', 'delete'),
  customerController.remove
);

module.exports = router;
