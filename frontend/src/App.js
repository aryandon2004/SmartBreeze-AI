import React, { useEffect, useState } from "react";
import axios from "axios";
import "./App.css";
import {
  LineChart,
  Line,
  XAxis,
  Tooltip,
  ResponsiveContainer
} from "recharts";

const API = "http://127.0.0.1:5001";

function App() {

  const [room, setRoom] = useState({});
  const [ac, setAC] = useState({});
  const [mode, setMode] = useState("AUTO");
  const [page, setPage] = useState("overview");

  const [history, setHistory] = useState([]);

  // 🔥 NEW: heatmap points
  const [heatmapPoints, setHeatmapPoints] = useState([]);
  const [schedule, setSchedule] = useState({ start: "", end: "" });
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");


  useEffect(() => {
    const fetchData = async () => {
      const res = await axios.get(`${API}/api/control/status`);

      setRoom(res.data.room);
      setAC(res.data.ac);
      setMode(res.data.mode);
      setSchedule(res.data.schedule || {});

      const temp = res.data.room.currentTemp || 25;

      setHistory(prev => {
        const updated = [
          ...prev,
          { time: `${prev.length + 1}`, temp }
        ];
        return updated.slice(-10);
      });
    };

    fetchData();
    const interval = setInterval(fetchData, 2000);

    return () => clearInterval(interval);
  }, []);

  // 🔥 NEW: fetch heatmap data
  useEffect(() => {
    if (page !== "heatmap") return;

    const fetchHeatmap = async () => {
      const res = await axios.get(`${API}/api/heatmap`);
      setHeatmapPoints(res.data.points || []);
    };

    fetchHeatmap();
    const interval = setInterval(fetchHeatmap, 2000);

    return () => clearInterval(interval);
  }, [page]);

  // 🔥 NEW: draw heatmap
  useEffect(() => {
    if (page !== "heatmap") return;

    const canvas = document.getElementById("heatmapCanvas");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const canvasWidth = canvas.width;
const canvasHeight = canvas.height;

heatmapPoints.forEach(p => {

  // ✅ SCALE FIX (ONLY CHANGE)
  const x = (p.x / 640) * canvasWidth;
  const y = (p.y / 480) * canvasHeight;

  const gradient = ctx.createRadialGradient(
    x, y, 5,
    x, y, 30
  );

  gradient.addColorStop(0, "red");
  gradient.addColorStop(1, "transparent");

  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(x, y, 30, 0, 2 * Math.PI);
  ctx.fill();
});

  }, [heatmapPoints, page]);

  const toggleAC = async () => {
    await axios.post(`${API}/api/control/ac`, {
      status: ac.status === "ON" ? "OFF" : "ON"
    });
  };
  const scheduleMeeting = async () => {
  await axios.post(`${API}/api/schedule`, {
    start: startTime,
    end: endTime
  });

  alert("Meeting Scheduled ✅");
};
const cancelMeeting = async () => {
  await axios.post(`${API}/api/schedule`, {
    start: null,
    end: null
  });

  alert("Meeting Cancelled ❌");
};


  const toggleMode = async () => {
    const newMode = mode === "AUTO" ? "MANUAL" : "AUTO";

    await axios.post(`${API}/api/control/mode`, {
      mode: newMode
    });

    setMode(newMode);
  };

  return (
    <div className="app">

      {/* SIDEBAR */}
      <div className="sidebar">
        <h2>🌿 SmartBreeze</h2>

        <div className="menu-item" onClick={() => setPage("overview")}>
          🏡 Overview
        </div>

        <div className="menu-item" onClick={() => setPage("detection")}>
          🌿 Detection
        </div>

        <div className="menu-item" onClick={() => setPage("heatmap")}>
          🌡️ Heatmap
        </div>

        <div className="menu-item" onClick={() => setPage("schedule control")}>
          🕒 Schedule Control
        </div>

        <div style={{ marginTop: "50px", fontSize: "12px" }}>
          System: Online
        </div>
      </div>

      {/* MAIN */}
      <div className="main">

        {page === "overview" && (
          <>
            <h1>SmartBreeze AI</h1>
            <p style={{ color: "#888" }}>Climate Overview</p>

            <div className="grid">

              <div className="card">
                <h4>Temperature</h4>
                <h1>{room.currentTemp?.toFixed(1) || 0} °C</h1>
              </div>

              <div className="card">
                <h4>Occupancy</h4>
                <h1>
                  {room.occupancy || 0}{" "}
                  {room.occupancy === 1 ? "person" : "people"}
                </h1>
              </div>

              <div className="card">
                <h4>Energy</h4>
                <h1>{room.energyUsage || 0} kW</h1>
              </div>
              <div className="card" style={{ marginTop: "20px" }}>
                    <h3>📅 Current Schedule</h3>

                    <p>
                      <strong>Start:</strong>{" "}
                      {schedule.start
                        ? new Date(schedule.start).toLocaleString()
                        : "Not set"}
                    </p>

                    <p>
                      <strong>End:</strong>{" "}
                      {schedule.end
                        ? new Date(schedule.end).toLocaleString()
                        : "Not set"}
                    </p>
                  </div>

            </div>

            {/* Temperature History */}
            <div className="card" style={{ marginTop: "20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <h4>Temperature History</h4>
                <span style={{
                  background: "#e6f4ea",
                  padding: "4px 10px",
                  borderRadius: "20px",
                  fontSize: "12px"
                }}>
                  LIVE
                </span>
              </div>

              <h2 style={{ marginTop: "10px" }}>
                {room.currentTemp?.toFixed(1) || 0}°C
              </h2>

              <div style={{ width: "100%", height: 150 }}>
                <ResponsiveContainer>
                  <LineChart data={history}>
                    <XAxis dataKey="time" />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="temp"
                      stroke="#4caf50"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Climate Control */}
            <div className="card climate-card">

              <h3 className="section-title">CLIMATE CONTROL</h3>

              <div className="air-control">

                <div
                  className={`toggle ${ac.status === "ON" ? "active" : ""}`}
                  onClick={toggleAC}
                >
                  <div className="circle"></div>
                </div>

                <div className="air-text">
                  <h4>Air Control</h4>
                  <p className={ac.status === "ON" ? "active-text" : "inactive-text"}>
                    ● {ac.status === "ON" ? "Active" : "Off"}
                  </p>
                </div>

              </div>

              <div className="mode-buttons">

                <button
                  className={`mode-btn ${mode === "AUTO" ? "selected" : ""}`}
                  onClick={toggleMode}
                >
                  ⚙️ Auto
                </button>

                <button className="mode-btn">❄️ Cool</button>
                <button className="mode-btn">💨 Breeze</button>
                <button className="mode-btn">🌿 Eco</button>

              </div>

            </div>
          </>
        )}

        {/* DETECTION */}
        {page === "detection" && (
          <>
            <h1>Live Detection</h1>

            <h2>👥 People Detected: {room.occupancy || 0}</h2>

            <div className="card" style={{ marginTop: "20px" }}>
              <img
                src="http://127.0.0.1:8000/video"
                alt="Live Detection"
                style={{ width: "100%", borderRadius: "10px" }}
              />
            </div>

            <p style={{ marginTop: "10px", color: "green" }}>
              {Number(room.occupancy) > 0
                ? `Room Occupied - AC ${ac.status}`
                : "Room Empty - AC OFF"}
            </p>
          </>
        )}

        {/* 🔥 UPDATED HEATMAP SECTION */}
        {page === "heatmap" && (
          <>
            <h1>Heatmap Analytics</h1>

            <div className="card" style={{ marginTop: "20px", padding: "20px" }}>

              {/* 🔥 GRID HEATMAP */}
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(12, 1fr)",
                gap: "8px"
              }}>

                {[...Array(96)].map((_, i) => {
                  // 🔥 simulate zones from heatmapPoints
                  const point = heatmapPoints[i % heatmapPoints.length] || { x: 0, y: 0 };

                  const intensity = (point.x + point.y) % 255;

                  let color = "#6b8f5e"; // green

                  if (intensity > 200) color = "#c0392b";      // red
                  else if (intensity > 150) color = "#e67e22"; // orange
                  else if (intensity > 100) color = "#f1c40f"; // yellow

                  return (
                    <div
                      key={i}
                      style={{
                        height: "35px",
                        borderRadius: "8px",
                        background: color,
                        transition: "0.3s"
                      }}
                    ></div>
                  );
                })}

              </div>

              {/* 🔥 LEGEND */}
              <div style={{ marginTop: "20px" }}>
                <div style={{
                  height: "10px",
                  borderRadius: "10px",
                  background: "linear-gradient(to right, #6b8f5e, #f1c40f, #e67e22, #c0392b)"
                }}></div>

                <div style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: "12px",
                  marginTop: "5px"
                }}>
                  <span>Low</span>
                  <span>Medium</span>
                  <span>High</span>
                </div>
              </div>

              {/* 🔥 STATS */}
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                marginTop: "20px"
              }}>

                <div>
                  <h4>Avg</h4>
                  <h2>{room.currentTemp?.toFixed(1) || 0}°C</h2>
                </div>

                <div>
                  <h4>Peak</h4>
                  <h2>{(room.currentTemp + 3)?.toFixed(1) || 0}°C</h2>
                </div>

                <div>
                  <h4>Min</h4>
                  <h2>{(room.currentTemp - 3)?.toFixed(1) || 0}°C</h2>
                </div>

              </div>

            </div>
          </>
        )}

        {/* ✅ NEW SEPARATE PAGE */}
        {page === "schedule control" && (
          <>
            <h1>🕒 Schedule Control</h1>

            <div className="card" style={{ marginTop: "20px" }}>
              <h3>Set Meeting</h3>

              <input
                type="datetime-local"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />

              <input
                type="datetime-local"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                style={{ marginLeft: "10px" }}
              />

              <br /><br />

              <button className="btn" onClick={scheduleMeeting}>
                Set Meeting
              </button>
            </div>

            <div className="card" style={{ marginTop: "20px" }}>
              <h3>Current Schedule</h3>

              <p>
                <strong>Start:</strong>{" "}
                {schedule.start ? new Date(schedule.start).toLocaleString() : "Not set"}
              </p>

              <p>
                <strong>End:</strong>{" "}
                {schedule.end ? new Date(schedule.end).toLocaleString() : "Not set"}
              </p>

              <button
                className="btn"
                style={{ marginTop: "10px", background: "red", color: "white" }}
                onClick={cancelMeeting}
              >
                Cancel Meeting
              </button>
            </div>
          </>
        )}

      </div>
    </div>
  );
}

export default App;