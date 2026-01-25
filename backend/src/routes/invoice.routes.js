const express = require("express");
const router = express.Router();
const invoiceController = require("../controllers/invoice.controller");
const authMiddleware = require("../middlewares/auth.middleware");

// Todas las rutas requieren autenticación
router.use(authMiddleware);

// Rutas de facturas
router.get("/", invoiceController.getAll);
router.get("/:id", invoiceController.getById);
router.post("/", invoiceController.create);
router.post("/from-order", invoiceController.createFromOrder);
router.put("/:id", invoiceController.update);
router.delete("/:id", invoiceController.remove);

module.exports = router;
