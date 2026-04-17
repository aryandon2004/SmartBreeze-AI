import React, { useEffect, useState } from "react";
import axios from "axios";

const API = "http://127.0.0.1:5001";

function Heatmap() {
  const [data, setData] = useState([0,0,0,0,0,0,0,0,0]);

  useEffect(() => {
    setInterval(async () => {
      const res = await axios.get(`${API}/api/control/status`);
      const people = res.data.room.occupancy;

      // simple distribution
      const newGrid = Array(9).fill(0);
      newGrid[Math.floor(Math.random()*9)] = people;

      setData(newGrid);
    }, 3000);
  }, []);

  return (
    <div>
      <h2>🔥 Heatmap</h2>

      <div style={gridStyle}>
        {data.map((val, i) => (
          <div key={i} style={{
            ...cellStyle,
            background: `rgba(255,0,0,${val/5})`
          }}>
            {val}
          </div>
        ))}
      </div>
    </div>
  );
}

const gridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(3, 100px)",
  gap: "10px"
};

const cellStyle = {
  height: "100px",
  color: "white",
  display: "flex",
  alignItems: "center",
  justifyContent: "center"
};

export default Heatmap;