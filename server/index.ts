import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

app.post("/api/chat", async (req, res) => {
  try {
    const { messages } = req.body;
    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

    if (!OPENAI_API_KEY) {
      return res.status(500).json({ error: "OPENAI_API_KEY is not configured" });
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `You are SnapFort, an advanced fraud detection and AML investigation assistant for financial services institutions.

Your capabilities include:
- Analyzing transaction patterns and identifying suspicious activities
- Explaining why transactions were flagged as high-risk
- Providing insights on fraud detection rules and AML compliance
- Assisting with case investigations and SAR narrative drafting
- Answering questions about risk scores, alerts, and detection models

Always provide clear, concise, and actionable insights. When discussing specific cases or transactions, explain the risk factors in a way that compliance officers and fraud analysts can understand.

Format your responses with markdown for better readability. Use bullet points for lists and bold text for important terms.`,
          },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return res.status(429).json({ error: "Rate limit exceeded. Please try again in a moment." });
      }
      const errorText = await response.text();
      console.error("AI API error:", response.status, errorText);
      return res.status(500).json({ error: "AI service temporarily unavailable" });
    }

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    const reader = response.body!.getReader();
    const pump = async () => {
      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          res.end();
          break;
        }
        res.write(value);
      }
    };

    pump().catch((err) => {
      console.error("Stream error:", err);
      res.end();
    });
  } catch (error) {
    console.error("Chat error:", error);
    res.status(500).json({ error: error instanceof Error ? error.message : "Unknown error" });
  }
});

const PORT = 3001;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`API server running on port ${PORT}`);
});
