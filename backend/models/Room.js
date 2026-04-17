const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema({
  currentTemp: { type: Number, default: 30 },
  targetTemp: { type: Number, default: 24 },
  occupancy: { type: Number, default: 0 },
  comfortScore: { type: Number, default: 0 },
  energyUsage: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  autoMode: { type: Boolean, default: false },
  meetingTime: { type: String },

});

module.exports = mongoose.model("Room", roomSchema);