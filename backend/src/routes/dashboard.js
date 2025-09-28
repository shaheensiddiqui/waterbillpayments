const express = require("express");
const { dashboardSummary } = require("../controllers/dashboardController");

const router = express.Router();

// GET /api/dashboard/summary
router.get("/summary", dashboardSummary);

module.exports = router;
