const express = require("express");
const router = express.Router();
const ncfSequenceController = require("../controllers/ncfSequence.controller");
const authMiddleware = require("../middlewares/auth.middleware");

router.use(authMiddleware);

router.get("/", ncfSequenceController.getAll);
router.get("/status", ncfSequenceController.getStatus);
router.post("/", ncfSequenceController.create);
router.put("/:id", ncfSequenceController.update);
router.delete("/:id", ncfSequenceController.remove);

module.exports = router;
