const express = require("express");
require("dotenv").config();

const sequelize = require("./config/db");
const Bill = require("./models/Bill");
const billsRouter = require("./routes/bills");

const app = express();
app.use(express.json());

const cors = require("cors");
app.use(cors());

// test route
app.get("/", (req, res) => {
  res.send("Backend API is running");
});

// bills route
app.use("/api/bills", billsRouter);

// paylinks route
const paylinkRoutes = require("./routes/paylinks");
app.use("/api/paylinks", paylinkRoutes);

// webhooks route
const webhookRoutes = require("./routes/webhooks");
app.use("/webhooks", webhookRoutes);

// email route
const emailRoutes = require("./routes/email");
app.use("/api/email", emailRoutes);

// dashboard route
const dashboardRoutes = require("./routes/dashboard");
app.use("/api/dashboard", dashboardRoutes);

// start server + DB sync
const PORT = process.env.PORT || 4000;
sequelize.sync({ alter: true }).then(() => {
  app.listen(PORT, () => {
    console.log(`Backend running on http://localhost:${PORT}`);
  });
});
