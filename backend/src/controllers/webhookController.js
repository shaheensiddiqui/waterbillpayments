// controllers/webhookController.js

const crypto = require("crypto");
const { Op } = require("sequelize");
const Bill = require("../models/Bill");
const PaymentLink = require("../models/PaymentLink");
const Transaction = require("../models/Transaction");
const WebhookEvent = require("../models/WebhookEvent");
const { markBillPaid } = require("../services/mockBankService");

// 🔹 Verify Cashfree signature
function verifySignature(req) {
  const secret = process.env.CASHFREE_CLIENT_SECRET;
  const sig = req.headers["x-webhook-signature"];
  const ts = req.headers["x-webhook-timestamp"];

  if (!secret || !sig || !ts) {
    console.warn("⚠️ Missing signature headers");
    return false;
  }

  const data = ts + (req.rawBody || JSON.stringify(req.body));
  const expected = crypto.createHmac("sha256", secret).update(data).digest("base64");

  try {
    const a = Buffer.from(sig);
    const b = Buffer.from(expected);
    return a.length === b.length && crypto.timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

// 🔹 Main webhook handler
async function cashfreeWebhook(req, res) {
  let webhookRow = null;

  try {
    const event = req.body;
    console.log("➡️ Webhook Received:", event.type);
    console.log("📦 Payload:", JSON.stringify(event, null, 2));

    // 0️⃣ Save raw webhook event
    const valid = verifySignature(req);
    webhookRow = await WebhookEvent.create({
      type: event.type,
      raw_payload: JSON.stringify(event),
      headers: JSON.stringify(req.headers),
      verified: !!valid,
      status: "RECEIVED",
      received_at: new Date(),
    });

    if (!valid) {
      console.warn("❌ Invalid webhook signature");
      return res.status(400).json({ error: "invalid signature" });
    }

    // 🔑 Extract identifiers
    const tags = event.data?.order?.order_tags || {};
    const cfLinkId = tags.cf_link_id || null;
    const ourLinkId = tags.link_id || null;
    console.log("🔑 Identifiers:", { cfLinkId, ourLinkId });

    let payLink = null;
    if (cfLinkId || ourLinkId) {
      payLink = await PaymentLink.findOne({
        where: { [Op.or]: [{ cf_link_id: cfLinkId }, { link_id: ourLinkId }] },
      });
    }
    if (!payLink) {
      console.warn("⚠️ No PaymentLink found for webhook", { cfLinkId, ourLinkId });
    }

    // 1️⃣ PAYMENT PENDING
    if (event.type === "PAYMENT_PENDING_WEBHOOK" || event.type === "payment.pending") {
      console.log("⏳ Handling PAYMENT_PENDING...");
      if (payLink) {
        const bill = await Bill.findByPk(payLink.bill_id);
        if (bill && bill.status !== "PAID") {
          bill.status = "PAYMENT_PENDING";
          await bill.save();
          console.log(`⏳ Bill ${bill.bill_number} → PAYMENT_PENDING`);
        }
        if (payLink.status !== "PAID") {
          payLink.status = "PAYMENT_PENDING";
          await payLink.save();
          console.log(`🔗 PaymentLink ${payLink.id} → PAYMENT_PENDING`);
        }
      }
    }

    // 2️⃣ PAYMENT SUCCESS
    else if (event.type === "PAYMENT_SUCCESS_WEBHOOK" || event.type === "payment.success") {
      console.log("✅ Handling PAYMENT_SUCCESS...");

      const cfPaymentId = event.data?.payment?.cf_payment_id || null;
      const amount = event.data?.payment?.payment_amount ?? null;
      const currency = event.data?.payment?.payment_currency || "INR";
      const bankRef = event.data?.payment?.bank_reference || null;
      const mode =
        event.data?.payment?.payment_method?.upi?.channel ||
        event.data?.payment?.payment_method?.card?.card_network ||
        event.data?.payment?.payment_group ||
        null;
      const paidAt = event.data?.payment?.payment_time
        ? new Date(event.data.payment.payment_time)
        : new Date();

      if (payLink) {
        const bill = await Bill.findByPk(payLink.bill_id);
        if (bill) {
          bill.status = "PAID";
          bill.bank_ref = bankRef || bill.bank_ref;
          await bill.save();
          console.log(`💰 Bill ${bill.bill_number} → PAID`);

          try {
            await markBillPaid(
              bill.bill_number,
              cfPaymentId || bankRef || `CF_${Date.now()}`,
              Number(amount ?? bill.total_amount),
              paidAt.toISOString()
            );
            console.log("🏦 MockBank updated");
          } catch (mockErr) {
            console.error("🏦 MockBank update failed:", mockErr.message);
          }
        }

        payLink.status = "PAID";
        await payLink.save();

        await Transaction.create({
          bill_id: payLink.bill_id,
          cf_payment_id: cfPaymentId,
          amount: amount != null ? Number(amount) : null,
          currency,
          mode,
          status: "SUCCESS",
          bank_ref: bankRef,
          paid_at: paidAt,
        });
      }
    }

    // 3️⃣ PAYMENT FAILED
    else if (event.type === "PAYMENT_FAILED_WEBHOOK" || event.type === "payment.failed") {
      console.log("❌ Handling PAYMENT_FAILED...");

      if (payLink) {
        const bill = await Bill.findByPk(payLink.bill_id);
        if (bill && bill.status !== "PAID") {
          bill.status = "CANCELLED";
          await bill.save();
          console.log(`❌ Bill ${bill.bill_number} → CANCELLED`);
        }

        if (payLink.status !== "PAID") {
          payLink.status = "CANCELLED";
          await payLink.save();
          console.log(`🔗 PaymentLink ${payLink.id} → CANCELLED`);
        }

        await Transaction.create({
          bill_id: payLink.bill_id,
          cf_payment_id: event.data?.payment?.cf_payment_id,
          amount: Number(event.data?.payment?.payment_amount ?? 0),
          currency: event.data?.payment?.payment_currency || "INR",
          mode: event.data?.payment?.payment_group || null,
          status: "FAILED",
          bank_ref: event.data?.payment?.bank_reference || null,
          paid_at: event.data?.payment?.payment_time
            ? new Date(event.data.payment.payment_time)
            : new Date(),
        });

        console.log(`📒 Transaction recorded as FAILED for link_id=${ourLinkId}`);
      }
    }

    // 4️⃣ USER DROPPED
    else if (
      event.type === "PAYMENT_USER_DROPPED_WEBHOOK" ||
      event.type === "payment.user_dropped"
    ) {
      console.log("👤 Handling USER DROPPED...");
      if (payLink && payLink.status !== "PAID") {
        payLink.status = "CANCELLED";
        await payLink.save();
        console.log(`🔗 PaymentLink ${payLink.id} → CANCELLED (user dropped)`);
      }
    }

    // 5️⃣ Fallback
    else {
      console.warn("⚠️ Unhandled webhook type:", event.type);
    }

    // 🔹 Mark webhook processed
    if (webhookRow) {
      webhookRow.status = "PROCESSED";
      webhookRow.processed_at = new Date();
      await webhookRow.save();
    }

    return res.json({ received: true });
  } catch (err) {
    console.error("❌ Webhook error:", err);

    if (webhookRow) {
      webhookRow.status = "FAILED";
      webhookRow.processed_at = new Date();
      await webhookRow.save();
    }

    return res.status(500).json({ error: err.message });
  }
}

module.exports = { cashfreeWebhook };
