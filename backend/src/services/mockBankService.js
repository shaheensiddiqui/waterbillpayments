// src/services/mockBankService.js
const axios = require("axios");

const MOCK_BANK_BASE_URL =
  process.env.MOCK_BANK_BASE_URL || "http://localhost:4001";

// GET /mock-bank/bills/:billNumber
async function getBillFromMockBank(billNumber) {
  try {
    const { data } = await axios.get(
      `${MOCK_BANK_BASE_URL}/mock-bank/bills/${encodeURIComponent(billNumber)}`
    );
    return { data, expired: false };
  } catch (err) {
    if (err.response?.status === 410) {
      // server returned expired bill in body
      return { data: err.response.data.bill, expired: true };
    }
    throw err; // rethrow other errors like 404
  }
}

// POST /mock-bank/bills/:billNumber/mark-paid
async function markBillPaid(billNumber, payment_ref, paid_amount, paid_at) {
  const { data } = await axios.post(
    `${MOCK_BANK_BASE_URL}/mock-bank/bills/${encodeURIComponent(billNumber)}/mark-paid`,
    { payment_ref, paid_amount, paid_at }
  );
  return data;
}

module.exports = { getBillFromMockBank, markBillPaid };
