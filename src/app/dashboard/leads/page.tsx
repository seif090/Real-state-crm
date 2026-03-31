"use client";
/* eslint-disable react-hooks/set-state-in-effect */

import type { CSSProperties, ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import {
  Search,
  UserPlus,
  Save,
  RefreshCcw,
  Sparkles,
  Filter,
  Phone,
  MessageCircle,
  Calendar,
} from "lucide-react";
import { getLeadNextAction, getPropertyFitScore, type Lead as UiLead, type PropertySummary as UiProperty } from "@/lib/crm-data";

type ApiLead = {
  id: string;
  name: string;
  phone: string;
  status: UiLead["status"];
  score: UiLead["score"];
  source: string;
  budget: number;
  preferredLocation: string;
  lastTouch: string;
  nextFollowUp: string;
  propertyId?: string;
  notesCount: number;
  messagesCount: number;
  latestMessage?: string;
  latestMessageAt?: string;
  unreadCount?: number;
  assignedProperty?: UiProperty;
};

type LeadRecord = ApiLead & {
  latestMessage?: string;
  latestMessageAt?: string;
  unreadCount?: number;
  assignedProperty?: UiProperty;
};

type ApiProperty = UiProperty;

const emptyForm: FormState = {
  id: "",
  name: "",
  phone: "",
  email: "",
  status: "NEW",
  score: "COLD",
  source: "CALL",
  budget: "",
  preferredLocation: "",
  propertyId: "",
};

type FormState = {
  id: string;
  name: string;
  phone: string;
  email: string;
  status: UiLead["status"];
  score: UiLead["score"];
  source: string;
  budget: string;
  preferredLocation: string;
  propertyId: string;
};

const statusOptions: UiLead["status"][] = ["NEW", "CONTACTED", "INTERESTED", "VIEWING", "NEGOTIATING", "CANCELLED", "SOLD"];
const scoreOptions: UiLead["score"][] = ["HOT", "WARM", "COLD"];
const sourceOptions = ["WHATSAPP", "WEB", "CALL", "REFERRAL"];

export default function LeadsPage() {
  const [leads, setLeads] = useState<LeadRecord[]>([]);
  const [properties, setProperties] = useState<ApiProperty[]>([]);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<UiLead["status"] | "ALL">("ALL");
  const [scoreFilter, setScoreFilter] = useState<UiLead["score"] | "ALL">("ALL");
  const [selectedLeadId, setSelectedLeadId] = useState<string>("");
  const [form, setForm] = useState<FormState>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    const [leadResponse, propertyResponse] = await Promise.all([
      fetch("/api/leads"),
      fetch("/api/properties"),
    ]);

    const leadJson = await leadResponse.json();
    const propertyJson = await propertyResponse.json();
    const nextLeads = (leadJson.leads || []) as ApiLead[];
    const nextProperties = (propertyJson.properties || []) as ApiProperty[];

    setLeads(nextLeads);
    setProperties(nextProperties);
    setSelectedLeadId((current) => current || nextLeads[0]?.id || "");
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const selectedLead = useMemo(
    () => leads.find((lead) => lead.id === selectedLeadId) ?? leads[0],
    [leads, selectedLeadId]
  );

  useEffect(() => {
    if (!selectedLead) return;

    setForm({
      id: selectedLead.id,
      name: selectedLead.name,
      phone: selectedLead.phone,
      email: "",
      status: selectedLead.status,
      score: selectedLead.score,
      source: selectedLead.source,
      budget: selectedLead.budget ? String(selectedLead.budget) : "",
      preferredLocation: selectedLead.preferredLocation,
      propertyId: selectedLead.propertyId || "",
    });
  }, [selectedLead]);

  const filteredLeads = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return leads.filter((lead) => {
      const matchesQuery =
        !normalized ||
        lead.name.toLowerCase().includes(normalized) ||
        lead.phone.includes(normalized) ||
        lead.preferredLocation.toLowerCase().includes(normalized);
      const matchesStatus = statusFilter === "ALL" || lead.status === statusFilter;
      const matchesScore = scoreFilter === "ALL" || lead.score === scoreFilter;
      return matchesQuery && matchesStatus && matchesScore;
    });
  }, [leads, query, scoreFilter, statusFilter]);

  const saveLead = async () => {
    if (!form.name.trim() || !form.phone.trim()) {
      return;
    }

    setSaving(true);
    const payload = {
      name: form.name,
      phone: form.phone,
      email: form.email,
      status: form.status,
      score: form.score,
      source: form.source,
      budget: Number(form.budget || 0),
      preferredLocation: form.preferredLocation,
      propertyId: form.propertyId || undefined,
    };

    const response = await fetch(
      form.id ? `/api/leads/${form.id}` : "/api/leads",
      {
        method: form.id ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );

    if (response.ok) {
      await loadData();
      setForm(emptyForm);
    }

    setSaving(false);
  };

  const topMatches = useMemo(() => {
    if (!selectedLead) return [];

    return [...properties]
      .map((property) => ({
        property,
        fitScore: getPropertyFitScore(selectedLead as UiLead, property),
      }))
      .sort((a, b) => b.fitScore - a.fitScore)
      .slice(0, 3);
  }, [properties, selectedLead]);

  return (
    <div style={{ display: "grid", gap: "24px" }}>
      <header className="glass-card" style={{ padding: "28px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: "20px", flexWrap: "wrap", alignItems: "end" }}>
          <div>
            <h1 style={{ fontSize: "1.8rem", marginBottom: "8px" }}>Lead Intelligence</h1>
            <p style={{ color: "var(--muted)" }}>Persisted leads, smart fit scoring, and editable lead forms.</p>
          </div>
          <button className="btn btn-primary" onClick={() => setForm(emptyForm)}>
            <UserPlus size={18} />
            New lead
          </button>
        </div>
      </header>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 220px 220px auto", gap: "12px", alignItems: "center" }}>
        <SearchBox value={query} onChange={setQuery} placeholder="Search by name, phone, or location" />
        <Select value={statusFilter} onChange={(value) => setStatusFilter(value as UiLead["status"] | "ALL")}>
          <option value="ALL">All statuses</option>
          {statusOptions.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </Select>
        <Select value={scoreFilter} onChange={(value) => setScoreFilter(value as UiLead["score"] | "ALL")}>
          <option value="ALL">All scores</option>
          {scoreOptions.map((score) => (
            <option key={score} value={score}>
              {score}
            </option>
          ))}
        </Select>
        <button className="btn btn-outline" onClick={loadData}>
          <RefreshCcw size={18} />
          Refresh
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: "24px" }}>
        <section className="glass-card" style={{ padding: "24px" }}>
          <div style={{ display: "grid", gap: "12px" }}>
            {loading ? (
              <div style={{ color: "var(--muted)" }}>Loading leads...</div>
            ) : filteredLeads.length === 0 ? (
              <div style={{ color: "var(--muted)" }}>No leads found.</div>
            ) : (
              filteredLeads.map((lead) => (
                <button
                  key={lead.id}
                  onClick={() => setSelectedLeadId(lead.id)}
                  className="glass"
                  style={{
                    padding: "16px",
                    textAlign: "right",
                    border: selectedLead?.id === lead.id ? "1px solid var(--primary)" : "1px solid transparent",
                    background: selectedLead?.id === lead.id ? "var(--primary-glow)" : "rgba(255,255,255,0.03)",
                    cursor: "pointer",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", gap: "12px", marginBottom: "10px" }}>
                    <div>
                      <div style={{ fontWeight: 800, marginBottom: "4px" }}>{lead.name}</div>
                      <div style={{ color: "var(--muted)", fontSize: "0.85rem" }}>
                        {lead.phone} • {lead.status} • {lead.score}
                      </div>
                    </div>
                    <span style={{ color: "var(--primary)", fontWeight: 800 }}>{lead.budget.toLocaleString("en-US")} ج.م</span>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px" }}>
                    <MiniStat label="Next action" value={getLeadNextAction(lead as UiLead)} />
                    <MiniStat label="Last touch" value={new Date(lead.lastTouch).toLocaleDateString()} />
                    <MiniStat label="Messages" value={lead.messagesCount} />
                  </div>
                </button>
              ))
            )}
          </div>
        </section>

        <aside style={{ display: "grid", gap: "20px" }}>
          <section className="glass-card" style={{ padding: "24px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h2 style={{ fontSize: "1.2rem" }}>{form.id ? "Edit lead" : "Create lead"}</h2>
              <Sparkles size={18} color="var(--primary)" />
            </div>

            <div style={{ display: "grid", gap: "12px" }}>
              <TextInput label="Name" value={form.name} onChange={(value) => setForm((current) => ({ ...current, name: value }))} />
              <TextInput label="Phone" value={form.phone} onChange={(value) => setForm((current) => ({ ...current, phone: value }))} />
              <TextInput label="Email" value={form.email} onChange={(value) => setForm((current) => ({ ...current, email: value }))} />
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "10px" }}>
                <Select value={form.status} onChange={(value) => setForm((current) => ({ ...current, status: value as UiLead["status"] }))}>
                  {statusOptions.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </Select>
                <Select value={form.score} onChange={(value) => setForm((current) => ({ ...current, score: value as UiLead["score"] }))}>
                  {scoreOptions.map((score) => (
                    <option key={score} value={score}>
                      {score}
                    </option>
                  ))}
                </Select>
              </div>
              <TextInput label="Budget" value={form.budget} onChange={(value) => setForm((current) => ({ ...current, budget: value }))} />
              <TextInput label="Preferred location" value={form.preferredLocation} onChange={(value) => setForm((current) => ({ ...current, preferredLocation: value }))} />
              <Select value={form.source} onChange={(value) => setForm((current) => ({ ...current, source: value }))}>
                {sourceOptions.map((source) => (
                  <option key={source} value={source}>
                    {source}
                  </option>
                ))}
              </Select>
              <Select value={form.propertyId} onChange={(value) => setForm((current) => ({ ...current, propertyId: value }))}>
                <option value="">Match to a property</option>
                {properties.map((property) => (
                  <option key={property.id} value={property.id}>
                    {property.name}
                  </option>
                ))}
              </Select>
              <button className="btn btn-primary" onClick={saveLead} disabled={saving}>
                <Save size={18} />
                {saving ? "Saving..." : form.id ? "Update lead" : "Create lead"}
              </button>
            </div>
          </section>

          <section className="glass-card" style={{ padding: "24px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h2 style={{ fontSize: "1.2rem" }}>Selected lead insight</h2>
              <Filter size={18} />
            </div>

            {selectedLead ? (
              <div style={{ display: "grid", gap: "14px" }}>
                <div className="glass" style={{ padding: "16px" }}>
                  <div style={{ fontWeight: 800, marginBottom: "6px" }}>{selectedLead.name}</div>
                  <div style={{ color: "var(--muted)", lineHeight: 1.7 }}>{selectedLead.preferredLocation}</div>
                </div>

                <div className="glass" style={{ padding: "16px" }}>
                  <div style={{ color: "var(--muted)", fontSize: "0.85rem", marginBottom: "6px" }}>Top property matches</div>
                  <div style={{ display: "grid", gap: "10px" }}>
                    {topMatches.map(({ property, fitScore }) => (
                      <div key={property.id} className="glass" style={{ padding: "12px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", gap: "12px" }}>
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

                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px" }}>
                  <ActionButton icon={<Phone size={16} />} label="Call" />
                  <ActionButton icon={<MessageCircle size={16} />} label="Message" />
                  <ActionButton icon={<Calendar size={16} />} label="Schedule" />
                </div>
              </div>
            ) : null}
          </section>
        </aside>
      </div>
    </div>
  );
}

function SearchBox({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <div className="glass" style={{ padding: "10px 14px", display: "flex", alignItems: "center", gap: "10px" }}>
      <Search size={18} color="var(--muted)" />
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        type="text"
        placeholder={placeholder}
        style={{ width: "100%", background: "transparent", border: "none", color: "var(--foreground)", outline: "none" }}
      />
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="glass" style={{ padding: "12px" }}>
      <div style={{ color: "var(--muted)", fontSize: "0.72rem", marginBottom: "4px" }}>{label}</div>
      <div style={{ fontWeight: 700, fontSize: "0.86rem", lineHeight: 1.5 }}>{value}</div>
    </div>
  );
}

function TextInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label style={{ display: "grid", gap: "8px" }}>
      <span style={{ fontSize: "0.85rem", color: "var(--muted)" }}>{label}</span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        style={fieldStyle}
      />
    </label>
  );
}

function Select({
  value,
  onChange,
  children,
}: {
  value: string;
  onChange: (value: string) => void;
  children: ReactNode;
}) {
  return (
    <select
      value={value}
      onChange={(event) => onChange(event.target.value)}
      style={fieldStyle}
    >
      {children}
    </select>
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

const fieldStyle: CSSProperties = {
  width: "100%",
  padding: "12px 14px",
  background: "rgba(255,255,255,0.04)",
  border: "1px solid var(--border)",
  borderRadius: "12px",
  color: "var(--foreground)",
  outline: "none",
};
