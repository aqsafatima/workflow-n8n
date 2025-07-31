import React, { useState } from "react";

function App() {
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("Sending...");
    try {
      // Use your n8n webhook URL here
      const webhookUrl = "http://localhost:5678/webhook/message";
      const res = await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });
      if (res.ok) {
        setStatus("Message sent! Check your email soon.");
      } else {
        setStatus("Failed to send message.");
      }
    } catch (err) {
      setStatus("Error: " + err.message);
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: "2rem auto", fontFamily: "sans-serif" }}>
      <h2>Send a Message</h2>
      <form onSubmit={handleSubmit}>
        <textarea
          rows={4}
          style={{ width: "100%" }}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your message here..."
          required
        />
        <button type="submit" style={{ marginTop: 10 }}>Send</button>
      </form>
      <div style={{ marginTop: 20 }}>{status}</div>
    </div>
  );
}

export default App;