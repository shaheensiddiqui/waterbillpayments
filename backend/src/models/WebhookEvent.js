const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const WebhookEvent = sequelize.define("WebhookEvent", {
  type: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  raw_payload: {
    type: DataTypes.TEXT("long"), // full JSON payload
    allowNull: false,
  },
  headers: {
    type: DataTypes.TEXT("long"), // save request headers
    allowNull: true,
  },
  verified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  status: {
    type: DataTypes.ENUM("RECEIVED", "PROCESSED", "FAILED"),
    defaultValue: "RECEIVED",
  },
  received_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  processed_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
});

module.exports = WebhookEvent;