"use client";

import { useState } from "react";
import { useStore } from "@/lib/store";
import { AdminPageHeader } from "@/components/admin-shell";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";

interface Msg {
  id: string;
  from: "them" | "me";
  text: string;
  at: string;
}

export default function Messages() {
  const { users, currentUser } = useStore();
  const contacts = users.filter((u) => u.id !== currentUser?.id);
  const [activeId, setActiveId] = useState(contacts[0]?.id ?? "");
  const [draft, setDraft] = useState("");
  const [threads, setThreads] = useState<Record<string, Msg[]>>(() =>
    Object.fromEntries(
      contacts.map((c) => [
        c.id,
        [
          { id: "1", from: "them", text: `Hey, this is ${c.name.split(" ")[0]} — need any help?`, at: "9:12 AM" },
        ] as Msg[],
      ])
    )
  );

  const active = contacts.find((c) => c.id === activeId);
  const msgs = threads[activeId] ?? [];

  const send = () => {
    if (!draft.trim()) return;
    setThreads((t) => ({
      ...t,
      [activeId]: [...(t[activeId] ?? []), { id: `${Date.now()}`, from: "me", text: draft, at: "now" }],
    }));
    setDraft("");
  };

  return (
    <div>
      <AdminPageHeader title="Messages" subtitle="Talk to sellers and buyers" />

      <div className="grid gap-5 lg:grid-cols-[300px_1fr]">
        <div className="rounded-3xl bg-background p-3 shadow-card">
          {contacts.map((c) => (
            <button
              key={c.id}
              onClick={() => setActiveId(c.id)}
              className={`flex w-full items-center gap-3 rounded-2xl p-3 text-left transition ${
                c.id === activeId ? "bg-secondary" : "hover:bg-secondary/60"
              }`}
            >
              <div className="grid h-10 w-10 place-items-center rounded-full bg-gradient-sun text-primary-foreground text-xs font-bold">
                {c.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
              </div>
              <div className="min-w-0">
                <div className="truncate font-medium">{c.name}</div>
                <div className="truncate text-xs text-muted-foreground capitalize">{c.role}</div>
              </div>
            </button>
          ))}
        </div>

        <div className="flex h-[540px] flex-col rounded-3xl bg-background shadow-card">
          <div className="flex items-center gap-3 border-b border-border/60 p-4">
            <div className="grid h-10 w-10 place-items-center rounded-full bg-gradient-sun text-primary-foreground text-xs font-bold">
              {active?.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
            </div>
            <div>
              <div className="font-semibold">{active?.name}</div>
              <div className="text-xs text-muted-foreground">Online</div>
            </div>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto p-4">
            {msgs.map((m) => (
              <div key={m.id} className={`flex ${m.from === "me" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[70%] rounded-2xl px-4 py-2.5 text-sm ${
                    m.from === "me" ? "bg-primary text-primary-foreground" : "bg-secondary"
                  }`}
                >
                  {m.text}
                  <div className={`mt-1 text-[10px] ${m.from === "me" ? "opacity-70" : "text-muted-foreground"}`}>{m.at}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-2 border-t border-border/60 p-3">
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder="Type a message…"
              className="flex-1 rounded-full bg-secondary px-4 py-2.5 text-sm outline-none"
            />
            <Button onClick={send} size="icon" className="rounded-full">
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
