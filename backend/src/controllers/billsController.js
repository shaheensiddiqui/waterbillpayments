// controllers/billsController.js
const { getBillFromMockBank } = require("../services/mockBankService");
const Bill = require("../models/Bill");
const PaymentLink = require("../models/PaymentLink");
const Transaction = require("../models/Transaction");

// U1: Fetch bill (avoid dialect-specific upsert return shape)
// U1: Fetch bill
async function fetchBill(req, res) {
  try {
    const { bill_number } = req.body;
    if (!bill_number) {
      return res.status(400).json({ error: "bill_number is required" });
    }

    const { data, expired } = await getBillFromMockBank(bill_number);

    let bill = await Bill.findOne({ where: { bill_number } });
    const payload = {
      bill_number: data.bill_number,
      consumer_name: data.consumer_name,
      email: data.email,
      address: data.address,
      service_period_start: data.service_period_start,
      service_period_end: data.service_period_end,
      due_date: data.due_date,
      base_amount: data.base_amount,
      penalty_amount: data.penalty_amount,
      total_amount: data.total_amount,
      status: expired ? "EXPIRED" : "CREATED",
      bank_ref: data.bank_ref,
    };

    if (bill) {
      await bill.update(payload);
    } else {
      bill = await Bill.create(payload);
    }

    res.json({ bill, expired });
  } catch (err) {
    if (err.response?.status === 404) {
      return res.status(404).json({ error: "Bill not found" });
    }
    res.status(500).json({ error: err.message });
  }
}


// U6: List bills (use separate:true so include limit/order works)
async function listBills(req, res) {
  try {
    const { status, search } = req.query;
    const where = {};
    if (status) where.status = status;
    if (search) where.bill_number = search;

    const bills = await Bill.findAll({
      where,
      include: [
        {
          model: PaymentLink,
          separate: true,
          limit: 1,
          order: [["createdAt", "DESC"]],
        },
        {
          model: Transaction,
          separate: true,
          limit: 1,
          order: [["createdAt", "DESC"]],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    res.json(bills);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// GET /api/bills/:billNumber (same include fix)
async function getBill(req, res) {
  try {
    const { billNumber } = req.params;

    const bill = await Bill.findOne({
      where: { bill_number: billNumber },
      include: [
        {
          model: PaymentLink,
          separate: true,
          limit: 1,
          order: [["createdAt", "DESC"]],
        },
        {
          model: Transaction,
          separate: true,
          limit: 1,
          order: [["createdAt", "DESC"]],
        },
      ],
    });

    if (!bill) return res.status(404).json({ error: "Bill not found" });
    res.json(bill);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = { fetchBill, listBills, getBill };
