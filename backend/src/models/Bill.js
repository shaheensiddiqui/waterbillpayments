//Bill.js

const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Bill = sequelize.define("Bill", {
  bill_number: { type: DataTypes.STRING, allowNull: false, unique: true },
  consumer_name: DataTypes.STRING,
  email: DataTypes.STRING,
  address: DataTypes.TEXT,
  service_period_start: DataTypes.DATEONLY,
  service_period_end: DataTypes.DATEONLY,
  due_date: DataTypes.DATEONLY,
  base_amount: DataTypes.DECIMAL(10, 2),
  penalty_amount: DataTypes.DECIMAL(10, 2),
  total_amount: DataTypes.DECIMAL(10, 2),
  status: DataTypes.ENUM(
    "CREATED",
    "LINK_SENT",
    "PAYMENT_PENDING",
    "PAID",
    "CANCELLED",
    "EXPIRED"
  ),
  bank_ref: DataTypes.STRING,
});

module.exports = Bill; // ✅ not { Bill }
