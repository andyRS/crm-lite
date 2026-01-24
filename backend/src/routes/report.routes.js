const express = require("express");
const router = express.Router();
const reportController = require("../controllers/report.controller");
const authMiddleware = require("../middlewares/auth.middleware");

router.get("/sales", authMiddleware, reportController.getSalesReport);
router.get("/charts", authMiddleware, reportController.getDashboardCharts);

module.exports = router;