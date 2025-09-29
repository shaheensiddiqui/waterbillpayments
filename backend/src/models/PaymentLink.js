const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const PaymentLink = sequelize.define("PaymentLink", {
  bill_id: { type: DataTypes.INTEGER, allowNull: false },
  cf_link_id: { type: DataTypes.STRING }, // not INTEGER
  link_id: { type: DataTypes.STRING, unique: true },
  link_url: DataTypes.TEXT,
  amount: DataTypes.DECIMAL(10, 2),
  currency: { type: DataTypes.STRING(3), defaultValue: "INR" },
  expires_at: DataTypes.DATE,
  status: {
    type: DataTypes.ENUM("ACTIVE", "PAID", "CANCELLED", "EXPIRED"),
    defaultValue: "ACTIVE"
  }
});

module.exports = PaymentLink;
