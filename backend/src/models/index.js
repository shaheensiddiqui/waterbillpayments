// models/index.js
const Bill = require("./Bill");
const PaymentLink = require("./PaymentLink");
const EmailLog = require("./EmailLog");
const Transaction = require("./Transaction");
const WebhookEvent = require("./WebhookEvent");

// Associations
Bill.hasMany(PaymentLink, { foreignKey: "bill_id", onDelete: "CASCADE" });
PaymentLink.belongsTo(Bill, { foreignKey: "bill_id", onDelete: "CASCADE" });

Bill.hasMany(EmailLog, { foreignKey: "bill_id", onDelete: "CASCADE" });
EmailLog.belongsTo(Bill, { foreignKey: "bill_id", onDelete: "CASCADE" });

module.exports = { Bill, PaymentLink, EmailLog, Transaction, WebhookEvent };
