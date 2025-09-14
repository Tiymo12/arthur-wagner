import ChatWidget from "./components/ChatWidget";
import React from "react";
import "./App.css";

function App() {
  return (
    <div className="App">
      {/* Header */}
      <header className="header">
        <h1>Arthur Wagner Coaching</h1>
        <p>Dein Coach für Persönlichkeitsentwicklung und Business-Erfolg</p>
      </header>

      {/* Hero Section */}
      <section className="hero">
        <h2>Starte jetzt deine Reise zur besten Version deiner selbst</h2>
        <p>
          Gewinne Klarheit, Motivation und Fokus – mit Arthur Wagner und deinem
          persönlichen AI-Chatbot, der dich sofort unterstützt.
        </p>
      </section>

      {/* Features */}
      <section className="features">
        <div className="feature">
          <h3>🌟 Persönliche Entwicklung</h3>
          <p>Finde deine Stärken und arbeite gezielt an deinen Zielen.</p>
        </div>
        <div className="feature">
          <h3>🚀 Business Coaching</h3>
          <p>Mehr Fokus, bessere Strategien und nachhaltiger Erfolg.</p>
        </div>
        <div className="feature">
          <h3>💬 AI-Unterstützung</h3>
          <p>Dein Chatbot steht dir 24/7 mit Tipps, Motivation und Inspiration zur Seite.</p>
        </div>
      </section>

      {/* Call to Action / Demo */}
      <section className="cta">
        <h2>Kostenloses Erstgespräch anfragen</h2>
        <form
          action="https://formspree.io/f/xdklbbpr" 
          method="POST"
          target="_blank"
        >
          <input
            type="text"
            name="name"
            placeholder="Dein Name"
            required
          />
          <input
            type="email"
            name="email"
            placeholder="Deine E-Mail"
            required
          />
          <textarea
            name="message"
            placeholder="Schreibe kurz, worum es geht"
            required
          ></textarea>
          <button type="submit" className="btn">Jetzt Erstgespräch sichern</button>
        </form>
        <p>Nach Absenden bekommst du eine Bestätigung per E-Mail.</p>
      </section>

      {/* Footer */}
      <footer className="footer">
        <p>© 2025 Arthur Wagner Coaching – Alle Rechte vorbehalten</p>
      </footer>

      <ChatWidget persona={`Du bist der offizielle Chat von Arthur Wagner.  
Sprich professionell, freundlich und inspirierend.  
Deine Zielgruppe: Menschen zwischen 25 und 45, die Persönlichkeitsentwicklung oder Business-Coaching suchen.  

Antworten: abwechslungsreich, mit motivierenden Beispielen, Emojis (🚀🌟💡), mal Tipps, mal Fragen zurück.  
Wenn jemand 'ja' sagt bei einem Termin, dann antworte:  
„Super 🙌! Klick links auf den Button **Kostenloses Erstgespräch anfragen**, trag deinen Namen und deine E-Mail ein und schreib kurz, worum es geht.“  

Keine Preise nennen, keine medizinischen Ratschläge. Verweise bei Beschwerden an Fachleute.`} />
    </div>
  );
}

export default App;
