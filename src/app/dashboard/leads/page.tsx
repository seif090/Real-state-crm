"use client";

import type { CSSProperties, ReactNode } from "react";
import { useMemo, useState } from "react";
import {
  Search,
  UserPlus,
  Phone,
  MessageCircle,
  Calendar,
  ArrowUpDown,
  Sparkles,
} from "lucide-react";
import {
  getLeadNextAction,
  getLeadPriorityWeight,
  getPropertyFitScore,
  leadPipeline,
  leads,
  properties,
  type LeadScore,
  type LeadStatus,
} from "@/lib/crm-data";

const statusLabels: Record<LeadStatus | "ALL", string> = {
  ALL: "All",
  NEW: "New",
  CONTACTED: "Contacted",
  INTERESTED: "Interested",
  VIEWING: "Viewing",
  NEGOTIATING: "Negotiating",
  SOLD: "Sold",
};

const scoreLabels: Record<LeadScore | "ALL", string> = {
  ALL: "All",
  HOT: "HOT",
  WARM: "WARM",
  COLD: "COLD",
};

export default function LeadsKanban() {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<LeadStatus | "ALL">("ALL");
  const [scoreFilter, setScoreFilter] = useState<LeadScore | "ALL">("ALL");
  const [sortMode, setSortMode] = useState<"priority" | "budget" | "recent">("priority");
  const [selectedLeadId, setSelectedLeadId] = useState(leads[0]?.id ?? "");

  const filteredLeads = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return [...leads]
      .filter((lead) => {
        const matchesQuery =
          !normalizedQuery ||
          lead.name.toLowerCase().includes(normalizedQuery) ||
          lead.phone.includes(normalizedQuery) ||
          lead.preferredLocation.toLowerCase().includes(normalizedQuery);
        const matchesStatus = statusFilter === "ALL" || lead.status === statusFilter;
        const matchesScore = scoreFilter === "ALL" || lead.score === scoreFilter;

        return matchesQuery && matchesStatus && matchesScore;
      })
      .sort((a, b) => {
        if (sortMode === "budget") return b.budget - a.budget;
        if (sortMode === "recent") return Date.parse(b.lastTouch) - Date.parse(a.lastTouch);
        return getLeadPriorityWeight(b) - getLeadPriorityWeight(a);
      });
  }, [query, scoreFilter, sortMode, statusFilter]);

  const selectedLead = filteredLeads.find((lead) => lead.id === selectedLeadId) ?? filteredLeads[0] ?? leads[0];

  const recommendedProperties = selectedLead
    ? [...properties]
        .map((property) => ({
          property,
          fitScore: getPropertyFitScore(selectedLead, property),
        }))
        .sort((a, b) => b.fitScore - a.fitScore)
        .slice(0, 3)
    : [];

  return (
    <div style={{ display: "grid", gap: "24px" }}>
      <header className="glass-card" style={{ padding: "28px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: "20px", flexWrap: "wrap", alignItems: "end" }}>
          <div>
            <h1 style={{ fontSize: "1.8rem", marginBottom: "8px" }}>Lead Intelligence</h1>
            <p style={{ color: "var(--muted)" }}>Search, score, and act on the right lead faster.</p>
          </div>
          <button className="btn btn-primary">
            <UserPlus size={18} />
            Add lead
          </button>
        </div>
      </header>

      <div style={{ display: "grid", gridTemplateColumns: "1fr auto auto auto", gap: "12px", alignItems: "center" }}>
        <div className="glass" style={{ padding: "10px 14px", display: "flex", alignItems: "center", gap: "10px" }}>
          <Search size={18} color="var(--muted)" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            type="text"
            placeholder="Search by name, phone, or location"
            style={{ width: "100%", background: "transparent", border: "none", color: "var(--foreground)", outline: "none" }}
          />
        </div>

        <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as LeadStatus | "ALL")} className="glass" style={selectStyle}>
          {Object.entries(statusLabels).map(([value, label]) => (
            <option key={value} value={value}>
              Status: {label}
            </option>
          ))}
        </select>

        <select value={scoreFilter} onChange={(event) => setScoreFilter(event.target.value as LeadScore | "ALL")} className="glass" style={selectStyle}>
          {Object.entries(scoreLabels).map(([value, label]) => (
            <option key={value} value={value}>
              Score: {label}
            </option>
          ))}
        </select>

        <button className="btn btn-outline" onClick={() => setSortMode(sortMode === "priority" ? "budget" : sortMode === "budget" ? "recent" : "priority")}>
          <ArrowUpDown size={18} />
          Sort: {sortMode}
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "16px" }}>
        {leadPipeline.map((status) => (
          <div key={status} className="glass-card" style={{ padding: "18px" }}>
            <div style={{ color: "var(--muted)", fontSize: "0.85rem", marginBottom: "8px" }}>{statusLabels[status]}</div>
            <div style={{ fontSize: "1.6rem", fontWeight: 800 }}>{leads.filter((lead) => lead.status === status).length}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.15fr 0.85fr", gap: "24px" }}>
        <section className="glass-card" style={{ padding: "24px" }}>
          <div style={{ display: "grid", gap: "16px" }}>
            {filteredLeads.map((lead) => (
              <button
                key={lead.id}
                onClick={() => setSelectedLeadId(lead.id)}
                className="glass"
                style={{
                  width: "100%",
                  border: selectedLead?.id === lead.id ? "1px solid var(--primary)" : "1px solid transparent",
                  background: selectedLead?.id === lead.id ? "var(--primary-glow)" : "rgba(255,255,255,0.03)",
                  padding: "16px",
                  textAlign: "right",
                  color: "inherit",
                  cursor: "pointer",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", gap: "12px", marginBottom: "10px" }}>
                  <div>
                    <div style={{ fontWeight: 800, marginBottom: "4px" }}>{lead.name}</div>
                    <div style={{ color: "var(--muted)", fontSize: "0.85rem" }}>
                      {lead.phone} • {lead.source} • {lead.status}
                    </div>
                  </div>
                  <span
                    style={{
                      padding: "4px 8px",
                      borderRadius: "999px",
                      background: lead.score === "HOT" ? "rgba(255,82,82,0.15)" : lead.score === "WARM" ? "rgba(255,152,0,0.15)" : "rgba(61,90,254,0.15)",
                      color: lead.score === "HOT" ? "#ff8a80" : lead.score === "WARM" ? "#ffb74d" : "#90caf9",
                      fontSize: "0.75rem",
                      fontWeight: 700,
                    }}
                  >
                    {lead.score}
                  </span>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px" }}>
                  <MiniStat label="Budget" value={`${lead.budget.toLocaleString("en-US")} ج.م`} />
                  <MiniStat label="Next action" value={getLeadNextAction(lead)} />
                  <MiniStat label="Last touch" value={new Date(lead.lastTouch).toLocaleDateString()} />
                </div>
              </button>
            ))}
          </div>
        </section>

        <aside className="glass-card" style={{ padding: "24px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
            <h2 style={{ fontSize: "1.2rem" }}>Lead details</h2>
            <Sparkles size={18} color="var(--primary)" />
          </div>

          {selectedLead ? (
            <div style={{ display: "grid", gap: "14px" }}>
              <div className="glass" style={{ padding: "16px" }}>
                <div style={{ fontWeight: 800, marginBottom: "6px" }}>{selectedLead.name}</div>
                <div style={{ color: "var(--muted)", lineHeight: 1.7 }}>
                  {selectedLead.preferredLocation} • {selectedLead.status}
                </div>
              </div>

              <div className="glass" style={{ padding: "16px" }}>
                <div style={{ color: "var(--muted)", fontSize: "0.85rem", marginBottom: "6px" }}>Recommended next step</div>
                <div style={{ fontWeight: 700 }}>{getLeadNextAction(selectedLead)}</div>
              </div>

              <div className="glass" style={{ padding: "16px" }}>
                <div style={{ color: "var(--muted)", fontSize: "0.85rem", marginBottom: "10px" }}>Property matches</div>
                <div style={{ display: "grid", gap: "10px" }}>
                  {recommendedProperties.map(({ property, fitScore }) => (
                    <div key={property.id} className="glass" style={{ padding: "12px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", gap: "10px" }}>
                        <div>
                          <div style={{ fontWeight: 700, marginBottom: "4px" }}>{property.name}</div>
                          <div style={{ color: "var(--muted)", fontSize: "0.85rem" }}>{property.location}</div>
                        </div>
                        <div style={{ color: "var(--primary)", fontWeight: 800 }}>{fitScore}%</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px" }}>
                <ActionButton icon={<Phone size={16} />} label="Call" />
                <ActionButton icon={<MessageCircle size={16} />} label="Message" />
                <ActionButton icon={<Calendar size={16} />} label="Schedule" />
              </div>
            </div>
          ) : null}
        </aside>
      </div>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="glass" style={{ padding: "12px" }}>
      <div style={{ color: "var(--muted)", fontSize: "0.75rem", marginBottom: "6px" }}>{label}</div>
      <div style={{ fontSize: "0.9rem", fontWeight: 600, lineHeight: 1.6 }}>{value}</div>
    </div>
  );
}

function ActionButton({ icon, label }: { icon: ReactNode; label: string }) {
  return (
    <button className="btn btn-outline" style={{ justifyContent: "center" }}>
      {icon}
      {label}
    </button>
  );
}

const selectStyle: CSSProperties = {
  width: "100%",
  padding: "12px 14px",
  border: "1px solid var(--border)",
  borderRadius: "12px",
  color: "var(--foreground)",
  background: "rgba(255,255,255,0.04)",
  outline: "none",
};
