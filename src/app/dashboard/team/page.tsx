import type { ReactNode } from "react";
import { teamMembers } from "@/lib/crm-data";
import { Users, Clock3, BadgeCheck, Wifi } from "lucide-react";

export default function TeamPage() {
  const totalDeals = teamMembers.reduce((sum, member) => sum + member.closedDeals, 0);
  const averageResponse =
    Math.round(
      teamMembers.reduce((sum, member) => sum + member.avgResponseMinutes, 0) /
        teamMembers.length
    ) || 0;

  return (
    <div style={{ display: "grid", gap: "24px" }}>
      <header className="glass-card" style={{ padding: "28px" }}>
        <h1 style={{ fontSize: "1.8rem", marginBottom: "8px" }}>Team Operations</h1>
        <p style={{ color: "var(--muted)" }}>Track agent workload, response speed, and deal output in one place.</p>
      </header>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "24px" }}>
        <Metric icon={<Users size={18} />} label="Team members" value={teamMembers.length} />
        <Metric icon={<BadgeCheck size={18} />} label="Closed deals" value={totalDeals} />
        <Metric icon={<Clock3 size={18} />} label="Avg response" value={`${averageResponse} min`} />
        <Metric icon={<Wifi size={18} />} label="Online" value={teamMembers.filter((member) => member.status === "Online").length} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: "24px" }}>
        <section className="glass-card" style={{ padding: "28px" }}>
          <h2 style={{ fontSize: "1.2rem", marginBottom: "18px" }}>Agent leaderboard</h2>
          <div style={{ display: "grid", gap: "12px" }}>
            {teamMembers.map((member) => (
              <div key={member.id} className="glass" style={{ padding: "14px", display: "flex", justifyContent: "space-between", gap: "16px" }}>
                <div>
                  <div style={{ fontWeight: 700, marginBottom: "4px" }}>{member.name}</div>
                  <div style={{ color: "var(--muted)", fontSize: "0.85rem" }}>{member.role} • {member.status}</div>
                </div>
                <div style={{ textAlign: "end" }}>
                  <div style={{ fontWeight: 700, color: "var(--primary)" }}>{member.closedDeals} closed</div>
                  <div style={{ color: "var(--muted)", fontSize: "0.85rem" }}>{member.leadsAssigned} leads</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <aside className="glass-card" style={{ padding: "28px" }}>
          <h2 style={{ fontSize: "1.2rem", marginBottom: "18px" }}>Workflow notes</h2>
          <div style={{ display: "grid", gap: "12px" }}>
            <InfoCard title="Routing" text="Assign hot leads to the fastest online agent first." />
            <InfoCard title="Follow-up SLA" text="Escalate any lead without a follow-up in under 2 hours." />
            <InfoCard title="Conversion" text="Share win stories from top performers to lift the whole team." />
          </div>
        </aside>
      </div>
    </div>
  );
}

function Metric({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: ReactNode;
}) {
  return (
    <div className="glass-card" style={{ padding: "22px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
        <div className="glass" style={{ width: 40, height: 40, borderRadius: "12px", display: "grid", placeItems: "center", color: "var(--primary)" }}>
          {icon}
        </div>
      </div>
      <div style={{ fontSize: "1.7rem", fontWeight: 800, marginBottom: "6px" }}>{value}</div>
      <div style={{ color: "var(--muted)" }}>{label}</div>
    </div>
  );
}

function InfoCard({ title, text }: { title: string; text: string }) {
  return (
    <div className="glass" style={{ padding: "14px" }}>
      <div style={{ fontWeight: 700, marginBottom: "6px" }}>{title}</div>
      <div style={{ color: "var(--muted)", lineHeight: 1.7 }}>{text}</div>
    </div>
  );
}
