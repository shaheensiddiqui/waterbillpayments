const axios = require("axios");

/**
 * Create a Cashfree Payment Link
 * @param {object} bill - Bill model instance
 * @param {string} idempotencyKey - unique key (billNumber-date or billNumber-timestamp)
 */
async function createPaymentLink(bill, idempotencyKey) {
  // Build payload carefully
  const payload = {
    customer_details: {
      customer_email: bill.email || "test@example.com", // fallback to avoid null
      customer_name: bill.consumer_name || "Customer",
      customer_phone: "9999999999", // TODO: replace with real phone
    },
    link_amount: Number(bill.total_amount) || 1, // must be >0
    link_currency: "INR",
    link_purpose: `Water bill ${bill.bill_number}`,
    link_notify: { send_email: false, send_sms: false },
    link_meta: {
      return_url: `${
        process.env.APP_BASE_URL || "http://localhost:3000"
      }/thank-you?bill=${bill.bill_number}`,
      bill_number: bill.bill_number,
    },
  };

  try {
    console.log("➡️ Cashfree Link Request Payload:", JSON.stringify(payload, null, 2));

    const res = await axios.post(
      `${process.env.CASHFREE_BASE_URL}/links`,
      payload,
      {
        headers: {
          "Content-Type": "application/json",
          "x-api-version": process.env.CASHFREE_API_VERSION,
          "x-client-id": process.env.CASHFREE_CLIENT_ID,
          "x-client-secret": process.env.CASHFREE_CLIENT_SECRET,
          "x-idempotency-key": idempotencyKey || `${bill.bill_number}-${Date.now()}`,
        },
      }
    );

    console.log("✅ Cashfree Link Response:", res.data);
    return res.data;
  } catch (err) {
    console.error("❌ Cashfree Link API Error:");
    if (err.response) {
      console.error("Status:", err.response.status);
      console.error("Data:", JSON.stringify(err.response.data, null, 2));
      throw new Error(`Cashfree error: ${JSON.stringify(err.response.data)}`);
    } else {
      console.error("Message:", err.message);
      throw err;
    }
  }
}

/**
 * Create a Cashfree Hosted Checkout Order
 * @param {object} bill - Bill model instance
 * @param {string} idempotencyKey - unique key
 */
async function createCheckoutOrder(bill, idempotencyKey) {
  const payload = {
    order_amount: Number(bill.total_amount) || 1,
    order_currency: "INR",
    order_id: `${bill.bill_number}-${Date.now()}`,
    customer_details: {
      customer_email: bill.email || "test@example.com",
      customer_name: bill.consumer_name || "Customer",
      customer_phone: "9999999999",
    },
    order_meta: {
      return_url: `${
        process.env.APP_BASE_URL || "http://localhost:3000"
      }/thank-you?bill=${bill.bill_number}`,
    },
  };

  try {
    console.log("➡️ Cashfree Order Request Payload:", JSON.stringify(payload, null, 2));

    const res = await axios.post(
      `${process.env.CASHFREE_BASE_URL}/orders`,
      payload,
      {
        headers: {
          "Content-Type": "application/json",
          "x-api-version": process.env.CASHFREE_API_VERSION,
          "x-client-id": process.env.CASHFREE_CLIENT_ID,
          "x-client-secret": process.env.CASHFREE_CLIENT_SECRET,
          "x-idempotency-key": idempotencyKey || `${bill.bill_number}-${Date.now()}`,
        },
      }
    );

    console.log("✅ Cashfree Order Response:", res.data);
    return res.data;
  } catch (err) {
    console.error("❌ Cashfree Order API Error:");
    if (err.response) {
      console.error("Status:", err.response.status);
      console.error("Data:", JSON.stringify(err.response.data, null, 2));
      throw new Error(`Cashfree error: ${JSON.stringify(err.response.data)}`);
    } else {
      console.error("Message:", err.message);
      throw err;
    }
  }
}

module.exports = { createPaymentLink, createCheckoutOrder };

