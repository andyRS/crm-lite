const express = require("express");
const router = express.Router();
const quoteController = require("../controllers/quote.controller");
const authMiddleware = require("../middlewares/auth.middleware");

router.get("/", authMiddleware, quoteController.getAll);
router.post("/", authMiddleware, quoteController.create);
router.put("/:id", authMiddleware, quoteController.update);
router.post("/:id/convert-to-order", authMiddleware, quoteController.convertToOrder);

module.exports = router;