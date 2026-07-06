const express = require("express");
const router = express.Router();
const companyController = require("../controllers/company.controller");
const authMiddleware = require("../middlewares/auth.middleware");

router.use(authMiddleware);

router.get("/", companyController.get);
router.put("/", companyController.update);

module.exports = router;
