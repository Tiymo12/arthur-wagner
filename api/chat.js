import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { message, persona, settings } = req.body;

  try {
    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: settings?.temperature || 0.8,
      max_tokens: 200,
      messages: [
        { role: "system", content: persona },
        { role: "user", content: message }
      ],
    });

    let reply = completion.choices[0].message.content;

    // Wenn User "ja" schreibt → Termin-Hinweis
    if (message.trim().toLowerCase() === "ja") {
      return res.json({
        reply: "Super 🙌! Klick links auf den Button **Jetzt Erstgespräch sichern**, trag deinen Namen und deine E-Mail ein und schreib kurz, worum es geht."
      });
    }

    // Wenn User unsicher wirkt → leichte Termin-Empfehlung
    if (
      message.toLowerCase().includes("weiß nicht") ||
      message.toLowerCase().includes("unsicher") ||
      message.toLowerCase().includes("problem") ||
      message.toLowerCase().includes("schwierig")
    ) {
      reply += "\n\n💡 Brauchst du Unterstützung dabei? Willst du dir vielleicht einen Termin vereinbaren?";
    }

    res.json({ reply });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "OpenAI API Error" });
  }
}
