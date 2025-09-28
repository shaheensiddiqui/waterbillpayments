const express = require("express");
const { fetchBill, listBills } = require("../controllers/billsController");

const router = express.Router();

// POST /api/bills/fetch
router.post("/fetch", fetchBill);

// GET /api/bills (with ?status=PAID&search=WB-1234)
router.get("/", listBills);

module.exports = router;
