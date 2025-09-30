//webhooks.js

const express = require("express");
const { cashfreeWebhook } = require("../controllers/webhookController");

const router = express.Router();

router.post("/", cashfreeWebhook);
router.post("/cashfree", cashfreeWebhook);

module.exports = router;
