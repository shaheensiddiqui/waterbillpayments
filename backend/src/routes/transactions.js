const express = require("express");
const { listTransactions, getTransactionsByBill } = require("../controllers/transactionController");

const router = express.Router();

router.get("/", listTransactions);
router.get("/:bill_id", getTransactionsByBill);

module.exports = router;
