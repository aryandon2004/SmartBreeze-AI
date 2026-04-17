const Room = require("../models/Room");
const AC = require("../models/AC");

// 🔹 Update occupancy
exports.setOccupancy = async (req, res) => {
  const { count } = req.body;

  let room = await Room.findOne();
  if (!room) room = await Room.create({});

  room.occupancy = count;
  await room.save();

  res.json({ message: "Occupancy updated", occupancy: count });
};

// 🔹 Control AC
exports.controlAC = async (req, res) => {
  const { status, temperature, fanSpeed } = req.body;

  let ac = await AC.findOne();
  if (!ac) ac = await AC.create({});

  if (status) ac.status = status;
  if (temperature) ac.temperature = temperature;
  if (fanSpeed) ac.fanSpeed = fanSpeed;

  await ac.save();

  res.json({ message: "AC updated", ac });
};

// 🔹 Get system state
exports.getStatus = async (req, res) => {
  const room = await Room.findOne();
  const ac = await AC.findOne();

  res.json({ room, ac });
};