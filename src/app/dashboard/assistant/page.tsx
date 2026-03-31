"use client";

import { useMemo, useState } from "react";
import { Sparkles, BrainCircuit, Loader2, Home, WandSparkles } from "lucide-react";
import { leads } from "@/lib/crm-data";

type AssistantResult = {
  text: string;
  score: "HOT" | "WARM" | "COLD";
  suggestedPropertyId?: string;
  rankedProperties?: Array<{
    id: string;
    name: string;
    location: string;
    price: number;
    area: number;
    fitScore: number;
  }>;
  lead?: {
    id: string;
    name: string;
  };
};

export default function AssistantPage() {
  const [message, setMessage] = useState("عميل يسأل عن شقة 3 غرف في التجمع بميزانية 3.5 مليون");
  const [leadId, setLeadId] = useState(leads[0]?.id ?? "");
  const [result, setResult] = useState<AssistantResult | null>(null);
  const [loading, setLoading] = useState(false);

  const selectedLead = useMemo(
    () => leads.find((lead) => lead.id === leadId),
    [leadId]
  );

  const submit = async () => {
    if (!message.trim()) return;

    setLoading(true);
    try {
      const response = await fetch("/api/assistant", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message, leadId }),
      });

      const data = (await response.json()) as AssistantResult;
      setResult(data);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "grid", gap: "24px" }}>
      <header className="glass-card" style={{ padding: "28px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
          <div style={{ width: 44, height: 44, borderRadius: "14px", background: "var(--primary-glow)", display: "grid", placeItems: "center", color: "var(--primary)" }}>
            <Sparkles size={20} />
          </div>
          <div>
            <h1 style={{ fontSize: "1.8rem", marginBottom: "4px" }}>AI Copilot</h1>
            <p style={{ color: "var(--muted)" }}>Write one prompt and get a drafted reply, lead score, and top property matches.</p>
          </div>
        </div>
        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
          <span className="glass" style={{ padding: "8px 12px", borderRadius: "999px", color: "var(--primary)" }}>
            <BrainCircuit size={14} style={{ marginInlineEnd: 6, verticalAlign: "middle" }} />
            AI-generated reply
          </span>
          <span className="glass" style={{ padding: "8px 12px", borderRadius: "999px" }}>
            <Home size={14} style={{ marginInlineEnd: 6, verticalAlign: "middle" }} />
            Property recommendations
          </span>
        </div>
      </header>

      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: "24px" }}>
        <section className="glass-card" style={{ padding: "28px" }}>
          <div style={{ display: "grid", gap: "16px" }}>
            <label style={{ display: "grid", gap: "8px" }}>
              <span style={{ fontWeight: 600 }}>Select lead</span>
              <select
                value={leadId}
                onChange={(event) => setLeadId(event.target.value)}
                style={{
                  width: "100%",
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid var(--border)",
                  borderRadius: "12px",
                  padding: "12px 14px",
                  color: "var(--foreground)",
                  outline: "none",
                }}
              >
                {leads.map((lead) => (
                  <option key={lead.id} value={lead.id}>
                    {lead.name} - {lead.status}
                  </option>
                ))}
              </select>
            </label>

            <label style={{ display: "grid", gap: "8px" }}>
              <span style={{ fontWeight: 600 }}>Message</span>
              <textarea
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                rows={6}
                placeholder="Paste a customer message and let the copilot craft a smart reply."
                style={{
                  width: "100%",
                  resize: "vertical",
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid var(--border)",
                  borderRadius: "14px",
                  padding: "14px",
                  color: "var(--foreground)",
                  outline: "none",
                }}
              />
            </label>

            <button className="btn btn-primary" onClick={submit} disabled={loading}>
              {loading ? <Loader2 size={18} className="animate-spin" /> : <WandSparkles size={18} />}
              Generate recommendation
            </button>
          </div>
        </section>

        <aside className="glass-card" style={{ padding: "28px" }}>
          <h2 style={{ fontSize: "1.2rem", marginBottom: "16px" }}>Lead context</h2>
          <div style={{ display: "grid", gap: "12px", color: "var(--muted)" }}>
            <div className="glass" style={{ padding: "14px" }}>
              <div style={{ fontSize: "0.8rem", marginBottom: "6px" }}>Selected lead</div>
              <div style={{ color: "var(--foreground)", fontWeight: 600 }}>{selectedLead?.name}</div>
            </div>
            <div className="glass" style={{ padding: "14px" }}>
              <div style={{ fontSize: "0.8rem", marginBottom: "6px" }}>Budget</div>
              <div style={{ color: "var(--foreground)", fontWeight: 600 }}>
                {selectedLead ? `${new Intl.NumberFormat("en-US").format(selectedLead.budget)} ج.م` : "N/A"}
              </div>
            </div>
            <div className="glass" style={{ padding: "14px" }}>
              <div style={{ fontSize: "0.8rem", marginBottom: "6px" }}>Preferred location</div>
              <div style={{ color: "var(--foreground)", fontWeight: 600 }}>{selectedLead?.preferredLocation}</div>
            </div>
          </div>
        </aside>
      </div>

      {result && (
        <div style={{ display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: "24px" }}>
          <section className="glass-card" style={{ padding: "28px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h2 style={{ fontSize: "1.2rem" }}>Draft reply</h2>
              <span className="glass" style={{ padding: "6px 10px", borderRadius: "999px", color: result.score === "HOT" ? "#ff6b6b" : result.score === "WARM" ? "#f4a261" : "var(--muted)" }}>
                {result.score}
              </span>
            </div>
            <p style={{ color: "var(--foreground)", lineHeight: 1.9, whiteSpace: "pre-wrap" }}>{result.text}</p>
          </section>

          <section className="glass-card" style={{ padding: "28px" }}>
            <h2 style={{ fontSize: "1.2rem", marginBottom: "16px" }}>Top matches</h2>
            <div style={{ display: "grid", gap: "12px" }}>
              {(result.rankedProperties ?? []).map((property) => (
                <div key={property.id} className="glass" style={{ padding: "14px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: "12px" }}>
                    <div>
                      <div style={{ fontWeight: 700, marginBottom: "4px" }}>{property.name}</div>
                      <div style={{ fontSize: "0.85rem", color: "var(--muted)" }}>{property.location}</div>
                    </div>
                    <span style={{ color: "var(--primary)", fontWeight: 700 }}>{property.fitScore}%</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
