const OpenAI = require("openai");

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { message, persona, settings } = req.body;

  try {
    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: settings?.temperature || 0.8,
      max_tokens: 180, // kurze Antworten
      messages: [
        {
          role: "system",
          content: `${persona}\n\nAntworte wie ein echter Mensch: kurz, prägnant, max. 2–3 Sätze.`,
        },
        { role: "user", content: message },
      ],
    });

    let reply = completion.choices[0].message.content;
    const lowerMsg = message.trim().toLowerCase();

    // --------------------------------
    // 1. Direkter Terminwunsch vom User
    // --------------------------------
    if (
      lowerMsg.includes("termin") ||
      lowerMsg.includes("erstgespräch") ||
      lowerMsg.includes("gespräch vereinbaren")
    ) {
      return res.json({
        reply:
          "Super 🙌! Klick links auf den Button **Jetzt Erstgespräch sichern**, trag deinen Namen und deine E-Mail ein und schreib kurz, worum es geht.",
      });
    }

   // --------------------------------
// 2. Klare Bestätigung nach Termin-Angebot
// --------------------------------
const yesTriggers = [
  "ja",
  "ja klingt gut",
  "ja gerne",
  "klar",
  "auf jeden fall",
  "definitiv",
  "absolut",
  "passt",
  "alles klar",
  "klingt gut",
  "hört sich gut an"
];

// Nur auslösen, wenn Nachricht kurz ist (<= 5 Wörter)
// So vermeiden wir: "ich möchte gerne abnehmen"
if (
  (yesTriggers.some(trigger => lowerMsg === trigger || lowerMsg === trigger.trim())) &&
  lowerMsg.split(" ").length <= 5
) {
  return res.json({
    reply:
      "Super 🙌! Klick links auf den Button **Jetzt Erstgespräch sichern**, trag deinen Namen und deine E-Mail ein und schreib kurz, worum es geht."
  });
}

    // --------------------------------
    // 3. Sanftes Termin-Angebot bei Unsicherheit
    // --------------------------------
    if (
      lowerMsg.includes("weiß nicht") ||
      lowerMsg.includes("unsicher") ||
      lowerMsg.includes("problem") ||
      lowerMsg.includes("schwierig")
    ) {
      reply +=
        "\n\n💡 Willst du dir vielleicht einen Termin vereinbaren, um das genauer zu besprechen?";
    }

    res.json({ reply });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "OpenAI API Error" });
  }
};
