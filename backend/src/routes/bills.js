const express = require("express");
const { fetchBill, listBills, getBill } = require("../controllers/billsController");

const router = express.Router();

router.post("/fetch", fetchBill);
router.get("/", listBills);
router.get("/:billNumber", getBill);

module.exports = router;
