const mongoose = require("mongoose");

const acSchema = new mongoose.Schema({
  status: { type: String, enum: ["ON", "OFF"], default: "OFF" },
  temperature: { type: Number, default: 24 },
  fanSpeed: { type: Number, default: 1 },
  energyUsage: { type: Number, default: 0 },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("AC", acSchema);