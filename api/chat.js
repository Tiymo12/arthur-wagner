// api/chat.js
// Vercel Serverless Function (Node). Schützt deinen OpenAI API Key (serverseitig).

const OPENAI_URL = "https://api.openai.com/v1/chat/completions";

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { message, persona } = req.body || {};
  if (!message || message.trim().length === 0) {
    return res.status(400).json({ error: "No message provided" });
  }

  const OPENAI_KEY = process.env.OPENAI_API_KEY;
  if (!OPENAI_KEY) {
    return res.status(500).json({ error: "OpenAI API key not configured (process.env.OPENAI_API_KEY)" });
  }

  // Default system prompt (anpassbar)
  const systemPrompt = persona || `Du bist ein freundlicher, professioneller Chat-Assistent für einen Coach.
Sprich kurz (2-4 Sätze), motivierend, hilfsbereit. Wenn die Anfrage nach persönlicher/medizinischer/therapeutischer Beratung klingt,
sag freundlich, dass du kein Ersatz für medizinische/therapeutische Beratung bist und biete an, ein persönliches Gespräch zu buchen.
Frage bei Bedarf nach Name, Ziel und Zeitrahmen.`;

  try {
    const payload = {
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message }
      ],
      temperature: 0.6,
      max_tokens: 500,
      n: 1
    };

    const r = await fetch(OPENAI_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENAI_KEY}`
      },
      body: JSON.stringify(payload)
    });

    if (!r.ok) {
      const text = await r.text();
      return res.status(r.status).json({ error: `OpenAI API error: ${text}` });
    }

    const data = await r.json();
    const reply = data.choices?.[0]?.message?.content ?? "Tut mir leid, da ist etwas schiefgelaufen.";

    // Optional: einfache Heuristik für Eskalation (wenn sensible Wörter vorkommen)
    const lower = message.toLowerCase();
    const sensitive = ["notfall","suizid","selbstmord","verletzung","medizin","arzt"];
    const needsHuman = sensitive.some(s => lower.includes(s));
    if (needsHuman) {
      return res.status(200).json({
        reply: "Das klingt wichtig — ich leite das an das Team weiter. Bitte erwarte bald eine persönliche Rückmeldung.",
        needsHuman: true
      });
    }

    return res.status(200).json({ reply });
  } catch (err) {
    console.error("API error:", err);
    return res.status(500).json({ error: err.message || "Server error" });
  }
};
