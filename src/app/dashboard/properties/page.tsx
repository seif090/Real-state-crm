"use client";
/* eslint-disable react-hooks/set-state-in-effect */

import type { CSSProperties, ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import {
  Plus,
  Search,
  MapPin,
  MoreVertical,
  Filter,
  Sparkles,
  Save,
  RefreshCcw,
} from "lucide-react";
import { getPropertyFitScore, type Lead as UiLead, type PropertySummary as UiProperty } from "@/lib/crm-data";

type FormState = {
  id: string;
  name: string;
  location: string;
  type: string;
  price: string;
  area: string;
  bedrooms: string;
  bathrooms: string;
  description: string;
  status: UiProperty["status"];
};

const emptyForm: FormState = {
  id: "",
  name: "",
  location: "",
  type: "Apartment",
  price: "",
  area: "",
  bedrooms: "",
  bathrooms: "",
  description: "",
  status: "AVAILABLE",
};

type LeadRecord = {
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
};

export default function PropertiesPage() {
  const [properties, setProperties] = useState<UiProperty[]>([]);
  const [leads, setLeads] = useState<LeadRecord[]>([]);
  const [selectedLeadId, setSelectedLeadId] = useState("");
  const [selectedPropertyId, setSelectedPropertyId] = useState("");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<UiProperty["status"] | "ALL">("ALL");
  const [sortMode, setSortMode] = useState<"fit" | "price" | "area">("fit");
  const [form, setForm] = useState<FormState>(emptyForm);
  const [saving, setSaving] = useState(false);

  const loadData = async () => {
    const [propertyResponse, leadResponse] = await Promise.all([
      fetch("/api/properties"),
      fetch("/api/leads"),
    ]);

    const propertyJson = await propertyResponse.json();
    const leadJson = await leadResponse.json();
    const nextProperties = (propertyJson.properties || []) as UiProperty[];
    const nextLeads = (leadJson.leads || []) as LeadRecord[];

    setProperties(nextProperties);
    setLeads(nextLeads);
    setSelectedPropertyId((current) => current || nextProperties[0]?.id || "");
    setSelectedLeadId((current) => current || nextLeads[0]?.id || "");
  };

  useEffect(() => {
    loadData();
  }, []);

  const selectedLead = useMemo(
    () => leads.find((lead) => lead.id === selectedLeadId) ?? leads[0],
    [leads, selectedLeadId]
  );

  const selectedProperty = useMemo(
    () => properties.find((property) => property.id === selectedPropertyId) ?? properties[0],
    [properties, selectedPropertyId]
  );

  useEffect(() => {
    if (!selectedProperty) return;

    setForm({
      id: selectedProperty.id,
      name: selectedProperty.name,
      location: selectedProperty.location,
      type: selectedProperty.type,
      price: String(selectedProperty.price),
      area: String(selectedProperty.area),
      bedrooms: String(selectedProperty.bedrooms),
      bathrooms: String(selectedProperty.bathrooms),
      description: selectedProperty.tags.join(", "),
      status: selectedProperty.status,
    });
  }, [selectedProperty]);

  const filteredProperties = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return properties
      .filter((property) => {
        const matchesQuery =
          !normalized ||
          property.name.toLowerCase().includes(normalized) ||
          property.location.toLowerCase().includes(normalized) ||
          property.type.toLowerCase().includes(normalized);
        const matchesStatus = statusFilter === "ALL" || property.status === statusFilter;
        return matchesQuery && matchesStatus;
      })
      .sort((a, b) => {
        if (sortMode === "price") return a.price - b.price;
        if (sortMode === "area") return b.area - a.area;
        if (!selectedLead) return 0;
        return getPropertyFitScore(selectedLead as UiLead, b) - getPropertyFitScore(selectedLead as UiLead, a);
      });
  }, [properties, query, selectedLead, sortMode, statusFilter]);

  const saveProperty = async () => {
    if (!form.name.trim() || !form.location.trim()) {
      return;
    }

    setSaving(true);
    const payload = {
      name: form.name,
      location: form.location,
      type: form.type,
      price: Number(form.price || 0),
      area: Number(form.area || 0),
      bedrooms: form.bedrooms ? Number(form.bedrooms) : undefined,
      bathrooms: form.bathrooms ? Number(form.bathrooms) : undefined,
      description: form.description,
      status: form.status,
    };

    const response = await fetch(
      form.id ? `/api/properties/${form.id}` : "/api/properties",
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

  const topLeadMatches = useMemo(() => {
    if (!selectedProperty) return [];

    return [...leads]
      .map((lead) => ({
        lead,
        fitScore: getPropertyFitScore(lead as UiLead, selectedProperty),
      }))
      .sort((a, b) => b.fitScore - a.fitScore)
      .slice(0, 3);
  }, [leads, selectedProperty]);

  return (
    <div style={{ display: "grid", gap: "24px" }}>
      <header className="glass-card" style={{ padding: "28px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: "20px", flexWrap: "wrap", alignItems: "end" }}>
          <div>
            <h1 style={{ fontSize: "1.8rem", marginBottom: "8px" }}>Property Intelligence</h1>
            <p style={{ color: "var(--muted)" }}>Real listings, lead-aware fit scores, and create/edit property forms.</p>
          </div>
          <div style={{ display: "flex", gap: "12px" }}>
            <button className="btn btn-outline" onClick={loadData}>
              <RefreshCcw size={18} />
              Refresh
            </button>
            <button className="btn btn-primary" onClick={() => setForm(emptyForm)}>
              <Plus size={18} />
              New property
            </button>
          </div>
        </div>
      </header>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 220px 220px auto", gap: "12px", alignItems: "center" }}>
        <SearchBox value={query} onChange={setQuery} placeholder="Search properties" />
        <Select value={statusFilter} onChange={(value) => setStatusFilter(value as UiProperty["status"] | "ALL")}>
          <option value="ALL">All statuses</option>
          <option value="AVAILABLE">AVAILABLE</option>
          <option value="RESERVED">RESERVED</option>
          <option value="SOLD">SOLD</option>
        </Select>
        <Select value={sortMode} onChange={(value) => setSortMode(value as "fit" | "price" | "area")}>
          <option value="fit">Sort by fit</option>
          <option value="price">Sort by price</option>
          <option value="area">Sort by area</option>
        </Select>
        <button className="btn btn-outline">
          <Filter size={18} />
          Filter
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: "24px" }}>
        <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "20px" }}>
          {filteredProperties.map((property) => (
            <button
              key={property.id}
              onClick={() => setSelectedPropertyId(property.id)}
              className="glass-card"
              style={{
                padding: "0",
                overflow: "hidden",
                textAlign: "right",
                border: selectedProperty?.id === property.id ? "1px solid var(--primary)" : "1px solid transparent",
                background: selectedProperty?.id === property.id ? "rgba(0,191,165,0.07)" : undefined,
                cursor: "pointer",
              }}
            >
              <div style={{ height: "190px", background: gradientForStatus(property.status), position: "relative" }}>
                <span
                  style={{
                    position: "absolute",
                    top: "14px",
                    right: "14px",
                    padding: "6px 10px",
                    background: property.status === "AVAILABLE" ? "var(--primary)" : property.status === "RESERVED" ? "#ff9800" : "#e91e63",
                    color: "#000",
                    borderRadius: "999px",
                    fontSize: "0.75rem",
                    fontWeight: 800,
                  }}
                >
                  {property.status}
                </span>
                <div
                  style={{
                    position: "absolute",
                    left: "14px",
                    bottom: "14px",
                    padding: "6px 10px",
                    borderRadius: "999px",
                    background: "rgba(0,0,0,0.35)",
                    color: "#fff",
                    fontWeight: 800,
                  }}
                >
                  {selectedLead ? `${getPropertyFitScore(selectedLead as UiLead, property)}% fit` : "Explore"}
                </div>
              </div>

              <div style={{ padding: "20px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", gap: "12px", marginBottom: "10px" }}>
                  <div>
                    <h3 style={{ fontSize: "1.15rem", marginBottom: "6px" }}>{property.name}</h3>
                    <div style={{ color: "var(--muted)", fontSize: "0.85rem", display: "flex", alignItems: "center", gap: "6px" }}>
                      <MapPin size={14} />
                      {property.location}
                    </div>
                  </div>
                  <MoreVertical size={18} color="var(--muted)" />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px", marginBottom: "14px" }}>
                  <Stat label="Area" value={`${property.area} m²`} />
                  <Stat label="Beds" value={property.bedrooms || "Office"} />
                  <Stat label="Price" value={property.price.toLocaleString("en-US")} />
                </div>

                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "14px" }}>
                  {property.tags.map((tag) => (
                    <span key={tag} className="glass" style={{ padding: "6px 10px", borderRadius: "999px", color: "var(--muted)", fontSize: "0.78rem" }}>
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </button>
          ))}
        </section>

        <aside style={{ display: "grid", gap: "20px" }}>
          <section className="glass-card" style={{ padding: "24px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h2 style={{ fontSize: "1.2rem" }}>{form.id ? "Edit property" : "Create property"}</h2>
              <Sparkles size={18} color="var(--primary)" />
            </div>

            <div style={{ display: "grid", gap: "12px" }}>
              <TextInput label="Name" value={form.name} onChange={(value) => setForm((current) => ({ ...current, name: value }))} />
              <TextInput label="Location" value={form.location} onChange={(value) => setForm((current) => ({ ...current, location: value }))} />
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "10px" }}>
                <TextInput label="Type" value={form.type} onChange={(value) => setForm((current) => ({ ...current, type: value }))} />
                <Select value={form.status} onChange={(value) => setForm((current) => ({ ...current, status: value as UiProperty["status"] }))}>
                  <option value="AVAILABLE">AVAILABLE</option>
                  <option value="RESERVED">RESERVED</option>
                  <option value="SOLD">SOLD</option>
                </Select>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "10px" }}>
                <TextInput label="Price" value={form.price} onChange={(value) => setForm((current) => ({ ...current, price: value }))} />
                <TextInput label="Area" value={form.area} onChange={(value) => setForm((current) => ({ ...current, area: value }))} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "10px" }}>
                <TextInput label="Bedrooms" value={form.bedrooms} onChange={(value) => setForm((current) => ({ ...current, bedrooms: value }))} />
                <TextInput label="Bathrooms" value={form.bathrooms} onChange={(value) => setForm((current) => ({ ...current, bathrooms: value }))} />
              </div>
              <label style={{ display: "grid", gap: "8px" }}>
                <span style={{ fontSize: "0.85rem", color: "var(--muted)" }}>Description</span>
                <textarea
                  value={form.description}
                  onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
                  rows={4}
                  style={{ ...fieldStyle, resize: "vertical" }}
                />
              </label>
              <button className="btn btn-primary" onClick={saveProperty} disabled={saving}>
                <Save size={18} />
                {saving ? "Saving..." : form.id ? "Update property" : "Create property"}
              </button>
            </div>
          </section>

          <section className="glass-card" style={{ padding: "24px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h2 style={{ fontSize: "1.2rem" }}>Lead fit panel</h2>
              <Sparkles size={18} color="var(--primary)" />
            </div>

            {selectedProperty ? (
              <div style={{ display: "grid", gap: "14px" }}>
                <div className="glass" style={{ padding: "16px" }}>
                  <div style={{ fontWeight: 800, marginBottom: "6px" }}>{selectedProperty.name}</div>
                  <div style={{ color: "var(--muted)", lineHeight: 1.7 }}>{selectedProperty.location}</div>
                </div>

                <div className="glass" style={{ padding: "16px" }}>
                  <div style={{ color: "var(--muted)", fontSize: "0.85rem", marginBottom: "10px" }}>Top lead matches</div>
                  <div style={{ display: "grid", gap: "10px" }}>
                    {topLeadMatches.map(({ lead, fitScore }) => (
                      <button
                        key={lead.id}
                        className="glass"
                        style={{ padding: "12px", border: "none", cursor: "pointer", textAlign: "right" }}
                        onClick={() => setSelectedLeadId(lead.id)}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", gap: "12px" }}>
                          <div>
                            <div style={{ fontWeight: 700, marginBottom: "4px" }}>{lead.name}</div>
                            <div style={{ color: "var(--muted)", fontSize: "0.85rem" }}>{lead.preferredLocation}</div>
                          </div>
                          <div style={{ color: "var(--primary)", fontWeight: 800 }}>{fitScore}%</div>
                        </div>
                      </button>
                    ))}
                  </div>
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
    <select value={value} onChange={(event) => onChange(event.target.value)} style={fieldStyle}>
      {children}
    </select>
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
      <input value={value} onChange={(event) => onChange(event.target.value)} style={fieldStyle} />
    </label>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="glass" style={{ padding: "12px" }}>
      <div style={{ color: "var(--muted)", fontSize: "0.72rem", marginBottom: "4px" }}>{label}</div>
      <div style={{ fontWeight: 700, fontSize: "0.86rem", lineHeight: 1.5 }}>{value}</div>
    </div>
  );
}

function gradientForStatus(status: UiProperty["status"]) {
  if (status === "RESERVED") {
    return "linear-gradient(145deg, rgba(255,152,0,0.55), rgba(255,255,255,0.08))";
  }

  if (status === "SOLD") {
    return "linear-gradient(145deg, rgba(233,30,99,0.55), rgba(255,255,255,0.08))";
  }

  return "linear-gradient(145deg, rgba(0,191,165,0.55), rgba(255,255,255,0.08))";
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
