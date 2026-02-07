const express = require("express");
const cors = require("cors");
require("dotenv").config();
const app = express();
app.use(cors());
app.use(express.json());

// 🔴 Put your GROQ API key here
const GROQ_KEY =process.env.GROQ_KEY;

app.post("/chat", async (req, res) => {
  const userText = req.body.message;

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": "Bearer " + GROQ_KEY,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
model: "llama-3.1-8b-instant",
        messages: [
          { role: "user", content: userText }
        ]
      })
    });

    const raw = await response.text();
    console.log("GROQ RAW:", raw);

    const data = JSON.parse(raw);

    if (!data.choices || !data.choices[0]) {
      return res.status(500).json({ error: "Bad Groq response", raw });
    }

    res.json({
      reply: data.choices[0].message.content
    });

  } catch (err) {
    console.error("SERVER ERROR:", err);
    res.status(500).json({ error: "Server crashed" });
  }
});

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});