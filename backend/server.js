const express = require("express");
const cors = require("cors")
const axios = require("axios")

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Backend working ✅");
});

app.post("/explain-error", async (req, res) => {
  const { error, code, type } = req.body;

  console.log("API HIT:", error, code, type);

    let detectedType = type;

  if (!type || type === "auto") {
    if (error.includes("useState") || code.includes("useEffect")) {
      detectedType = "react";
    } else if (error.includes("req") || error.includes("res")) {
      detectedType = "node";
    } else {
      detectedType = "javascript";
    }
  }

  console.log("Detected Type:", detectedType);

  try {
    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "openai/gpt-3.5-turbo",
        messages: [
          {
            role: "user",
            content: `
You are a senior ${detectedType} developer.

Error:
${error}

Code:
${code}

Return ONLY JSON:
{
  "explanation": "",
  "rootCause": "",
  "fix": "",
  "code": "",
  "bestPractices": "",
  "commonMistake": "",
  "confidence": "",
  "detectedType": "${detectedType}"
}
`
          }
        ]
      },
      {
        headers: {
          Authorization: "Bearer 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",
          "Content-Type": "application/json",
          "HTTP-Referer": "http://localhost:3000",
          "X-Title": "ErrorSense AI"
        }
      }
    );

    const aiText = response.data.choices[0].message.content;

    res.json({ result: aiText });

  } catch (err) {
    console.error("ERROR:", err.response?.data || err.message);
    res.json({ result: "AI failed" });
  }
});

app.listen(7000, "127.0.0.1", () => {
  console.log("Server running on http://127.0.0.1:7000");
});