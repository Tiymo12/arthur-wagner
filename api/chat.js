const OpenAI = require("openai");

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// kleiner Speicher für User-Status (in realem Projekt besser per Session)
let offeredAppointment = false;

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { message, persona, settings } = req.body;

  try {
    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: settings?.temperature || 0.8,
      max_tokens: 180,
      messages: [
        {
          role: "system",
          content: `${persona}\n\nAntworte kurz, prägnant (max. 2–3 Sätze).`,
        },
        { role: "user", content: message },
      ],
    });

    let reply = completion.choices[0].message.content;
    const lowerMsg = message.trim().toLowerCase();

    // --------------------------------
    // Direkter Terminwunsch
    // --------------------------------
    if (
      lowerMsg.includes("termin") ||
      lowerMsg.includes("erstgespräch") ||
      lowerMsg.includes("gespräch vereinbaren")
    ) {
      offeredAppointment = false; // Reset
      return res.json({
        reply:
          "Super 🙌! Klick links auf den Button **Jetzt Erstgespräch sichern**, trag deinen Namen und deine E-Mail ein und schreib kurz, worum es geht.",
      });
    }

    // --------------------------------
    // Zustimmungstrigger
    // --------------------------------
    const yesTriggers = [
      "ja",
      "jo",
      "jop",
      "yep",
      "yeah",
      "natürlich",
      "klar",
      "auf jeden fall",
      "passt",
      "definitiv",
      "absolut",
      "klingt gut",
      "hört sich gut an",
      "das wäre gut",
    ];

    if (yesTriggers.some(trigger => lowerMsg.includes(trigger))) {
      if (offeredAppointment) {
        // zweite Zustimmung → jetzt fixen Termin-Link geben
        offeredAppointment = false; // Reset
        return res.json({
          reply:
            "Super 🙌! Klick links auf den Button **Jetzt Erstgespräch sichern**, trag deinen Namen und deine E-Mail ein und schreib kurz, worum es geht.",
        });
      } else {
        // erste Zustimmung → nur sanft reagieren
        offeredAppointment = true;
        reply +=
          "\n\n💡 Das klingt so, als könnte ein Termin dir weiterhelfen. Willst du dir vielleicht einen vereinbaren?";
      }
    }

    // --------------------------------
    // Unsicherheit → sanftes Angebot
    // --------------------------------
    if (
      lowerMsg.includes("weiß nicht") ||
      lowerMsg.includes("unsicher") ||
      lowerMsg.includes("problem") ||
      lowerMsg.includes("schwierig")
    ) {
      offeredAppointment = true;
      reply +=
        "\n\n💡 Brauchst du Unterstützung dabei? Wir könnten uns einen Termin ausmachen, um es genauer zu besprechen.";
    }

    res.json({ reply });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "OpenAI API Error" });
  }
};
