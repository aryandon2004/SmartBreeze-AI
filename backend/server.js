const { Server } = require("socket.io");
const express = require("express");
const http = require("http");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require('path');
const mongoose = require("mongoose");

// Load environment variables
const dotenvResult = dotenv.config();
if (dotenvResult.error) {
  const parentEnvPath = path.resolve(__dirname, '../.env');
  const parentResult = dotenv.config({ path: parentEnvPath });
  if (!parentResult.error) {
    console.log(`Loaded environment from ${parentEnvPath}`);
  }
}

const app = express();

app.use(cors());
app.use(express.json());

// ================= GLOBAL STATE =================
global.peopleCount = 0;
global.schedule = {
  start: null,
  end: null
};
global.ac = { status: "OFF" };
global.mode = "AUTO";

// 🔥 Heatmap storage
global.heatmap = [];

// ================= AI DETECTION =================
app.post("/api/detection", (req, res) => {

  // ✅ FIX: safe destructuring (VERY IMPORTANT)
  const { people = 0, positions = [] } = req.body;

  global.peopleCount = people;

  console.log("Mode:", global.mode, "| People:", people);

  // ✅ FIX: always handle positions safely
  if (Array.isArray(positions) && positions.length > 0) {
    global.heatmap.push(...positions);

    // limit size (unchanged logic)
    global.heatmap = global.heatmap.slice(-100);
  }

  // AUTO mode
  if (global.mode === "AUTO") {
    global.ac = {
      status: people === 0 ? "OFF" : "ON"
    };
  }

  res.json({ status: "ok" });
});

// ================= MANUAL AC CONTROL =================
app.post("/api/control/ac", (req, res) => {
  const { status } = req.body;

  global.mode = "MANUAL";
  global.ac = { status };

  console.log("Manual mode active → AC:", status);

  res.json({ message: "AC updated (Manual Mode)", ac: global.ac });
});

// ================= MODE SWITCH =================
app.post("/api/control/mode", (req, res) => {
  const { mode } = req.body;

  global.mode = mode;

  console.log("Mode switched to:", mode);

  res.json({ message: `Mode changed to ${mode}` });
});

// ================= STATUS =================
app.get("/api/control/status", (req, res) => {
  res.json({
    room: {
      occupancy: global.peopleCount || 0,
      currentTemp: 24 + Math.random() * 4,
      energyUsage: global.peopleCount * 0.5
    },
    ac: global.ac,
    mode: global.mode,
    schedule: global.schedule   //  THIS
  });
});

// ================= HEATMAP API =================
app.get("/api/heatmap", (req, res) => {
  res.json({
    points: global.heatmap || []
  });
});


// ================= SCHEDULE API=================
app.post("/api/schedule", (req, res) => {

  const { start, end } = req.body;

  global.schedule.start = start;
  global.schedule.end = end;

  console.log("Meeting saved:", global.schedule);

  res.json({ message: "Schedule saved successfully" });

});
setInterval(() => {

  // ❌ If no meeting → do nothing
  if (!global.schedule.start || !global.schedule.end) return;

  const now = new Date();                 // current time
  const start = new Date(global.schedule.start);
  const end = new Date(global.schedule.end);

  // 🔥 10 minutes before meeting
  const beforeStart = new Date(start.getTime() - 10 * 60000);

  // ✅ CONDITION 1 → before meeting
  if (now >= beforeStart && now <= end) {
    global.ac = { status: "ON" };
    console.log("AC ON (meeting time)");
  }

  // ❌ CONDITION 2 → after meeting
  else if (now > end) {
    global.ac = { status: "OFF" };
    console.log("AC OFF (meeting ended)");
  }

}, 5000); // runs every 5 seconds

// ================= DATABASE =================
const mongoUri =
  process.env.MONGO_URI ||
  process.env.MONGODB_URI ||
  process.env.DATABASE_URL ||
  'mongodb://127.0.0.1:27017/smart_ac_ai';

const sanitizedMongoUri =
  typeof mongoUri === 'string' ? mongoUri.split('?')[0] : mongoUri;

if (typeof mongoUri !== 'string' || mongoUri.length === 0) {
  console.error('MongoDB connection string is not defined.');
  process.exit(1);
}

mongoose.connect(sanitizedMongoUri)
  .then(() => console.log('MongoDB Connected ✅', sanitizedMongoUri))
  .catch((err) => console.error('MongoDB Connection Error ❌', err));

// ================= TEST =================
app.get("/", (req, res) => {
  res.send("Smart AC AI Backend Running 🚀");
});

// ================= SERVER =================
const DEFAULT_PORT = 5001;
const MAX_PORT_TRIES = 0;

function startServer(port, attemptsLeft) {
  const server = http.createServer(app);
  const io = new Server(server, { cors: { origin: "*" } });

  io.on("connection", (socket) => {
    console.log("⚡ Client connected");
    socket.on("disconnect", () => {
      console.log("❌ Client disconnected");
    });
  });

  server.on('listening', () => {
    console.log(`Server running on port ${port}`);
  });

  server.on('error', (err) => {
    if (err && err.code === 'EADDRINUSE') {
      console.error("❌ Port 5001 already in use. Please free the port.");
      process.exit(1);
    } else {
      console.error('Server failed to start:', err);
      process.exit(1);
    }
  });

  server.listen(port);
}

startServer(DEFAULT_PORT, MAX_PORT_TRIES);