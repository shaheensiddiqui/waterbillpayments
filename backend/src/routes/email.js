//email.js

const express = require("express");
const { Bill, PaymentLink, EmailLog } = require("../models");
const { sendPaylinkEmail } = require("../utils/email");

const router = express.Router();

// POST /api/email/paylink
router.post("/paylink", async (req, res) => {
  const { bill_number, to_email } = req.body;

  if (!bill_number || !to_email) {
    return res
      .status(400)
      .json({ error: "bill_number and to_email are required" });
  }

  // 1. Find bill
  const bill = await Bill.findOne({ where: { bill_number } });
  if (!bill) return res.status(404).json({ error: "Bill not found" });

  // 2. Find latest ACTIVE link
  const link = await PaymentLink.findOne({
    where: { bill_id: bill.id, status: "ACTIVE" },
    order: [["createdAt", "DESC"]],
  });
  if (!link) return res.status(409).json({ error: "No active payment link" });

  // 3. Build email
  const html = `
    <h3>Water Bill Payment</h3>
    <p>Bill: <b>${bill.bill_number}</b></p>
    <p>Amount: <b>₹${bill.total_amount}</b></p>
    <p><a href="${link.link_url}">Pay Now</a></p>
  `;

  try {
    // 4. Send email
    const info = await sendPaylinkEmail({
      to: to_email,
      subject: `Pay your water bill ${bill.bill_number}`,
      html,
      text: `Pay your bill ${bill.bill_number}: ${link.link_url}`,
    });

    // 5. Log it
    const log = await EmailLog.create({
      bill_id: bill.id,
      to_email,
      subject: `Pay your water bill ${bill.bill_number}`,
      sent_at: new Date(),
      provider_message_id: info.messageId,
    });

    return res.json({ ok: true, email_log: log });
  } catch (e) {
    return res.status(502).json({ error: "Email send failed", detail: e.message });
  }
});

module.exports = router;
