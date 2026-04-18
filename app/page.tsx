"use client";
import { useState } from "react";

export default function Home() {
  const [input, setInput] = useState("");
  const [result, setResult] = useState("");

  const improveTask = async () => {
    const res = await fetch("/api/ai", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text: input }),
    });

    const data = await res.json();
    setResult(data.improved);
  };

  return (
    <div style={{ padding: 40 }}>
      <h1>AI Task Assistant</h1>

      <input
        type="text"
        placeholder="Enter your task..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
        style={{ padding: 10, width: "300px" }}
      />

      <br /><br />

      <button onClick={improveTask}>
        Improve Task
      </button>

      <p><strong>AI Output:</strong> {result}</p>
    </div>
  );
}
