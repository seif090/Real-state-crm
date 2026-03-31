import {
  ArrowUpRight,
  Clock3,
  Home,
  Sparkles,
  TrendingUp,
  Users,
  AlertTriangle,
} from "lucide-react";
import { getDashboardSnapshot } from "@/lib/crm-service";
import { formatCurrency, getLeadNextAction, type Lead as UiLead } from "@/lib/crm-data";
import type { ReactNode } from "react";

export const dynamic = "force-dynamic";

export default async function DashboardOverview() {
  const metrics = await getDashboardSnapshot();
  const topOpportunity = metrics.topLeads[0];

  return (
    <div style={{ display: "grid", gap: "24px" }}>
      <header className="glass-card" style={{ padding: "28px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: "20px", flexWrap: "wrap" }}>
          <div style={{ maxWidth: "760px" }}>
            <h1 style={{ fontSize: "2rem", marginBottom: "10px" }}>Sales command center</h1>
            <p style={{ color: "var(--muted)", lineHeight: 1.8 }}>
              Live CRM health, pipeline urgency, and smart property matching sourced from Prisma.
            </p>
          </div>
          <div className="glass" style={{ padding: "14px 18px", minWidth: "220px" }}>
            <div style={{ color: "var(--muted)", fontSize: "0.85rem", marginBottom: "8px" }}>Expected revenue</div>
            <div style={{ fontSize: "1.6rem", fontWeight: 800 }}>{formatCurrency(metrics.expectedRevenue)}</div>
          </div>
        </div>
      </header>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "20px" }}>
        <MetricCard icon={<Users size={18} />} label="Total leads" value={metrics.totalLeads} delta="+ live" />
        <MetricCard icon={<Sparkles size={18} />} label="Hot leads" value={metrics.hotLeads} delta="+ hot" />
        <MetricCard icon={<TrendingUp size={18} />} label="Closed deals" value={metrics.closedDeals} delta="+ sold" />
        <MetricCard icon={<Clock3 size={18} />} label="Overdue follow-ups" value={metrics.overdueFollowUps} delta="needs action" accent="#ff9800" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: "24px" }}>
        <section className="glass-card" style={{ padding: "28px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px" }}>
            <h2 style={{ fontSize: "1.2rem" }}>Pipeline health</h2>
            <span style={{ color: "var(--muted)", fontSize: "0.85rem" }}>{metrics.activeLeads} active leads</span>
          </div>

          <div style={{ display: "grid", gap: "14px" }}>
            {metrics.pipeline.map((stage) => (
              <div key={stage.status} className="glass" style={{ padding: "14px 16px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", gap: "12px" }}>
                  <span style={{ fontWeight: 700 }}>{stage.status}</span>
                  <span style={{ color: "var(--primary)", fontWeight: 800 }}>{stage.count}</span>
                </div>
                <div style={{ height: "8px", borderRadius: "999px", background: "rgba(255,255,255,0.05)", overflow: "hidden" }}>
                  <div
                    style={{
                      width: `${Math.max(8, (stage.count / Math.max(1, metrics.totalLeads)) * 100)}%`,
                      height: "100%",
                      borderRadius: "inherit",
                      background: "linear-gradient(90deg, var(--primary), var(--accent))",
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        <aside className="glass-card" style={{ padding: "28px" }}>
          <h2 style={{ fontSize: "1.2rem", marginBottom: "18px" }}>Top opportunity</h2>
          {topOpportunity ? (
            <div style={{ display: "grid", gap: "14px" }}>
              <div className="glass" style={{ padding: "16px" }}>
                <div style={{ color: "var(--muted)", fontSize: "0.85rem", marginBottom: "6px" }}>Lead</div>
                <div style={{ fontWeight: 700, fontSize: "1.1rem" }}>{topOpportunity.name}</div>
                <div style={{ color: "var(--muted)", marginTop: "6px" }}>{topOpportunity.preferredLocation}</div>
              </div>
              <div className="glass" style={{ padding: "16px" }}>
                <div style={{ color: "var(--muted)", fontSize: "0.85rem", marginBottom: "6px" }}>Next step</div>
                <div style={{ fontWeight: 700 }}>{getLeadNextAction(topOpportunity as UiLead)}</div>
              </div>
              <div className="glass" style={{ padding: "16px" }}>
                <div style={{ color: "var(--muted)", fontSize: "0.85rem", marginBottom: "6px" }}>Conversation depth</div>
                <div style={{ fontWeight: 700 }}>{topOpportunity.messagesCount} messages</div>
              </div>
            </div>
          ) : null}
        </aside>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
        <section className="glass-card" style={{ padding: "28px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px" }}>
            <h2 style={{ fontSize: "1.2rem" }}>Urgent follow-ups</h2>
            <AlertTriangle size={18} color="#ff9800" />
          </div>
          <div style={{ display: "grid", gap: "12px" }}>
            {metrics.leadMatches.map(({ lead }) => (
              <div key={lead.id} className="glass" style={{ padding: "14px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: "12px" }}>
                  <div>
                    <div style={{ fontWeight: 700, marginBottom: "4px" }}>{lead.name}</div>
                    <div style={{ color: "var(--muted)", fontSize: "0.85rem" }}>
                      {lead.status} • {lead.score}
                    </div>
                  </div>
                  <div style={{ textAlign: "end" }}>
                    <div style={{ color: "var(--primary)", fontWeight: 700 }}>{lead.budget.toLocaleString("en-US")} ج.م</div>
                    <div style={{ color: "var(--muted)", fontSize: "0.8rem" }}>{getLeadNextAction(lead as UiLead)}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="glass-card" style={{ padding: "28px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px" }}>
            <h2 style={{ fontSize: "1.2rem" }}>Smart recommendations</h2>
            <Home size={18} color="var(--primary)" />
          </div>
          <div style={{ display: "grid", gap: "12px" }}>
            {metrics.recommendations.map((item) => (
              <div key={item.title} className="glass" style={{ padding: "14px" }}>
                <div style={{ fontWeight: 700, marginBottom: "6px" }}>{item.title}</div>
                <div style={{ color: "var(--muted)", lineHeight: 1.7 }}>{item.detail}</div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

function MetricCard({
  icon,
  label,
  value,
  delta,
  accent = "var(--primary)",
}: {
  icon: ReactNode;
  label: string;
  value: ReactNode;
  delta: string;
  accent?: string;
}) {
  return (
    <div className="glass-card" style={{ padding: "22px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
        <div className="glass" style={{ width: 42, height: 42, borderRadius: "12px", display: "grid", placeItems: "center", color: accent }}>
          {icon}
        </div>
        <span style={{ color: "var(--muted)", fontSize: "0.85rem", fontWeight: 700, display: "flex", alignItems: "center", gap: "4px" }}>
          {delta}
          <ArrowUpRight size={14} />
        </span>
      </div>
      <div style={{ fontSize: "1.8rem", fontWeight: 800, marginBottom: "6px" }}>{value}</div>
      <div style={{ color: "var(--muted)" }}>{label}</div>
    </div>
  );
}
