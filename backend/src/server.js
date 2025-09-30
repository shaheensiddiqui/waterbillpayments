const express = require("express");
require("dotenv").config();

const sequelize = require("./config/db");

// Models (to ensure associations are loaded)
const Bill = require("./models/Bill");
const { Bill: BillModel, PaymentLink, EmailLog } = require("./models");

const app = express();

// ✅ JSON parser with raw body capture (important for webhook signature verification)
app.use(
  express.json({
    verify: (req, res, buf) => {
      req.rawBody = buf.toString(); // store raw body for webhook signature verification
    },
  })
);

const cors = require("cors");
app.use(cors());

// ---------------- ROUTES ----------------

// Health/test route
app.get("/", (req, res) => {
  res.send("Backend API is running 🚀");
});

// Bills
const billsRouter = require("./routes/bills");
app.use("/api/bills", billsRouter);

// Paylinks
const paylinkRoutes = require("./routes/paylinks");
app.use("/api/paylinks", paylinkRoutes);

// Webhooks (Cashfree will call this)
const webhookRoutes = require("./routes/webhooks");
app.use("/webhooks", webhookRoutes); // ✅ now it’s /webhooks not /api/webhooks

// Email
const emailRoutes = require("./routes/email");
app.use("/api/email", emailRoutes);

// Dashboard
const dashboardRoutes = require("./routes/dashboard");
app.use("/api/dashboard", dashboardRoutes);

// Transactions
const transactionRoutes = require("./routes/transactions");
app.use("/api/transactions", transactionRoutes);


// -----------------------------------------

console.log(
  "🔑 Cashfree Secret loaded:",
  process.env.CASHFREE_CLIENT_SECRET ? "YES" : "NO"
);

module.exports = app;

// Start server + DB sync
const PORT = process.env.PORT || 4000;
sequelize.sync({ alter: true }).then(() => {
  app.listen(PORT, () => {
    console.log(`✅ Backend running on http://localhost:${PORT}`);
  });
});
