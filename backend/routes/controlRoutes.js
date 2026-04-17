const express = require("express");
const router = express.Router();

const controller = require("../controllers/controlController");
const Room = require("../models/Room");

// ==========================
// 🔹 BASIC ROUTES
// ==========================
router.post("/occupancy", controller.setOccupancy);
router.post("/ac", controller.controlAC);
router.get("/status", controller.getStatus);

// ==========================
// 🔥 ENERGY API
// ==========================
router.get("/energy", async (req, res) => {
  try {
    let room = await Room.findOne();
    if (!room) room = await Room.create({});

    res.json({
      energyUsage: room.energyUsage || 0,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Energy fetch failed" });
  }
});

// ==========================
// 🤖 AUTO MODE TOGGLE
// ==========================
router.post("/mode", async (req, res) => {
  try {
    const { autoMode } = req.body;

    let room = await Room.findOne();
    if (!room) room = await Room.create({});

    room.autoMode = autoMode;
    await room.save();

    console.log("AutoMode updated:", autoMode);

    res.json({ success: true, autoMode });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Auto mode failed" });
  }
});

// ==========================
// ⏰ SCHEDULER
// ==========================
router.post("/schedule", async (req, res) => {
  try {
    const { time } = req.body;

    let room = await Room.findOne();
    if (!room) room = await Room.create({});

    room.meetingTime = time;
    await room.save();

    console.log("Meeting scheduled at:", time);

    res.json({ success: true, meetingTime: time });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Schedule failed" });
  }
});

module.exports = router;