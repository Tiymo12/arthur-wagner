// src/components/ChatWidget.js
import React, { useState, useRef, useEffect } from "react";

export default function ChatWidget({ persona }) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    { from: "bot", text: "Hi! Ich bin dein Coach-Assistant. Wie kann ich dir helfen?" }
  ]);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, open]);

  const send = async (e) => {
    if (e) e.preventDefault();
    const text = input.trim();
    if (!text) return;
    const userMsg = { from: "user", text };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, persona })
      });
      const data = await res.json();
      if (res.ok) {
        setMessages(prev => [...prev, { from: "bot", text: data.reply }]);
        if (data.needsHuman) {
          // Hinweis: Backend hat erkannt, dass eine Eskalation nötig ist
          setMessages(prev => [...prev, { from: "bot", text: "⚠️ Ich habe das an das Team gemeldet. Ein Mensch wird sich melden." }]);
        }
      } else {
        setMessages(prev => [...prev, { from: "bot", text: "Fehler: " + (data.error || "Serverfehler") }]);
      }
    } catch (err) {
      setMessages(prev => [...prev, { from: "bot", text: "Netzwerkfehler. Bitte später erneut versuchen." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: "fixed", right: 20, bottom: 20, zIndex: 9999 }}>
      <div>
        <button onClick={() => setOpen(o => !o)} style={toggleButtonStyle}>
          {open ? "Chat schließen" : "Chat starten"}
        </button>
      </div>

      {open && (
        <div style={widgetStyle}>
          <div style={headerStyle}>
            <strong>CoachChat</strong>
          </div>

          <div style={messagesStyle} ref={scrollRef}>
            {messages.map((m, i) => (
              <div key={i} style={m.from === "user" ? userMsgStyle : botMsgStyle}>
                {m.text}
              </div>
            ))}
          </div>

          <form onSubmit={send} style={formStyle}>
            <input
              style={inputStyle}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Schreibe deine Nachricht..."
              disabled={loading}
            />
            <button type="submit" style={sendBtnStyle} disabled={loading}>
              {loading ? "..." : "Senden"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

// --- Styles (inline to keep es simple) ---
const toggleButtonStyle = {
  background: "#007bff", color: "white", border: "none", padding: "10px 14px", borderRadius: 8, cursor: "pointer"
};
const widgetStyle = {
  width: 320, height: 420, background: "white", boxShadow: "0 6px 24px rgba(0,0,0,0.2)", borderRadius: 10, overflow: "hidden", display: "flex", flexDirection: "column"
};
const headerStyle = {
  padding: "10px 12px", background: "#0b5ed7", color: "white"
};
const messagesStyle = {
  padding: 12, flex: 1, overflowY: "auto", background: "#f7f7f7"
};
const userMsgStyle = {
  textAlign: "right", margin: "8px 0", background: "#dcf8c6", display: "inline-block", padding: "8px 10px", borderRadius: 8
};
const botMsgStyle = {
  textAlign: "left", margin: "8px 0", background: "white", display: "inline-block", padding: "8px 10px", borderRadius: 8
};
const formStyle = { display: "flex", gap: 8, padding: 12, borderTop: "1px solid #eee" };
const inputStyle = { flex: 1, padding: "8px 10px", borderRadius: 6, border: "1px solid #ccc" };
const sendBtnStyle = { background: "#0b5ed7", color: "white", border: "none", padding: "8px 12px", borderRadius: 6, cursor: "pointer" };
