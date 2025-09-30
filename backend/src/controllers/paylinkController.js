// controllers/paylinkController.js

const Bill = require("../models/Bill");
const PaymentLink = require("../models/PaymentLink");
const { createPaymentLink } = require("../services/cashfreeService");

async function createPayLink(req, res) {
  try {
    const { bill_number } = req.body;

    // 1️⃣ Find bill
    const bill = await Bill.findOne({ where: { bill_number } });
    if (!bill) return res.status(404).json({ error: "Bill not found" });

    // 2️⃣ Deterministic idempotency key: billNumber + YYYYMMDD
    const today = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const idempotencyKey = `${bill_number}-${today}`;

    // 3️⃣ Check if PaymentLink already exists for today
    let payLink = await PaymentLink.findOne({
      where: { bill_id: bill.id, link_id: idempotencyKey },
    });

    if (payLink) {
      console.log(`🔄 Reusing existing PaymentLink for ${bill_number}`);
      return res.json({
        message: "Payment link already exists",
        link_url: payLink.link_url,
        cf_link_id: payLink.cf_link_id,
        link_id: payLink.link_id,
      });
    }

    // 4️⃣ Call Cashfree to create link
    const cf = await createPaymentLink(bill, idempotencyKey);

    const cfLinkId = cf.cf_link_id || cf.link_id || null;

    // 5️⃣ Save PaymentLink
    payLink = await PaymentLink.create({
      bill_id: bill.id,
      cf_link_id: cfLinkId,
      link_id: idempotencyKey,
      link_url: cf.link_url,
      amount: bill.total_amount,
      currency: "INR",
      status: cf.link_status || "ACTIVE",
      expires_at: cf.link_expiry_time ? new Date(cf.link_expiry_time) : null,
    });

    // 6️⃣ Update Bill
    bill.status = "LINK_SENT";
    await bill.save();

    console.log(`✅ PaymentLink created for ${bill_number}`);

    // 7️⃣ Return response
    return res.json({
      message: "Payment link created",
      link_url: cf.link_url,
      cf_link_id: cfLinkId,
      link_id: idempotencyKey,
    });
  } catch (err) {
    console.error("❌ Error creating payment link:", err.response?.data || err.message);
    return res.status(500).json({ error: err.message });
  }
}

module.exports = { createPayLink };
