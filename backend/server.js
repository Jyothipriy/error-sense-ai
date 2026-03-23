
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();
const PORT = 8000;

app.use(cors());

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Backend working ✅");
});

app.post("/explain-error", async (req, res) => {
  try {
    const { error = "", code = "", type = "" } = req.body;

    console.log("API HIT:", error, code, type);

    let detectedType = type;

    if (!type || type === "auto") {
      if ((error || "").includes("useState") || (code || "").includes("useEffect")) {
        detectedType = "react";
      } else if ((error || "").includes("req") || (error || "").includes("res")) {
        detectedType = "node";
      } else {
        detectedType = "javascript";
      }
    }

    console.log("Detected Type:", detectedType);

    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "openai/gpt-4o-mini",   // ✅ safer model
        messages: [
          {
            role: "user",
            content: `
You are a senior ${detectedType} developer.

Given the following code and error:

Error:
${error}

Code:
${code}

STRICT RULES:
1. Fix the GIVEN code only (do NOT create new examples)
2. Do NOT use unrelated variables
3. Return corrected version of SAME code
4. Keep structure similar, only fix the issue
5. Output must follow EXACT format

FORMAT:

Explanation:
<short explanation>

Root Cause:
<why error happened>

Fix:
<steps to fix>

Code:
<ONLY corrected version of SAME code>

Best Practices:
<2 points>

Common Mistake:
<1 line>

Confidence:
<Low / Medium / High>
`
          }
        ]
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    const aiText = response.data.choices[0].message.content;

    res.json({ result: aiText });

  } catch (err) {
    console.error("FULL ERROR:", err.response?.data || err.message);

    res.status(500).json({
      result: "⚠️ AI is temporarily unavailable. Please try again."
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});