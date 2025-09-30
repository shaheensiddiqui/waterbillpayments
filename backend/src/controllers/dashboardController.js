// controllers/dashboardController.js
const Bill = require("../models/Bill");
const { Op } = require("sequelize");

async function dashboardSummary(req, res) {
  try {
    const totalBills = await Bill.count();
    const paidBills = await Bill.count({ where: { status: "PAID" } });
    const unpaidBills = await Bill.count({
      where: { status: { [Op.in]: ["CREATED", "LINK_SENT", "PAYMENT_PENDING"] } },
    });

    const totalRevenue = await Bill.sum("total_amount", { where: { status: "PAID" } });

    res.json({
      totalBills,
      paidBills,
      unpaidBills,
      totalRevenue: totalRevenue || 0,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = { dashboardSummary };
