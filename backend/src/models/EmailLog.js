// models/EmailLog.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const EmailLog = sequelize.define("EmailLog", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  bill_id: { type: DataTypes.INTEGER, allowNull: false },
  to_email: { type: DataTypes.STRING, allowNull: false },
  subject: { type: DataTypes.STRING, allowNull: false },
  sent_at: { type: DataTypes.DATE, allowNull: false },
  provider_message_id: { type: DataTypes.STRING },
});

module.exports = EmailLog;
