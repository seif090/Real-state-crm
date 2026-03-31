"use client";

import type { CSSProperties } from "react";
import { useMemo, useState } from "react";
import {
  Plus,
  Search,
  MapPin,
  MoreVertical,
  Filter,
  Sparkles,
} from "lucide-react";
import { formatCurrency, getPropertyFitScore, leads, properties, type PropertySummary } from "@/lib/crm-data";

type SortMode = "fit" | "price" | "area";

export default function PropertiesGrid() {
  const [query, setQuery] = useState("");
  const [sortMode, setSortMode] = useState<SortMode>("fit");
  const [statusFilter, setStatusFilter] = useState<"ALL" | PropertySummary["status"]>("ALL");
  const [selectedLeadId, setSelectedLeadId] = useState(leads[0]?.id ?? "");
  const [selectedPropertyId, setSelectedPropertyId] = useState(properties[0]?.id ?? "");

  const selectedLead = useMemo(() => leads.find((lead) => lead.id === selectedLeadId) ?? leads[0], [selectedLeadId]);

  const filteredProperties = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return [...properties]
      .map((property) => ({
        property,
        fitScore: selectedLead ? getPropertyFitScore(selectedLead, property) : 0,
      }))
      .filter(({ property }) => {
        const matchesQuery =
          !normalizedQuery ||
          property.name.toLowerCase().includes(normalizedQuery) ||
          property.location.toLowerCase().includes(normalizedQuery) ||
          property.type.toLowerCase().includes(normalizedQuery);
        const matchesStatus = statusFilter === "ALL" || property.status === statusFilter;
        return matchesQuery && matchesStatus;
      })
      .sort((a, b) => {
        if (sortMode === "price") return a.property.price - b.property.price;
        if (sortMode === "area") return b.property.area - a.property.area;
        return b.fitScore - a.fitScore;
      });
  }, [query, selectedLead, sortMode, statusFilter]);

  const selectedProperty = filteredProperties.find((item) => item.property.id === selectedPropertyId)?.property ?? filteredProperties[0]?.property ?? properties[0];

  return (
    <div style={{ display: "grid", gap: "24px" }}>
      <header className="glass-card" style={{ padding: "28px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: "20px", flexWrap: "wrap", alignItems: "end" }}>
          <div>
            <h1 style={{ fontSize: "1.8rem", marginBottom: "8px" }}>Property Intelligence</h1>
            <p style={{ color: "var(--muted)" }}>Filter listings by fit score, budget, and inventory state.</p>
          </div>
          <button className="btn btn-primary">
            <Plus size={18} />
            Add property
          </button>
        </div>
      </header>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 220px 220px auto", gap: "12px", alignItems: "center" }}>
        <div className="glass" style={{ padding: "10px 14px", display: "flex", alignItems: "center", gap: "10px" }}>
          <Search size={18} color="var(--muted)" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            type="text"
            placeholder="Search properties"
            style={{ width: "100%", background: "transparent", border: "none", color: "var(--foreground)", outline: "none" }}
          />
        </div>

        <select value={selectedLeadId} onChange={(event) => setSelectedLeadId(event.target.value)} style={selectStyle}>
          {leads.map((lead) => (
            <option key={lead.id} value={lead.id}>
              Lead match: {lead.name}
            </option>
          ))}
        </select>

        <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as PropertySummary["status"] | "ALL")} style={selectStyle}>
          <option value="ALL">All statuses</option>
          <option value="AVAILABLE">Available</option>
          <option value="RESERVED">Reserved</option>
          <option value="SOLD">Sold</option>
        </select>

        <button className="btn btn-outline" onClick={() => setSortMode(sortMode === "fit" ? "price" : sortMode === "price" ? "area" : "fit")}>
          <Filter size={18} />
          Sort: {sortMode}
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.15fr 0.85fr", gap: "24px" }}>
        <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "20px" }}>
          {filteredProperties.map(({ property, fitScore }) => (
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
              <div style={{ height: "190px", background: gradientForProperty(property.status), position: "relative" }}>
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
                  {fitScore}% fit
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
                  <Stat label="Price" value={formatCurrency(property.price)} />
                </div>

                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "14px" }}>
                  {property.tags.map((tag) => (
                    <span key={tag} className="glass" style={{ padding: "6px 10px", borderRadius: "999px", color: "var(--muted)", fontSize: "0.78rem" }}>
                      {tag}
                    </span>
                  ))}
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid var(--border)", paddingTop: "14px" }}>
                  <span style={{ fontWeight: 800, color: "var(--primary)" }}>{formatCurrency(property.price)}</span>
                  <span style={{ color: "var(--muted)", fontSize: "0.85rem" }}>Tap for fit details</span>
                </div>
              </div>
            </button>
          ))}
        </section>

        <aside className="glass-card" style={{ padding: "24px", height: "fit-content", position: "sticky", top: "24px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
            <h2 style={{ fontSize: "1.2rem" }}>Match panel</h2>
            <Sparkles size={18} color="var(--primary)" />
          </div>

          {selectedProperty ? (
            <div style={{ display: "grid", gap: "14px" }}>
              <div className="glass" style={{ padding: "16px" }}>
                <div style={{ fontWeight: 800, marginBottom: "4px" }}>{selectedProperty.name}</div>
                <div style={{ color: "var(--muted)", lineHeight: 1.7 }}>{selectedProperty.location}</div>
              </div>

              <div className="glass" style={{ padding: "16px" }}>
                <div style={{ color: "var(--muted)", fontSize: "0.85rem", marginBottom: "6px" }}>Match score for {selectedLead?.name}</div>
                <div style={{ fontSize: "1.9rem", fontWeight: 800, color: "var(--primary)" }}>
                  {selectedLead ? getPropertyFitScore(selectedLead, selectedProperty) : 0}%
                </div>
              </div>

              <div className="glass" style={{ padding: "16px", display: "grid", gap: "12px" }}>
                <Row label="Type" value={selectedProperty.type} />
                <Row label="Area" value={`${selectedProperty.area} m²`} />
                <Row label="Bedrooms" value={selectedProperty.bedrooms || "N/A"} />
                <Row label="Bathrooms" value={selectedProperty.bathrooms} />
                <Row label="Price" value={formatCurrency(selectedProperty.price)} />
              </div>

              <button className="btn btn-primary">
                <Sparkles size={16} />
                Share top match
              </button>
            </div>
          ) : null}
        </aside>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="glass" style={{ padding: "12px" }}>
      <div style={{ color: "var(--muted)", fontSize: "0.72rem", marginBottom: "4px" }}>{label}</div>
      <div style={{ fontWeight: 700, fontSize: "0.9rem" }}>{value}</div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string | number }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", gap: "12px" }}>
      <span style={{ color: "var(--muted)" }}>{label}</span>
      <span style={{ fontWeight: 700 }}>{value}</span>
    </div>
  );
}

function gradientForProperty(status: PropertySummary["status"]) {
  if (status === "RESERVED") {
    return "linear-gradient(145deg, rgba(255,152,0,0.55), rgba(255,255,255,0.08))";
  }

  if (status === "SOLD") {
    return "linear-gradient(145deg, rgba(233,30,99,0.55), rgba(255,255,255,0.08))";
  }

  return "linear-gradient(145deg, rgba(0,191,165,0.55), rgba(255,255,255,0.08))";
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
