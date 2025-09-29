const crypto = require("crypto");
const axios = require("axios");
const Bill = require("../models/Bill");
const PaymentLink = require("../models/PaymentLink");
const Transaction = require("../models/Transaction");
const WebhookEvent = require("../models/WebhookEvent");

/**
 * Verify Cashfree webhook signature
 */
function verifyCashfreeSignature(req) {
  const signature = req.headers["x-webhook-signature"];
  const timestamp = req.headers["x-webhook-timestamp"];
  const rawBody = req.rawBody; // set in express.json verify

  if (!signature || !timestamp || !rawBody) {
    return false;
  }

  const computed = crypto
    .createHmac("sha256", process.env.CASHFREE_CLIENT_SECRET)  // ✅ use webhook secret
    .update(timestamp + rawBody)
    .digest("base64");

  return computed === signature;
}

async function cashfreeWebhook(req, res) {
  try {
    const event = req.body;

    // 🔒 Step 1: Verify signature
    const verified = verifyCashfreeSignature(req);

    // Step 2: Always log webhook
    const webhookLog = await WebhookEvent.create({
      type: event.type,
      raw_payload: req.rawBody,
      headers: JSON.stringify(req.headers),
      verified,
      status: verified ? "RECEIVED" : "FAILED",
      received_at: new Date(),
    });

    if (!verified) {
      console.error("❌ Invalid Cashfree webhook signature");
      return res.status(401).json({ error: "Invalid signature" });
    }

    // ✅ Step 3: Handle payment success
    if (event.type === "PAYMENT_SUCCESS_WEBHOOK" || event.type === "payment.success") {
      let bill = null;
      let paymentLink = null;

      const cfLinkId = event.data?.order?.order_tags?.cf_link_id
        ? String(event.data.order.order_tags.cf_link_id)
        : null;
      const linkId = event.data?.order?.order_tags?.link_id
        ? String(event.data.order.order_tags.link_id)
        : null;

      console.log("🔎 Webhook identifiers:", { cfLinkId, linkId });

      if (cfLinkId) {
        paymentLink = await PaymentLink.findOne({ where: { cf_link_id: cfLinkId } });
      } else if (linkId) {
        paymentLink = await PaymentLink.findOne({ where: { link_id: linkId } });
      }

      if (!paymentLink) {
        console.error("❌ PaymentLink not found for", { cfLinkId, linkId });
        return res.status(404).json({ error: "PaymentLink not found" });
      }

      bill = await Bill.findByPk(paymentLink.bill_id);
      if (!bill) {
        console.error("❌ Bill not found for PaymentLink", paymentLink.id);
        return res.status(404).json({ error: "Bill not found" });
      }

      // Step 4: Prevent duplicate transaction
      const existingTx = await Transaction.findOne({
        where: { cf_payment_id: event.data?.payment?.cf_payment_id || "" },
      });
      if (existingTx) {
        console.log("⚠️ Duplicate webhook received, skipping transaction insert");
        return res.json({ message: "Duplicate webhook ignored" });
      }

      // Step 5: Update bill + payment link
      bill.status = "PAID";
      await bill.save();

      paymentLink.status = "PAID";
      await paymentLink.save();

      // Step 6: Log transaction
      await Transaction.create({
        bill_id: bill.id,
        cf_order_id: event.data?.order?.order_id || null,
        cf_payment_id: event.data?.payment?.cf_payment_id || null,
        payment_session_id: event.data?.payment?.payment_session_id || null,
        amount: event.data?.payment?.payment_amount || bill.total_amount,
        currency: event.data?.payment?.payment_currency || "INR",
        mode: event.data?.payment?.payment_group || "UNKNOWN",
        status: "SUCCESS",
      });

      // Step 7: Call Mock Bank API → mark bill as paid
      try {
        await axios.post(
  `${process.env.MOCK_BANK_BASE_URL}/mock-bank/bills/${bill.bill_number}/mark-paid`,
  {
    payment_ref: event.data?.payment?.cf_payment_id,
    paid_amount: event.data?.payment?.payment_amount,
    paid_at: new Date().toISOString(),
  }
);

        console.log("🏦 Mock Bank updated: bill marked as paid");
      } catch (mockErr) {
        console.error("⚠️ Failed to update Mock Bank:", mockErr.message);
      }

      // Step 8: Mark webhook as processed
      webhookLog.status = "PROCESSED";
      webhookLog.processed_at = new Date();
      await webhookLog.save();

      console.log(`✅ Bill ${bill.bill_number} marked as PAID & transaction logged`);
      return res.json({ message: `Bill ${bill.bill_number} marked as PAID` });
    }

    // Step 9: Ignore other events
    return res.json({ message: "Webhook received but no action taken" });
  } catch (err) {
    console.error("Webhook error:", err);
    return res.status(500).json({ error: err.message });
  }
}

module.exports = { cashfreeWebhook };
