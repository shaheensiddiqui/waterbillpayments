const express = require("express");
const { createPayLink } = require("../controllers/paylinkController");

const router = express.Router();

// POST /api/paylinks
router.post("/", createPayLink);

module.exports = router;
 