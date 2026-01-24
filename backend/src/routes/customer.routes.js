const express = require("express");
const router = express.Router();

const customerController = require("../controllers/customer.controller");
const auth = require("../middlewares/auth.middleware");

// Rutas protegidas
router.get("/", auth, customerController.getAll);
router.post("/", auth, customerController.create);
router.put("/:id", auth, customerController.update);
router.delete("/:id", auth, customerController.remove);

module.exports = router;
