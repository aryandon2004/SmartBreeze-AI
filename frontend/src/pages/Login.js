import React, { useState } from "react";

function Login({ setLoggedIn }) {
  const [user, setUser] = useState("");

  return (
    <div style={{ textAlign: "center", marginTop: "100px" }}>
      <h2>Login</h2>

      <input
        placeholder="Enter username"
        onChange={(e) => setUser(e.target.value)}
      />

      <br /><br />

      <button onClick={() => setLoggedIn(true)}>
        Login
      </button>
    </div>
  );
}

export default Login;