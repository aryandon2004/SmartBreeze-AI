const Room = require("../models/Room");
const AC = require("../models/AC");

async function runSimulation(io) {
  let room = await Room.findOne();
  let ac = await AC.findOne();

  // 🔹 Create default records
  if (!room) room = await Room.create({});
  if (!ac) ac = await AC.create({});

  let temp = room.currentTemp || 28;

  // =========================
  // 🌡️ TEMPERATURE LOGIC
  // =========================

  // Heat from people
  temp += (room.occupancy || 0) * 0.1;

  // Cooling from AC
  if (ac.status === "ON") {
    temp -= 0.3 * (ac.fanSpeed || 1);
  }

  // Limit realistic temp
  temp = Math.max(16, Math.min(40, temp));

  // Comfort score
  const ideal = 24;
  const comfortScore = Math.max(0, 100 - Math.abs(temp - ideal) * 5);

  // =========================
  // 🤖 AUTO MODE LOGIC
  // =========================
  if (room.autoMode) {
    if (room.occupancy > 0) {
      ac.status = "ON";
    } else {
      ac.status = "OFF";
    }

    // Smart fan speed
    if (room.occupancy >= 5) {
      ac.fanSpeed = 4;
    } else if (room.occupancy >= 3) {
      ac.fanSpeed = 3;
    } else {
      ac.fanSpeed = 1;
    }
  }

  // =========================
  // ⏰ SCHEDULER LOGIC
  // =========================
  if (room.meetingTime) {
    const now = new Date();

    const [hour, min] = room.meetingTime.split(":");

    const meeting = new Date();
    meeting.setHours(parseInt(hour));
    meeting.setMinutes(parseInt(min));
    meeting.setSeconds(0);

    const diff = (meeting - now) / 60000;

    // Turn ON 10 minutes before meeting
    if (diff <= 10 && diff > 0) {
      ac.status = "ON";
    }
  }

  // =========================
  // ⚡ ENERGY CALCULATION
  // =========================
  let energyUsage = room.energyUsage || 0;

  if (ac.status === "ON") {
    energyUsage += 0.5 * (ac.fanSpeed || 1);
  }

  // =========================
  // 💾 SAVE DATA
  // =========================
  room.currentTemp = temp;
  room.comfortScore = comfortScore;
  room.energyUsage = energyUsage;
  room.updatedAt = Date.now();

  await room.save();
  await ac.save();

  // =========================
  // 📡 REAL-TIME UPDATE
  // =========================
  if (io) {
    io.emit("update", { room, ac });
  }

  // =========================
  // 🧪 DEBUG LOG
  // =========================
  console.log(
    `Temp: ${temp.toFixed(2)}°C | Occupancy: ${room.occupancy} | AutoMode: ${room.autoMode} | AC: ${ac.status} | Energy: ${energyUsage.toFixed(2)}`
  );
}

module.exports = runSimulation;