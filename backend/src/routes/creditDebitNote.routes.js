const express = require("express");
const router = express.Router();
const creditDebitNoteController = require("../controllers/creditDebitNote.controller");
const authMiddleware = require("../middlewares/auth.middleware");

router.use(authMiddleware);

router.get("/", creditDebitNoteController.getAll);
router.get("/:id", creditDebitNoteController.getById);
router.post("/", creditDebitNoteController.create);

module.exports = router;
