const request = require("supertest");
const app = require("../../server");
const sequelize = require("../../config/db");
const Bill = require("../../models/Bill");

describe("Happy Path: fetch bill → create link → simulate webhook → bill = PAID", () => {
  beforeAll(async () => {
    await sequelize.sync({ force: true }); // reset DB for tests
  });

  afterAll(async () => {
    await sequelize.close();
  });

  it("should mark a bill as PAID after webhook success", async () => {
    // 1️⃣ Create a new unpaid bill
    const bill = await Bill.create({
      bill_number: "TEST-BILL-9999",
      consumer_name: "Test User",
      email: "test@example.com",
      address: "123 Test Street",
      service_period_start: "2025-09-01",
      service_period_end: "2025-09-30",
      due_date: "2025-10-20",
      base_amount: 500,
      penalty_amount: 0,
      total_amount: 500,
      status: "UNPAID",
      bank_ref: "TEST_BANK_REF",
    });

    // 2️⃣ Simulate Cashfree webhook payload
    const webhookPayload = {
      type: "PAYMENT_SUCCESS_WEBHOOK",
      data: {
        order: {
          order_id: "CF_ORDER_TEST",
          order_amount: 500,
          order_currency: "INR",
          order_tags: { link_id: "link_test" },
        },
        payment: {
          cf_payment_id: "CF_PAYMENT_TEST",
          payment_status: "SUCCESS",
          payment_amount: 500,
          payment_currency: "INR",
          payment_message: "Test payment success",
          payment_time: new Date().toISOString(),
          bank_reference: "BANK_REF_TEST",
          payment_method: {
            card: {
              card_number: "XXXXXXXXXXXX1111",
              card_network: "VISA",
              card_type: "debit_card",
            },
          },
        },
      },
    };

    // 3️⃣ Call webhook endpoint
    await request(app)
      .post("/webhooks/cashfree") // ✅ corrected path
      .send(webhookPayload)
      .set("Content-Type", "application/json")
      .expect(200);

    // 4️⃣ Fetch updated bill from DB
    const updatedBill = await Bill.findByPk(bill.id);

    // 5️⃣ Assert status + payment reference
    expect(updatedBill.status).toBe("PAID");
    expect(updatedBill.bank_ref).toBe("BANK_REF_TEST");
  });
});
