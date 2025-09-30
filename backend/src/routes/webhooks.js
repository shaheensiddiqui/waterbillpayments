//webhooks.js

const express = require("express");
const { cashfreeWebhook } = require("../controllers/webhookController");

const router = express.Router();

// Accept both /webhooks and /webhooks/cashfree
router.post("/", cashfreeWebhook);
router.post("/cashfree", cashfreeWebhook);

module.exports = router;
