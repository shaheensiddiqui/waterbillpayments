const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const Bill = require("./Bill");

const Transaction = sequelize.define("Transaction", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  bill_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: "Bills", key: "id" },
    onDelete: "CASCADE",
  },
  cf_order_id: { type: DataTypes.STRING },
  payment_session_id: { type: DataTypes.STRING },
  cf_payment_id: { type: DataTypes.STRING },
  amount: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  currency: { type: DataTypes.STRING, defaultValue: "INR" },
  mode: { type: DataTypes.STRING }, // UPI, CARD, NETBANKING, etc.
  status: {
    type: DataTypes.ENUM("SUCCESS", "FAILED", "PENDING"),
    allowNull: false,
  },
}, {
  timestamps: true,
});

// associations
Bill.hasMany(Transaction, { foreignKey: "bill_id" });
Transaction.belongsTo(Bill, { foreignKey: "bill_id" });

module.exports = Transaction;
