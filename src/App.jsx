import { useState, useRef, useEffect } from "react";

const TOPICS = [
  {
    id: "basics",
    label: "Greetings & Basics",
    icon: "👋",
    color: "#1D4ED8",
    light: "#EFF6FF",
    description: "Hallo! Greetings, introductions & numbers",
    topics: ["Greetings & farewells", "Introducing yourself", "Numbers 1–100", "Days, months & dates"],
  },
  {
    id: "family",
    label: "Family & People",
    icon: "👨‍👩‍👧",
    color: "#BE185D",
    light: "#FDF2F8",
    description: "Family, descriptions & adjectives",
    topics: ["Family members", "Describing people", "Adjectives & colours", "Nationalities & languages"],
  },
  {
    id: "school",
    label: "School & Hobbies",
    icon: "🎒",
    color: "#7C3AED",
    light: "#F5F3FF",
    description: "School subjects, hobbies & likes/dislikes",
    topics: ["School subjects (Schulfächer)", "Hobbies & free time", "Likes & dislikes (mögen)", "Daily routine"],
  },
  {
    id: "grammar",
    label: "Grammar Essentials",
    icon: "📐",
    color: "#059669",
    light: "#ECFDF5",
    description: "Gender (der/die/das), verbs & sentence structure",
    topics: ["Articles (der/die/das)", "Present tense verbs", "Word order (Satzstellung)", "Negation (nicht/kein)"],
  },
];

const SYSTEM_PROMPT = `Du bist ein freundlicher Deutschlehrer (friendly German teacher) for a Year 7 English-speaking student starting German from A1/absolute beginner level.

Your role:
1. Teach A1 German through engaging exercises.
2. ALWAYS explain new vocabulary in English first, then practice in German.
3. Correct gently — mistakes are normal at A1!
4. Use a mix of translation, fill-in-the-blank, and short production tasks.
5. Celebrate progress warmly — learning German is an achievement!

Teaching approach:
- Introduce key vocabulary with English translations before each exercise
- Use colour coding in explanations: masculine (der) = think blue, feminine (die) = think red, neuter (das) = think green
- Give memory tips (Eselsbrücken) to help remember tricky words
- Always show correct German with English translation

When generating exercises:
- ONE exercise at a time (vary: translation EN→DE, DE→EN, fill gaps, true/false, short sentences). After the student answers, give feedback, then the next.
- Number clearly: 1. 2. 3. 4. 5.
- 💡 Vocabulary list at the end with key words from the exercise
- Show pronunciation guide for new words using simple phonetics

When correcting:
- ✅ or ❌ per answer
- Show correct German + English meaning
- Explain grammar rules simply in English
- End with "Sehr gut!" encouragement and one grammar tip to remember

IMPORTANT FORMATTING RULE: Never use markdown. No asterisks, no hashtags, no backticks. Plain text only. Use numbered lists and emoji where helpful.`;

