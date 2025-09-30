// controllers/transactionController.js

const Transaction = require("../models/Transaction");
const Bill = require("../models/Bill");

// Fetch all transactions with related bill info
async function listTransactions(req, res) {
  try {
    const transactions = await Transaction.findAll({
      include: [
        {
          model: Bill,
          attributes: ["bill_number", "consumer_name"], // show limited bill fields
        },
      ],
      order: [["createdAt", "DESC"]], // latest transactions first
    });
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Fetch transactions for a specific bill
async function getTransactionsByBill(req, res) {
  try {
    const { bill_id } = req.params;
    const transactions = await Transaction.findAll({
      where: { bill_id },
      order: [["createdAt", "DESC"]], // latest transactions first
    });
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = { listTransactions, getTransactionsByBill };
