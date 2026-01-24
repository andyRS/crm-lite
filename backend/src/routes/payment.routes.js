const express = require("express");
const router = express.Router();
const paymentMethodController = require("../controllers/paymentMethod.controller");
const paymentController = require("../controllers/payment.controller");
const { validate } = require("../middlewares/validation.middleware");
const { checkPermission } = require("../middlewares/permissions.middleware");

// Rutas para métodos de pago
router.get("/methods",
  paymentMethodController.getAll
);

router.post("/methods",
  validate(require("../middlewares/validation.middleware").schemas.paymentMethod.create),
  checkPermission('payments', 'create'),
  paymentMethodController.create
);

router.put("/methods/:id",
  validate(require("../middlewares/validation.middleware").schemas.paymentMethod.create),
  checkPermission('payments', 'update'),
  paymentMethodController.update
);

router.delete("/methods/:id",
  checkPermission('payments', 'delete'),
  paymentMethodController.remove
);

// Rutas para pagos
router.get("/",
  paymentController.getAll
);

router.post("/",
  validate(require("../middlewares/validation.middleware").schemas.payment.create),
  checkPermission('payments', 'create'),
  paymentController.create
);

router.post("/:id/refund",
  checkPermission('payments', 'update'),
  paymentController.processRefund
);

module.exports = router;