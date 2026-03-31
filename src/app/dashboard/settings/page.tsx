import type { ReactNode } from "react";
import { Bell, Shield, WandSparkles, MessageSquareText } from "lucide-react";

export default function SettingsPage() {
  return (
    <div style={{ display: "grid", gap: "24px" }}>
      <header className="glass-card" style={{ padding: "28px" }}>
        <h1 style={{ fontSize: "1.8rem", marginBottom: "8px" }}>Workspace Settings</h1>
        <p style={{ color: "var(--muted)" }}>Tune automation, notification rules, and AI tone for your sales desk.</p>
      </header>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "24px" }}>
        <SettingCard icon={<Bell size={18} />} title="Notifications" text="Push hot lead alerts to the right rep within seconds." />
        <SettingCard icon={<Shield size={18} />} title="Permissions" text="Keep sensitive pricing and commissions visible only to admins." />
        <SettingCard icon={<WandSparkles size={18} />} title="AI tone" text="Choose between concise, friendly, or premium-seller voice." />
        <SettingCard icon={<MessageSquareText size={18} />} title="WhatsApp automations" text="Auto-create leads, score incoming messages, and suggest replies." />
      </div>
    </div>
  );
}

function SettingCard({
  icon,
  title,
  text,
}: {
  icon: ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div className="glass-card" style={{ padding: "24px" }}>
      <div className="glass" style={{ width: 42, height: 42, borderRadius: "12px", display: "grid", placeItems: "center", marginBottom: "14px", color: "var(--primary)" }}>
        {icon}
      </div>
      <h2 style={{ fontSize: "1.15rem", marginBottom: "8px" }}>{title}</h2>
      <p style={{ color: "var(--muted)", lineHeight: 1.7 }}>{text}</p>
    </div>
  );
}
