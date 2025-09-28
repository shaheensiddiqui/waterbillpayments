const express = require("express");      
const fs = require("fs");                 
const path = require("path");            

//starting the app
const app = express();
app.use(express.json());



const billsFile = path.join(__dirname, "data", "bills.json");


function loadBills() {
  const fileText = fs.readFileSync(billsFile, "utf8"); 
  return JSON.parse(fileText);                          
}

function saveBills(bills) {
  fs.writeFileSync(billsFile, JSON.stringify(bills, null, 2));
}



app.get("/mock-bank/bills/:billNumber", (req, res) => {
  const bills = loadBills();                      
  const billNumber = req.params.billNumber;       
  const bill = bills[billNumber];                 

  if (!bill) {
    return res.status(404).json({ error: "Bill not found" });
  }

  if (bill.status === "PAID") {
    return res.status(409).json({ error: "Bill already paid" });
  }

  res.json(bill);
});

app.post("/mock-bank/bills/:billNumber/mark-paid", (req, res) => {
  const bills = loadBills();
  const billNumber = req.params.billNumber;
  const bill = bills[billNumber];

  if (!bill) {
    return res.status(404).json({ error: "Bill not found" });
  }

  if (bill.status === "PAID") {
    return res.status(409).json({ error: "Bill already paid" });
  }

  const { payment_ref, paid_amount, paid_at } = req.body;

  if (paid_amount !== bill.total_amount) {
    return res.status(422).json({ error: "Amount mismatch" });
  }

  bill.status = "PAID";
  bill.payment_ref = payment_ref;
  bill.paid_at = paid_at;

  bills[billNumber] = bill;
  saveBills(bills);

  res.json({ message: "Bill marked as paid", bill });
});



const PORT = 4001;
app.listen(PORT, () => {
  console.log(`Mock Bank API running on http://localhost:${PORT}`);
});
