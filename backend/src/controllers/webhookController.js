const Bill = require("../models/Bill");
const PaymentLink = require("../models/PaymentLink");

async function cashfreeWebhook(req, res) {
  try {
    const event = req.body;

    // --- simulate only "payment.success"
    if (event.type === "payment.success") {
      // assume bill_number is sent inside payload
      const billNumber = event.data.bill_number || event.data.link_meta?.bill_number;

      if (!billNumber) {
        return res.status(400).json({ error: "Missing bill number in webhook" });
      }

      // find bill
      const bill = await Bill.findOne({ where: { bill_number: billNumber } });
      if (!bill) {
        return res.status(404).json({ error: "Bill not found" });
      }

      // mark as PAID
      bill.status = "PAID";
      await bill.save();

      // update related payment link
      const paymentLink = await PaymentLink.findOne({ where: { bill_id: bill.id } });
      if (paymentLink) {
        paymentLink.status = "PAID";
        await paymentLink.save();
      }

      console.log(`✅ Bill ${billNumber} marked as PAID (via webhook)`);
      return res.json({ message: `Bill ${billNumber} marked as PAID` });
    }

    // ignore other events
    return res.json({ message: "Webhook received but no action taken" });
  } catch (err) {
    console.error("Webhook error:", err);
    return res.status(500).json({ error: err.message });
  }
}

module.exports = { cashfreeWebhook };
