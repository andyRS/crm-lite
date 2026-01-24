const express = require("express");
const router = express.Router();
const categoryController = require("../controllers/category.controller");
const authMiddleware = require("../middlewares/auth.middleware");

router.get("/", authMiddleware, categoryController.getAll);
router.post("/", authMiddleware, categoryController.create);
router.put("/:id", authMiddleware, categoryController.update);
router.delete("/:id", authMiddleware, categoryController.remove);

module.exports = router;