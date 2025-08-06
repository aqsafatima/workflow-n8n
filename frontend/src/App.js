import React, { useState } from "react";

const API_BASE = "http://localhost:3001"; // Backend URL

function App() {
  const [view, setView] = useState("login"); // "login" | "register" | "message"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("");

  // Handle registration
  const handleRegister = async (e) => {
    e.preventDefault();
    setStatus("Registering...");
    try {
      const res = await fetch(`${API_BASE}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (res.ok) {
        setStatus("Registration successful! Please log in.");
        setView("login");
      } else {
        setStatus(data.error || "Registration failed.");
      }
    } catch (err) {
      setStatus("Error: " + err.message);
    }
  };

  // Handle login
  const handleLogin = async (e) => {
    e.preventDefault();
    setStatus("Logging in...");
    try {
      const res = await fetch(`${API_BASE}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (res.ok && data.token) {
        setToken(data.token);
        localStorage.setItem("token", data.token);
        setStatus("Login successful!");
        setView("message");
      } else {
        setStatus(data.error || "Login failed.");
      }
    } catch (err) {
      setStatus("Error: " + err.message);
    }
  };

  // Handle message send
  const N8N_WEBHOOK_URL = "http://localhost:5678/webhook-test/message"; // or your actual n8n webhook URL

const handleSend = async (e) => {
  e.preventDefault();
  setStatus("Sending...");
  try {
    const res = await fetch(N8N_WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message,
        token, // include the JWT token in the body
        email, // if you want to send to self, or add a recipient field
      }),
    });
    const data = await res.json();
    if (res.ok) {
      setStatus("Message sent! Check your email.");
    } else {
      setStatus(data.error || "Failed to send message.");
    }
  } catch (err) {
    setStatus("Error: " + err.message);
  }
};

  const handleLogout = () => {
    setToken("");
    localStorage.removeItem("token");
    setView("login");
    setStatus("");
    setEmail("");
    setPassword("");
    setMessage("");
  };

  return (
    <div style={{ maxWidth: 400, margin: "2rem auto", fontFamily: "sans-serif" }}>
      <h2>AI Automation Demo</h2>
      {!token && (
        <div>
          <button onClick={() => setView("login")}>Login</button>
          <button onClick={() => setView("register")}>Register</button>
        </div>
      )}
      {view === "register" && (
        <form onSubmit={handleRegister}>
          <h3>Register</h3>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            style={{ width: "100%", marginBottom: 8 }}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            style={{ width: "100%", marginBottom: 8 }}
          />
          <button type="submit">Register</button>
        </form>
      )}
      {view === "login" && (
        <form onSubmit={handleLogin}>
          <h3>Login</h3>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            style={{ width: "100%", marginBottom: 8 }}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            style={{ width: "100%", marginBottom: 8 }}
          />
          <button type="submit">Login</button>
        </form>
      )}
      {token && view === "message" && (
        <form onSubmit={handleSend}>
          <h3>Send a Message</h3>
          <textarea
            rows={4}
            style={{ width: "100%" }}
            value={message}
            onChange={e => setMessage(e.target.value)}
            placeholder="Type your message here..."
            required
          />
          <button type="submit" style={{ marginTop: 10 }}>Send</button>
          <button type="button" onClick={handleLogout} style={{ marginLeft: 10 }}>
            Logout
          </button>
        </form>
      )}
      <div style={{ marginTop: 20 }}>{status}</div>
    </div>
  );
}

export default App;