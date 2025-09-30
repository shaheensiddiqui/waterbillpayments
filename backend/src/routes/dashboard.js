//dashboard.js

const express = require("express");
const { dashboardSummary } = require("../controllers/dashboardController");

const router = express.Router();

router.get("/summary", dashboardSummary);

module.exports = router;


