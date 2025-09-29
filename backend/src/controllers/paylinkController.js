const Bill = require("../models/Bill");
const PaymentLink = require("../models/PaymentLink");
const { createPaymentLink } = require("../services/cashfreeService");

async function createPayLink(req, res) {
  try {
    const { bill_number } = req.body;

    const bill = await Bill.findOne({ where: { bill_number } });
    if (!bill) {
      return res.status(404).json({ error: "Bill not found" });
    }

// 2. Make idempotency key (safe format)
const idempotencyKey = `${bill_number}-${Date.now()}`;

    // 🔑 Call Cashfree
    const cfResponse = await createPaymentLink(bill, idempotencyKey);

    await PaymentLink.create({
      bill_id: bill.id,
      cf_link_id: cfResponse.cf_link_id || cfResponse.link_id, // ✅ safer
      link_id: idempotencyKey,
      link_url: cfResponse.link_url,
      amount: bill.total_amount,
      currency: "INR",
      status: cfResponse.link_status || "ACTIVE",
      expires_at: cfResponse.link_expiry_time || null,
    });

    bill.status = "LINK_SENT";
    await bill.save();

    return res.json({
      message: "Payment link created",
      link_url: cfResponse.link_url,
    });
  } catch (err) {
    console.error("❌ PayLink Controller Error:", err.message);
    if (err.stack) console.error(err.stack);

    // if Cashfree returned JSON error, parse it
    let errorDetail;
    try {
      errorDetail = JSON.parse(err.message);
    } catch {
      errorDetail = err.message;
    }

    return res.status(500).json({ error: errorDetail });
  }
}

module.exports = { createPayLink };
