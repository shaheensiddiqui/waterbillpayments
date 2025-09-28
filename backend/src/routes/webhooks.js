const express = require("express");
const { cashfreeWebhook } = require("../controllers/webhookController");

const router = express.Router();

// POST /webhooks/cashfree
router.post("/cashfree", cashfreeWebhook);

module.exports = router;
