const Bill = require("../models/Bill");
const PaymentLink = require("../models/PaymentLink");
const { createPaymentLink } = require("../services/cashfreeService");

async function createPayLink(req, res) {
  try {
    const { bill_number } = req.body;

    // 1. Find bill in DB
    const bill = await Bill.findOne({ where: { bill_number } });
    if (!bill) {
      return res.status(404).json({ error: "Bill not found" });
    } 

    // 2. Make idempotency key
    const idempotencyKey = `${bill_number}-${new Date().toISOString().slice(0, 10)}`;

    // 3. Call Cashfree API
    const cfResponse = await createPaymentLink(bill, idempotencyKey);

    // 4. Save payment link in DB
    await PaymentLink.create({
      bill_id: bill.id,
      cf_link_id: cfResponse.link_id,
      link_id: idempotencyKey,
      link_url: cfResponse.link_url,
      amount: bill.total_amount,
      currency: "INR",
      status: cfResponse.link_status,
      expires_at: cfResponse.link_expiry_time
    });

    // 5. Update bill status
    bill.status = "LINK_SENT";
    await bill.save();

    // 6. Reply to frontend/Postman
    return res.json({
      message: "Payment link created",
      link_url: cfResponse.link_url
    });

  } catch (err) {
    // 👉 Instead of hanging, always return error
    return res.status(500).json({ error: err.message });
  }
}

module.exports = { createPayLink };
