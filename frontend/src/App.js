import { useState } from "react";
import "./App.css";

function App() {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
  const [type, setType] = useState("javascript");
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchWithRetry = async (url, options, retries = 2) => {
    try {
      return await fetch(url, options);
    } catch (err) {
      if (retries > 0) {
        return fetchWithRetry(url, options, retries - 1);
      }
      throw err;
    }
  };

const explainError = async () => {
  setLoading(true);

  try {
    const response = await fetchWithRetry(
      "http://localhost:8000/explain-error",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ code, error, type })
      }
    );

    const data = await response.json();

    console.log("RAW RESPONSE:", data);
const text = data.result || "";

const getSection = (label) => {
  const regex = new RegExp(`${label}[:\\n]+([\\s\\S]*?)(?=\\n[A-Z]|$)`, "i");
  const match = text.match(regex);
  return match ? match[1].trim() : "";
};

const codeMatch = text.match(/```(?:javascript)?([\s\S]*?)```/i);

setResult({
  explanation: getSection("Explanation") || text,
  rootCause: getSection("Root Cause"),
  fix: getSection("Fix"),
  code: codeMatch ? codeMatch[1].trim() : "",
  bestPractices: getSection("Best Practices"),
  commonMistake: getSection("Common Mistake"),
  confidence: getSection("Confidence"),
  detectedType: type
});

  } finally {
    setLoading(false);
  }
};

  return (
<div style={{ padding: "30px", fontFamily: "Arial" }} className="container"
>
  <h1 style={{ textAlign: "center" }}>🚀 ErrorSense AI</h1>
  <div style={{ marginBottom: "15px" }}>
  <label>🧠 Select Error Type</label><br />
  <select
  value={type}
  onChange={(e) => setType(e.target.value)}
  style={{ marginBottom: "15px", padding: "8px" }}
>
  <option value="javascript">JavaScript</option>
  <option value="react">React</option>
  <option value="node">Node.js</option>
  <option value="api">API</option>
</select>
</div>

  {/* Code Input */}
  <h3>💻 Code</h3>
  <textarea
    style={{ width: "100%", height: "120px", marginBottom: "15px" }}
    placeholder="Paste your code here..."
    value={code}
    onChange={(e) => setCode(e.target.value)}
  />

  {/* Error Input */}
  <h3>⚠️ Error</h3>
  <textarea
    style={{ width: "100%", height: "80px", marginBottom: "15px" }}
    placeholder="Paste your error here..."
    value={error}
    onChange={(e) => setError(e.target.value)}
  />

  {/* Button */}
<div className="button-group">
  <button onClick={explainError} className="btn primary">
   {loading ? "Analyzing..." : "🔍 Analyze Error"}
  </button>

  <button 
  onClick={() => {
    navigator.clipboard.writeText(result.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }}
  className="btn secondary"    
  disabled={!result?.code}>
  {copied ? "✅ Copied!" : "📋 Copy Code"}
  </button>
</div>

  {/* RESULT */}
  {result && (
    <div style={{ marginTop: "30px" }}>
      
      <div className="card">
        <h3>🧾 Explanation</h3>
        <p>{result.explanation}</p>
      </div>

      <div className="card">
        <h3>⚠️ Root Cause</h3>
        <p>{result.rootCause}</p>
      </div>

      <div className="card">
        <h3>🔧 Fix</h3>
        <p>{result.fix}</p>
      </div>

<div className="code-compare">
  <div className="bad">
    <h4>❌ Your Code</h4>
    <pre>{code}</pre>
  </div>

  <div className="good">
    <h4>✅ Fixed Code</h4>
    <pre>{result.code}</pre>
  </div>
</div>

      <div className="card">
        <h3>💡 Best Practices</h3>
        <p>{result.bestPractices}</p>
      </div>

      <div className="card">
          <h3>🧠 Detected Type</h3>
          <p>{result?.detectedType || "Auto detected"}</p>
      </div>


    </div>
  )}
</div>
  );
}

export default App;