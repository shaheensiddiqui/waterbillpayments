const Bill = require("./Bill");
const PaymentLink = require("./PaymentLink");
const EmailLog = require("./EmailLog");

// Define associations here
Bill.hasMany(PaymentLink, { foreignKey: "bill_id" });
PaymentLink.belongsTo(Bill, { foreignKey: "bill_id" });

Bill.hasMany(EmailLog, { foreignKey: "bill_id" });
EmailLog.belongsTo(Bill, { foreignKey: "bill_id" });

module.exports = { Bill, PaymentLink, EmailLog };
