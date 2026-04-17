import { Line } from "react-chartjs-2";
import { useState, useEffect } from "react";
import axios from "axios";

import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
} from "chart.js";

// ✅ Register chart
ChartJS.register(
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement
);

function EnergyChart() {
  const [energy, setEnergy] = useState([]);

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await axios.get(
          "http://127.0.0.1:5002/api/control/energy"
        );

        setEnergy((prev) => [...prev, res.data.energyUsage]);
      } catch (err) {
        console.log("Energy API failed");
      }
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const data = {
    labels: energy.map((_, i) => i),
    datasets: [
      {
        label: "Energy Usage",
        data: energy,
      },
    ],
  };

  return <Line data={data} />;
}

export default EnergyChart;