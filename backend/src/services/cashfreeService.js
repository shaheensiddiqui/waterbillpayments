// services/cashfreeService.js
const axios = require("axios");

const BASE_URL = process.env.CASHFREE_BASE_URL;
const CLIENT_ID = process.env.CASHFREE_CLIENT_ID;
const CLIENT_SECRET = process.env.CASHFREE_CLIENT_SECRET;
const API_VERSION = process.env.CASHFREE_API_VERSION;

async function createPaymentLink(bill, idempotencyKey) {
  const body = {
    customer_details: {
      customer_email: bill.email,
      customer_name: bill.consumer_name,
      customer_phone: "9999999999", // mock number
    },
    link_amount: Number(bill.total_amount),
    link_currency: "INR",
    link_purpose: `Water bill ${bill.bill_number}`,
    link_notify: { send_email: false, send_sms: false },
    link_meta: {
      return_url: `${process.env.APP_BASE_URL}/thank-you?bill=${bill.bill_number}`,
    },
    order_tags: { link_id: idempotencyKey },
  };

  const headers = {
    "Content-Type": "application/json",
    "x-api-version": API_VERSION,
    "x-client-id": CLIENT_ID,
    "x-client-secret": CLIENT_SECRET,
    "x-idempotency-key": idempotencyKey,
  };

  try {
    const { data } = await axios.post(`${BASE_URL}/links`, body, { headers });
    return data;
  } catch (err) {
    // 👇 If idempotency error → retry with suffix
    if (err.response?.data?.type === "idempotency_error") {
      console.warn(`⚠️ Idempotency error for ${idempotencyKey}, retrying...`);

      const retryKey = `${idempotencyKey}-retry${Date.now()}`;
      headers["x-idempotency-key"] = retryKey;

      const { data } = await axios.post(`${BASE_URL}/links`, body, { headers });
      return data;
    }

    throw err;
  }
}

module.exports = { createPaymentLink };
