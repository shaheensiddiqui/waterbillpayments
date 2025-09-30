// controllers/transactionController.js
const Transaction = require("../models/Transaction");
const Bill = require("../models/Bill");

// List all transactions
async function listTransactions(req, res) {
  try {
    const transactions = await Transaction.findAll({
      include: [{ model: Bill, attributes: ["bill_number", "consumer_name"] }],
      order: [["createdAt", "DESC"]],
    });
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Get transactions by bill_id
async function getTransactionsByBill(req, res) {
  try {
    const { bill_id } = req.params;
    const transactions = await Transaction.findAll({
      where: { bill_id },
      order: [["createdAt", "DESC"]],
    });
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = { listTransactions, getTransactionsByBill };
