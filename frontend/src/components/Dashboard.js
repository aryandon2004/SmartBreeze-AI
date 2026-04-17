import axios from "axios";
import EnergyChart from "../EnergyChart";
import LiveDetection from "./LiveDetection";
import { useEffect, useState } from "react";

const API = "http://127.0.0.1:5001";

function Dashboard() {

  const [room, setRoom] = useState({});
  const [ac, setAC] = useState({});

  // 🔥 Fetch data from backend
  const fetchData = async () => {
    try {
      const res = await axios.get(`${API}/api/control/status`);
      setRoom(res.data.room || {});
      setAC(res.data.ac || {});
    } catch (err) {
      console.log("Backend not reachable");
    }
  };

  // 🔁 Auto refresh every 2 sec
  useEffect(() => {
    fetchData();

    const interval = setInterval(fetchData, 2000);
    return () => clearInterval(interval);
  }, []);

  // ❄️ Toggle AC
  const toggleAC = async () => {
    try {
      await axios.post(`${API}/api/control/ac`, {
        status: ac.status === "ON" ? "OFF" : "ON"
      });

      fetchData(); // 🔥 instant UI update
    } catch {
      console.log("AC toggle failed");
    }
  };

  return (
    <div>

      {/* 🔹 EXISTING UI (UNCHANGED) */}
      <h2>🌡 Temperature: {room.currentTemp?.toFixed(1)}</h2>
      <h3>👥 People: {room.occupancy}</h3>

      <h3>❄️ AC: {ac.status}</h3>

      <button onClick={toggleAC}>Toggle AC</button>

      {/* 📊 Energy Chart */}
      <EnergyChart />

      {/* 📹 Live Detection (NEW FEATURE) */}
      <LiveDetection />

    </div>
  );
}

export default Dashboard;