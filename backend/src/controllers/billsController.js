const { getBillFromMockBank } = require("../services/mockBankService");
const Bill = require("../models/Bill");
const PaymentLink = require("../models/PaymentLink");
const Transaction = require("../models/Transaction");

// U1: Fetch bill
async function fetchBill(req, res) {
  try {
    const { bill_number } = req.body;

    // call mock bank
    const billData = await getBillFromMockBank(bill_number);

    // save or update in DB
    const [bill, created] = await Bill.upsert({
      bill_number: billData.bill_number,
      consumer_name: billData.consumer_name,
      email: billData.email,
      address: billData.address,
      service_period_start: billData.service_period_start,
      service_period_end: billData.service_period_end,
      due_date: billData.due_date,
      base_amount: billData.base_amount,
      penalty_amount: billData.penalty_amount,
      total_amount: billData.total_amount,
      status: "CREATED",
      bank_ref: billData.bank_ref,
    });

    res.json({ bill, created });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// U6: List bills (dashboard → search + filter)
async function listBills(req, res) {
  try {
    const { status, search } = req.query;
    let where = {};
    if (status) where.status = status;
    if (search) where.bill_number = search;

    const bills = await Bill.findAll({
      where,
      include: [
        {
          model: PaymentLink,
          limit: 1,
          order: [["createdAt", "DESC"]],
        },
        {
          model: Transaction,
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

// GET /api/bills/:billNumber
async function getBill(req, res) {
  try {
    const { billNumber } = req.params;

    const bill = await Bill.findOne({
      where: { bill_number: billNumber },
      include: [
        {
          model: PaymentLink,
          limit: 1,
          order: [["createdAt", "DESC"]],
        },
        {
          model: Transaction,
          limit: 1,
          order: [["createdAt", "DESC"]],
        },
      ],
    });

    if (!bill) {
      return res.status(404).json({ error: "Bill not found" });
    }

    res.json(bill);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = { fetchBill, listBills, getBill };
