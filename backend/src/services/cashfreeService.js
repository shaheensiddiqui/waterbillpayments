const axios = require("axios");

async function createPaymentLink(bill, idempotencyKey) {
  const res = await axios.post(
    `${process.env.CASHFREE_BASE_URL}/links`,
    {
      customer_details: {
        customer_email: bill.email,
        customer_name: bill.consumer_name,
        customer_phone: "9999999999", // hardcoded for now (ask)
      },
      link_amount: bill.total_amount,
      link_currency: "INR",
      link_purpose: `Water bill ${bill.bill_number}`,
      link_notify: { send_email: false, send_sms: false },
      link_meta: {
        return_url: `http://localhost:3000/thank-you?bill=${bill.bill_number}`,
      },
    },
    {
      headers: { 
        "Content-Type": "application/json",
        "x-api-version": process.env.CASHFREE_API_VERSION,
        "x-client-id": process.env.CASHFREE_CLIENT_ID,
        "x-client-secret": process.env.CASHFREE_CLIENT_SECRET,
        "x-idempotency-key": idempotencyKey,
      },
    }
  );

  return res.data; // Cashfree’s response
}

module.exports = { createPaymentLink };
