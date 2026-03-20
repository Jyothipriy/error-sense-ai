import { useState } from "react";
import "./App.css";

function App() {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
  const [type, setType] = useState("javascript");
  const [copied, setCopied] = useState(false);

const explainError = async () => {
  try {
    const response = await fetch("http://127.0.0.1:7000/explain-error", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ code, error })
    });

    const data = await response.json();

    console.log("RAW RESPONSE:", data);

    // ✅ SAFE PARSE FIX
    try {
      const cleanText = data.result
        ?.replace(/```json/g, "")
        ?.replace(/```/g, "")
        ?.trim();

      const parsed = JSON.parse(cleanText);
      setResult(parsed);

    } catch (parseErr) {
      console.error("PARSE ERROR:", parseErr);

      // fallback UI (VERY IMPORTANT)
      setResult({
        explanation: data.result || "AI failed",
        rootCause: "Could not parse response",
        fix: "Try again",
        code: "",
        bestPractices: ""
      });
    }

  } catch (err) {
    console.error("FETCH ERROR:", err);
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
    🔍 Analyze Error
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