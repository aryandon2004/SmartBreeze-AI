import React, { useEffect, useRef, useState } from "react";
import axios from "axios";

const API = "http://127.0.0.1:5001";

function LiveDetection() {

  const videoRef = useRef();
  const [people, setPeople] = useState(0);

  useEffect(() => {

    // 🎥 Start Camera
    navigator.mediaDevices.getUserMedia({ video: true })
      .then(stream => {
        videoRef.current.srcObject = stream;
      });

    const interval = setInterval(async () => {
      try {
        const res = await axios.get(`${API}/api/control/status`);
        const count = res.data.room.occupancy;

        setPeople(count);

        // 🔥 AUTO AC (SMART LOGIC)
        if (count > 0) {
          await axios.post(`${API}/api/control/ac`, { status: "ON" });
        } else {
          await axios.post(`${API}/api/control/ac`, { status: "OFF" });
        }

      } catch {
        console.log("Detection API error");
      }
    }, 3000);

    return () => clearInterval(interval);

  }, []);

  return (
    <div style={{ marginTop: "20px" }}>

      <h3>📷 Live Detection</h3>

      <video
        ref={videoRef}
        autoPlay
        width="400"
        style={{ borderRadius: "10px" }}
      />

      <h3>👥 Detected People: {people}</h3>

    </div>
  );
}

export default LiveDetection;