const axios = require("axios");

//makes a get request to the mock bank API
async function getBillFromMockBank(billNumber) {
  const res = await axios.get(`http://localhost:4001/mock-bank/bills/${billNumber}`);
  return res.data;
}

module.exports = { getBillFromMockBank };
