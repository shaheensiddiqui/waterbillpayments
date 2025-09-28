const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const EmailLog = sequelize.define("EmailLog", {
  bill_id: { type: DataTypes.INTEGER, allowNull: false },
  to_email: { type: DataTypes.STRING, allowNull: false },
  subject: DataTypes.STRING,
  sent_at: DataTypes.DATE,
  provider_message_id: DataTypes.STRING,
});

module.exports = EmailLog;
