"use client";
import { useState } from "react";

const MODELS = [
  { label: "Llama 3.3 70B (Free)", value: "meta-llama/llama-3.3-70b-instruct:free" },
  { label: "DeepSeek R1 (Free)", value: "deepseek/deepseek-r1:free" },
  { label: "GPT-OSS 20B (Free)", value: "openai/gpt-oss-20b:free" },
];

const EXAMPLES = ["stripe.com", "Tesla", "Microsoft", "OpenAI"];

export default function Home() {
  const [tab, setTab] = useState("api");
  const [openrouterKey, setOpenrouterKey] = useState("");
  const [serperKey, setSerperKey] = useState("");
  const [model, setModel] = useState(MODELS[0].value);
  const [savedApi, setSavedApi] = useState(false);

  const [discordCfg, setDiscordCfg] = useState({
    botToken: "", channelId: "", applicantName: "", applicantEmail: "",
  });
  const [savedDiscord, setSavedDiscord] = useState(false);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState(null);
  const [error, setError] = useState(null);
  const [sentToDiscord, setSentToDiscord] = useState(false);

  async function runResearch(value) {
    const query = value ?? input;
    if (!query.trim() || loading) return;
    setLoading(true);
    setError(null);
    setReport(null);
    setSentToDiscord(false);

    try {
      const res = await fetch("/api/research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input: query, model, openrouterKey, serperKey }),
      });
      const data = await res.json();

      if (data.error) {
        setError(data.error);
      } else {
        setReport(data);

        if (discordCfg.botToken && discordCfg.channelId) {
          const dres = await fetch("/api/discord", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              ...discordCfg,
              companyName: data.companyName,
              website: data.website,
              pdfBase64: data.pdfBase64,
            }),
          }).catch(() => null);
          if (dres && dres.ok) setSentToDiscord(true);
        }
      }
    } catch {
      setError("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  }

  function downloadPDF() {
    if (!report) return;
    const byteChars = atob(report.pdfBase64);
    const byteNumbers = new Array(byteChars.length);
    for (let i = 0; i < byteChars.length; i++) byteNumbers[i] = byteChars.charCodeAt(i);
    const blob = new Blob([new Uint8Array(byteNumbers)], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${report.companyName || "report"}-research-report.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="logo">R</div>
          <div>
            <h2>Relu Consultancy</h2>
            <span>COMPANY INTELLIGENCE</span>
          </div>
        </div>

        <button className="new-btn" onClick={() => { setReport(null); setInput(""); setError(null); }}>
          + New Research
        </button>

        <div className="tabs">
          <button className={tab === "api" ? "active" : ""} onClick={() => setTab("api")}>API</button>
          <button className={tab === "discord" ? "active" : ""} onClick={() => setTab("discord")}>DISCORD</button>
        </div>

        {tab === "api" ? (
          <div className="panel">
            <label>OPENROUTER API KEY</label>
            <input type="password" placeholder="sk-or-v1-..." value={openrouterKey}
              onChange={(e) => { setOpenrouterKey(e.target.value); setSavedApi(false); }} />

            <label>SERPER.DEV API KEY</label>
            <input type="password" placeholder="Your Serper key..." value={serperKey}
              onChange={(e) => { setSerperKey(e.target.value); setSavedApi(false); }} />

            <label>AI MODEL</label>
            <select value={model} onChange={(e) => { setModel(e.target.value); setSavedApi(false); }}>
              {MODELS.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
            </select>

            <button className="save-btn" onClick={() => setSavedApi(true)}>
              {savedApi ? "Saved ✓" : "Save Configuration"}
            </button>
          </div>
        ) : (
          <div className="panel">
            <div className="hint">
              <strong>Discord Bot Integration</strong>
              <p>After research completes, the report auto-sends to your configured channel.</p>
            </div>
            <label>BOT TOKEN</label>
            <input type="password" placeholder="Bot token..." value={discordCfg.botToken}
              onChange={(e) => { setDiscordCfg({ ...discordCfg, botToken: e.target.value }); setSavedDiscord(false); }} />
            <label>CHANNEL ID</label>
            <input placeholder="000000000000000000" value={discordCfg.channelId}
              onChange={(e) => { setDiscordCfg({ ...discordCfg, channelId: e.target.value }); setSavedDiscord(false); }} />
            <label>FULL NAME</label>
            <input placeholder="Your full name" value={discordCfg.applicantName}
              onChange={(e) => { setDiscordCfg({ ...discordCfg, applicantName: e.target.value }); setSavedDiscord(false); }} />
            <label>EMAIL ADDRESS</label>
            <input placeholder="email@example.com" value={discordCfg.applicantEmail}
              onChange={(e) => { setDiscordCfg({ ...discordCfg, applicantEmail: e.target.value }); setSavedDiscord(false); }} />
            <button className="save-btn" onClick={() => setSavedDiscord(true)}>
              {savedDiscord ? "Saved ✓" : "Save Discord Config"}
            </button>
          </div>
        )}

        <div className="footer-tag">OPENROUTER · SERPER · PDFKIT</div>
      </aside>

      <main className="main">
        <div className="topbar">
          <h1>Company Research</h1>
          <span className="live">● LIVE</span>
        </div>

        <div className="content">
          {!report && !loading && (
            <div className="hero">
              <span className="tag">AI-POWERED INTELLIGENCE</span>
              <h2>Know any company<br />in minutes.</h2>
              <p>Enter a company name or website URL to get AI-powered insights, competitor analysis, pain points, and a professional PDF report.</p>
              <div className="chips">
                {EXAMPLES.map((ex) => (
                  <button key={ex} onClick={() => { setInput(ex); runResearch(ex); }}>{ex}</button>
                ))}
              </div>
              {error && <p className="error">{error}</p>}
            </div>
          )}

          {loading && <div className="loading">Researching... this can take up to a minute ⏳</div>}

          {report && (
            <div className="report-card">
              <div className="report-head">
                <div>
                  <h2>{report.companyName}</h2>
                  <a href={report.website} target="_blank" rel="noreferrer">{report.website}</a>
                </div>
                <span className="badge">RESEARCH COMPLETE</span>
              </div>

              <div className="grid2">
                <div className="field"><label>PHONE</label><p>{report.phone}</p></div>
                <div className="field"><label>ADDRESS</label><p>{report.address}</p></div>
              </div>

              <label className="section-label">PRODUCTS & SERVICES</label>
              <p>{report.productsServices}</p>

              <label className="section-label">AI-GENERATED PAIN POINTS</label>
              <p>{report.painPoints}</p>

              <label className="section-label">COMPETITORS</label>
              <div className="grid2">
                {report.competitors?.map((c, i) => (
                  <div key={i} className="field">
                    <strong>{c.name}</strong>
                    <a href={c.website} target="_blank" rel="noreferrer">{c.website}</a>
                  </div>
                ))}
              </div>

              <div className="actions">
                <button className="download-btn" onClick={downloadPDF}>⬇ Download PDF Report</button>
                {sentToDiscord && <span className="sent">✓ Sent to Discord</span>}
              </div>
            </div>
          )}
        </div>

        <div className="inputbar">
          <input
            value={input}
            placeholder="Enter a company name (e.g. Stripe) or website URL (e.g. https://stripe.com)..."
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && runResearch()}
          />
          <button onClick={() => runResearch()} disabled={loading}>Research →</button>
        </div>
      </main>
    </div>
  );
}