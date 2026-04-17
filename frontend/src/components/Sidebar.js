import React from "react";

function Sidebar({ setPage, page }) {
  const menu = [
    { name: "Dashboard", key: "dashboard" },
    { name: "Detection", key: "detection" },
    { name: "Heatmap", key: "heatmap" }
  ];

  return (
    <div style={styles.sidebar}>
      <h2 style={{ color: "#38bdf8" }}>SmartBreeze</h2>

      {menu.map((item) => (
        <div
          key={item.key}
          onClick={() => setPage(item.key)}
          style={{
            ...styles.item,
            background: page === item.key ? "#1e293b" : "transparent"
          }}
        >
          {item.name}
        </div>
      ))}
    </div>
  );
}

const styles = {
  sidebar: {
    width: "220px",
    height: "100vh",
    background: "#020617",
    position: "fixed",
    padding: "20px"
  },
  item: {
    padding: "12px",
    marginTop: "10px",
    borderRadius: "8px",
    cursor: "pointer"
  }
};

export default Sidebar;