export default function DeutschApp() {
  const [activeTopic, setActiveTopic] = useState(null);
  const [activeSubtopic, setActiveSubtopic] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState("home");
  const [visitas, setVisitas] = useState(null);
  const bottomRef = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, loading]);

  useEffect(() => {
    fetch("/api/visitas")
      .then((r) => r.json())
      .then((d) => setVisitas(d.visitas))
      .catch(() => {});
  }, []);

  const startPractice = async (topic, subtopic) => {
    setActiveTopic(topic); setActiveSubtopic(subtopic); setMessages([]); setMode("chat"); setLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-6", max_tokens: 1000, system: SYSTEM_PROMPT,
          messages: [{ role: "user", content: `Create an A1 German lesson on: "${subtopic}" (${topic.label}). Start with a short vocabulary introduction (8-10 words with English translations), then one exercise at a time (start with a single exercise). Student: absolute beginner, Year 7.` }]
        }),
      });
      const data = await res.json();
      setMessages([{ role: "assistant", content: data.content?.[0]?.text || "Error. Try again." }]);
    } catch { setMessages([{ role: "assistant", content: "Connection error." }]); }
    setLoading(false);
  };

  const sendMessage = async (text) => {
    const userMsg = (typeof text === "string" ? text : input).trim(); setInput("");
    if (!userMsg || loading) return;
    const newMessages = [...messages, { role: "user", content: userMsg }]; setMessages(newMessages); setLoading(true);
    const apiMessages = newMessages.map((m) => ({ role: m.role, content: m.content }));
    apiMessages[0] = { role: "user", content: `German A1: ${activeTopic?.label} — ${activeSubtopic}\n\n${apiMessages[0].content}` };
    try {
      const res = await fetch("/api/chat", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: "claude-sonnet-4-6", max_tokens: 1000, system: SYSTEM_PROMPT, messages: apiMessages }),
      });
      const data = await res.json();
      setMessages([...newMessages, { role: "assistant", content: data.content?.[0]?.text || "Error." }]);
    } catch { setMessages([...newMessages, { role: "assistant", content: "Connection error." }]); }
    setLoading(false);
  };

  if (mode === "home") return (
    <div style={{ minHeight: "100vh", background: "#EFF6FF", fontFamily: "'Segoe UI', system-ui, sans-serif", padding: "24px 16px" }}>
      <div style={{ maxWidth: 640, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ fontSize: 48, marginBottom: 8 }}>🇩🇪</div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: "#1E3A5F", margin: 0 }}>Deutsch A1</h1>
          <p style={{ color: "#6B7280", marginTop: 6, fontSize: 15 }}>Start your German journey — Willkommen!</p>
          <div style={{ display: "inline-block", background: "#1D4ED8", color: "#fff", borderRadius: 20, padding: "4px 14px", fontSize: 12, fontWeight: 700, marginTop: 8 }}>Absolute Beginner · A1</div>
        </div>

        {/* German flag accent */}
        <div style={{ display: "flex", height: 6, borderRadius: 3, overflow: "hidden", marginBottom: 24 }}>
          <div style={{ flex: 1, background: "#1a1a1a" }} />
          <div style={{ flex: 1, background: "#D00000" }} />
          <div style={{ flex: 1, background: "#FFCE00" }} />
        </div>

        {TOPICS.map((topic) => (
          <div key={topic.id} style={{ background: "#fff", borderRadius: 16, marginBottom: 16, border: `2px solid ${topic.light}`, overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
            <div style={{ background: topic.light, padding: "16px 20px", display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ fontSize: 28 }}>{topic.icon}</span>
              <div><div style={{ fontWeight: 700, fontSize: 17, color: topic.color }}>{topic.label}</div><div style={{ fontSize: 13, color: "#6B7280" }}>{topic.description}</div></div>
            </div>
            <div style={{ padding: "12px 20px 16px", display: "flex", flexWrap: "wrap", gap: 8 }}>
              {topic.topics.map((sub) => (<button key={sub} onClick={() => startPractice(topic, sub)} style={{ background: topic.color, color: "#fff", border: "none", borderRadius: 20, padding: "7px 16px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>{sub}</button>))}
            </div>
          </div>
        ))}

        <div style={{ background: "#FEF9C3", borderRadius: 12, padding: "12px 16px", fontSize: 13, color: "#713F12", marginTop: 8 }}>
          💡 <strong>Tip:</strong> German nouns always have a gender (der/die/das). Learn the article WITH the word — it's the most important habit from day one!
        </div>
        {visitas !== null && (
          <div style={{ textAlign: "center", marginTop: 24, fontSize: 12, color: "#9CA3AF" }}>
            Visitas: {visitas}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "#EFF6FF", fontFamily: "'Segoe UI', system-ui, sans-serif", display: "flex", flexDirection: "column" }}>
      <div style={{ background: activeTopic.color, padding: "14px 20px", display: "flex", alignItems: "center", gap: 12, position: "sticky", top: 0, zIndex: 10 }}>
        <button onClick={() => setMode("home")} style={{ background: "rgba(255,255,255,0.2)", border: "none", color: "#fff", borderRadius: 8, padding: "6px 12px", cursor: "pointer", fontWeight: 600, fontSize: 14 }}>← Back</button>
        <div>
          <div style={{ color: "#fff", fontWeight: 700, fontSize: 16 }}>{activeTopic.label}</div>
          <div style={{ color: "rgba(255,255,255,0.8)", fontSize: 12 }}>{activeSubtopic} · A1 German</div>
        </div>
        <div style={{ marginLeft: "auto", fontSize: 20 }}>🇩🇪</div>
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: "20px 16px", maxWidth: 680, margin: "0 auto", width: "100%" }}>
        {messages.map((msg, i) => (
          <div key={i} style={{ marginBottom: 16, display: "flex", justifyContent: msg.role === "user" ? "flex-end" : "flex-start" }}>
            {msg.role === "assistant" && <div style={{ width: 32, height: 32, borderRadius: "50%", background: activeTopic.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, marginRight: 8, flexShrink: 0, alignSelf: "flex-end" }}>🇩🇪</div>}
            <div style={{ background: msg.role === "user" ? activeTopic.color : "#fff", color: msg.role === "user" ? "#fff" : "#1F2937", borderRadius: msg.role === "user" ? "18px 18px 4px 18px" : "18px 18px 18px 4px", padding: "12px 16px", maxWidth: "82%", fontSize: 14, lineHeight: 1.65, boxShadow: "0 1px 4px rgba(0,0,0,0.08)", whiteSpace: "pre-wrap" }}>{msg.content}</div>
          </div>
        ))}
        {loading && (
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
            <div style={{ width: 32, height: 32, borderRadius: "50%", background: activeTopic.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>🇩🇪</div>
            <div style={{ background: "#fff", borderRadius: "18px 18px 18px 4px", padding: "12px 16px", boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }}>
              <div style={{ display: "flex", gap: 4 }}>{[0, 1, 2].map((i) => (<div key={i} style={{ width: 8, height: 8, borderRadius: "50%", background: activeTopic.color, animation: "bounce 1s infinite", animationDelay: `${i * 0.2}s` }} />))}</div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>
      <div style={{ padding: "8px 16px 0", maxWidth: 680, margin: "0 auto", width: "100%", display: "flex", gap: 8, flexWrap: "wrap" }}>
        {["Hint", "More exercises", "Explain in English", "How do you say..."].map((q) => (
          <button key={q} onClick={() => sendMessage(q)} style={{ background: activeTopic.light, color: activeTopic.color, border: `1px solid ${activeTopic.color}30`, borderRadius: 16, padding: "5px 12px", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>{q}</button>
        ))}
      </div>
      <div style={{ padding: "12px 16px 20px", maxWidth: 680, margin: "0 auto", width: "100%", display: "flex", gap: 8 }}>
        <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && sendMessage()} placeholder="Schreib hier... (write here)" style={{ flex: 1, border: "2px solid #E5E7EB", borderRadius: 24, padding: "10px 18px", fontSize: 14, outline: "none", fontFamily: "inherit" }} onFocus={(e) => (e.target.style.borderColor = activeTopic.color)} onBlur={(e) => (e.target.style.borderColor = "#E5E7EB")} />
        <button onClick={sendMessage} disabled={loading || !input.trim()} style={{ background: activeTopic.color, color: "#fff", border: "none", borderRadius: "50%", width: 44, height: 44, fontSize: 20, cursor: loading ? "not-allowed" : "pointer", opacity: loading || !input.trim() ? 0.5 : 1, flexShrink: 0 }}>↑</button>
      </div>
      <style>{`@keyframes bounce { 0%, 80%, 100% { transform: translateY(0); } 40% { transform: translateY(-6px); } }`}</style>
    </div>
  );
}
