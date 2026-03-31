"use client";
/* eslint-disable react-hooks/set-state-in-effect */

import type { CSSProperties } from "react";
import { useEffect, useMemo, useState } from "react";
import {
  Sparkles,
  Send,
  Loader2,
  BrainCircuit,
  Home,
  MessageSquareText,
  RefreshCcw,
} from "lucide-react";

type Thread = {
  id: string;
  name: string;
  phone: string;
  score: "HOT" | "WARM" | "COLD";
  status: string;
  latestMessage?: string;
  latestMessageAt?: string;
  unreadCount?: number;
  assignedProperty?: {
    name: string;
    location: string;
  };
};

type ConversationMessage = {
  id: string;
  content: string;
  isIncoming: boolean;
  createdAt: string;
};

type Conversation = {
  lead: Thread;
  messages: ConversationMessage[];
  nextAction?: string;
  priceLabel?: string;
  matchSuggestions?: Array<{
    property: {
      id: string;
      name: string;
      location: string;
      price: number;
      area: number;
    };
    fitScore: number;
  }>;
};

export default function AssistantInboxPage() {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [selectedLeadId, setSelectedLeadId] = useState("");
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [composer, setComposer] = useState("");
  const [draft, setDraft] = useState("");
  const [aiStatus, setAiStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const loadThreads = async () => {
    setLoading(true);
    const response = await fetch("/api/inbox");
    const json = await response.json();
    const nextThreads = (json.threads || []) as Thread[];
    setThreads(nextThreads);
    setSelectedLeadId((current) => current || nextThreads[0]?.id || "");
    setLoading(false);
  };

  const loadConversation = async (leadId: string) => {
    if (!leadId) return;

    const response = await fetch(`/api/inbox/${leadId}`);
    const json = await response.json();
    setConversation(json as Conversation);
    setDraft("");
    setComposer("");
  };

  useEffect(() => {
    loadThreads();
  }, []);

  useEffect(() => {
    if (selectedLeadId) {
      loadConversation(selectedLeadId);
    }
  }, [selectedLeadId]);

  const activeThread = useMemo(
    () => threads.find((thread) => thread.id === selectedLeadId),
    [selectedLeadId, threads]
  );

  const sendMessage = async (content: string, isIncoming = false) => {
    if (!selectedLeadId || !content.trim()) return;

    setSending(true);
    const response = await fetch(`/api/inbox/${selectedLeadId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content, isIncoming }),
    });

    if (response.ok) {
      await loadConversation(selectedLeadId);
      await loadThreads();
    }

    setSending(false);
  };

  const generateAiReply = async () => {
    if (!selectedLeadId || !composer.trim()) return;

    setAiStatus("Generating...");
    const response = await fetch("/api/assistant", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        leadId: selectedLeadId,
        message: composer,
      }),
    });

    const json = await response.json();
    setDraft(json.text || "");
    setAiStatus(json.score ? `Scored ${json.score}` : null);
  };

  return (
    <div style={{ display: "grid", gap: "24px" }}>
      <header className="glass-card" style={{ padding: "28px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: "20px", flexWrap: "wrap", alignItems: "end" }}>
          <div>
            <h1 style={{ fontSize: "1.8rem", marginBottom: "8px" }}>Lead Inbox</h1>
            <p style={{ color: "var(--muted)" }}>Saved conversations, AI drafting, and live message persistence.</p>
          </div>
          <div style={{ display: "flex", gap: "12px" }}>
            <button className="btn btn-outline" onClick={loadThreads}>
              <RefreshCcw size={18} />
              Refresh inbox
            </button>
            <span className="glass" style={{ padding: "10px 14px", borderRadius: "999px", color: "var(--primary)" }}>
              <MessageSquareText size={16} style={{ marginInlineEnd: 6, verticalAlign: "middle" }} />
              {threads.length} threads
            </span>
          </div>
        </div>
      </header>

      <div style={{ display: "grid", gridTemplateColumns: "340px 1fr", gap: "24px", minHeight: "70vh" }}>
        <aside className="glass-card" style={{ padding: "18px", overflow: "hidden" }}>
          <div style={{ display: "grid", gap: "10px", maxHeight: "70vh", overflowY: "auto" }}>
            {loading ? (
              <div style={{ color: "var(--muted)" }}>Loading inbox...</div>
            ) : threads.length === 0 ? (
              <div style={{ color: "var(--muted)" }}>No conversations yet.</div>
            ) : (
              threads.map((thread) => (
                <button
                  key={thread.id}
                  onClick={() => setSelectedLeadId(thread.id)}
                  className="glass"
                  style={{
                    padding: "14px",
                    textAlign: "right",
                    border: selectedLeadId === thread.id ? "1px solid var(--primary)" : "1px solid transparent",
                    background: selectedLeadId === thread.id ? "var(--primary-glow)" : "rgba(255,255,255,0.03)",
                    cursor: "pointer",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", gap: "12px", marginBottom: "6px" }}>
                    <div>
                      <div style={{ fontWeight: 800, marginBottom: "4px" }}>{thread.name}</div>
                <div style={{ color: "var(--muted)", fontSize: "0.82rem" }}>{thread.status} • {thread.score}</div>
                    </div>
                    <div style={{ color: "var(--primary)", fontWeight: 800 }}>{thread.latestMessageAt ? new Date(thread.latestMessageAt).toLocaleDateString() : ""}</div>
                  </div>
                  <div style={{ color: "var(--muted)", fontSize: "0.85rem", lineHeight: 1.6 }}>
                    {thread.latestMessage || "No messages yet"}
                  </div>
                </button>
              ))
            )}
          </div>
        </aside>

        <section className="glass-card" style={{ padding: "0", overflow: "hidden" }}>
          <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <h2 style={{ fontSize: "1.2rem", marginBottom: "4px" }}>{activeThread?.name || "Select a thread"}</h2>
              <div style={{ color: "var(--muted)", fontSize: "0.85rem" }}>{activeThread?.phone || ""}</div>
            </div>
            {activeThread && (
              <div style={{ display: "flex", gap: "10px", color: "var(--muted)" }}>
                <Sparkles size={18} />
                <Home size={18} />
                <BrainCircuit size={18} />
              </div>
            )}
          </div>

          <div style={{ padding: "24px", display: "grid", gap: "14px", minHeight: "42vh", maxHeight: "42vh", overflowY: "auto" }}>
            {conversation?.messages?.length ? (
              conversation.messages.map((message) => (
                <div
                  key={message.id}
                  style={{
                    maxWidth: "72%",
                    alignSelf: message.isIncoming ? "flex-end" : "flex-start",
                    display: "grid",
                    justifyItems: message.isIncoming ? "end" : "start",
                  }}
                >
                  <div
                    style={{
                      padding: "12px 16px",
                      borderRadius: message.isIncoming ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                      background: message.isIncoming ? "var(--glass)" : "var(--primary)",
                      color: message.isIncoming ? "var(--foreground)" : "#000",
                    }}
                  >
                    {message.content}
                  </div>
                  <div style={{ fontSize: "0.72rem", color: "var(--muted)", marginTop: "4px" }}>
                    {new Date(message.createdAt).toLocaleTimeString()}
                  </div>
                </div>
              ))
            ) : (
              <div style={{ color: "var(--muted)" }}>Pick a thread to see the conversation.</div>
            )}
          </div>

          <div style={{ borderTop: "1px solid var(--border)", padding: "20px 24px", display: "grid", gap: "12px" }}>
            <div className="glass" style={{ padding: "14px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                <div style={{ fontWeight: 700 }}>AI draft</div>
                <div style={{ color: "var(--muted)", fontSize: "0.82rem" }}>{aiStatus || "Ready"}</div>
              </div>
              <p style={{ color: "var(--muted)", lineHeight: 1.8, whiteSpace: "pre-wrap" }}>{draft || "Generate a suggested reply from the current message."}</p>
              {draft ? (
                <button className="btn btn-outline" style={{ marginTop: "12px" }} onClick={() => sendMessage(draft, false)}>
                  <Send size={16} />
                  Save draft to conversation
                </button>
              ) : null}
            </div>

            <textarea
              value={composer}
              onChange={(event) => setComposer(event.target.value)}
              rows={4}
              placeholder="Write a reply, then generate an AI draft or send it directly..."
              style={fieldStyle}
            />

            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
              <button className="btn btn-outline" onClick={generateAiReply} disabled={!composer.trim() || !selectedLeadId || sending}>
                <BrainCircuit size={16} />
                Generate AI reply
              </button>
              <button className="btn btn-primary" onClick={() => sendMessage(composer, false)} disabled={!composer.trim() || !selectedLeadId || sending}>
                {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                Send message
              </button>
              <button className="btn btn-outline" onClick={() => sendMessage("متابعة سريعة: هل يناسبك عرض اليوم؟", true)} disabled={!selectedLeadId || sending}>
                Simulate incoming
              </button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "12px" }}>
              <InfoCard title="Lead score" value={activeThread?.score || "N/A"} />
              <InfoCard title="Unread" value={String(activeThread?.unreadCount || 0)} />
              <InfoCard title="Suggested property" value={conversation?.matchSuggestions?.[0]?.property.name || "No match"} />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function InfoCard({ title, value }: { title: string; value: string }) {
  return (
    <div className="glass" style={{ padding: "14px" }}>
      <div style={{ color: "var(--muted)", fontSize: "0.78rem", marginBottom: "6px" }}>{title}</div>
      <div style={{ fontWeight: 800 }}>{value}</div>
    </div>
  );
}

const fieldStyle: CSSProperties = {
  width: "100%",
  padding: "14px",
  background: "rgba(255,255,255,0.04)",
  border: "1px solid var(--border)",
  borderRadius: "14px",
  color: "var(--foreground)",
  outline: "none",
  resize: "vertical",
};
