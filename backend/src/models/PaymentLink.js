// models/PaymentLink.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const PaymentLink = sequelize.define("PaymentLink", {
  cf_link_id: DataTypes.STRING,   
  link_id: DataTypes.STRING,      
  link_url: DataTypes.STRING,
  amount: DataTypes.DECIMAL(10, 2),
  currency: DataTypes.STRING,
  status: DataTypes.STRING,
  expires_at: DataTypes.DATE,
  bill_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
});

module.exports = PaymentLink;
