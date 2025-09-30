jest.mock("axios");
const axios = require("axios");
const { markBillPaid } = require("../../services/mockBankService");

describe("mockBankService", () => {
  it("markBillPaid updates bill correctly (mocked)", async () => {
    axios.post.mockResolvedValueOnce({
      data: {
        bill_number: "TEST-BILL-123",
        status: "PAID",
        payment_ref: "TEST_PAYMENT_REF",
      },
    });

    const result = await markBillPaid("TEST-BILL-123", "TEST_PAYMENT_REF", 500);

    expect(result.status).toBe("PAID");
    expect(result.payment_ref).toBe("TEST_PAYMENT_REF");
  });
});
