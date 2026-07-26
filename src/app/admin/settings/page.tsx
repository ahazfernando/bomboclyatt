"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useStore } from "@/lib/store";
import { AdminPageHeader } from "@/components/admin-shell";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function SettingsPage() {
  const router = useRouter();
  const { currentAdmin, logout } = useStore();
  const [name, setName] = useState(currentAdmin?.name ?? "");
  const [email, setEmail] = useState(currentAdmin?.email ?? "");
  const [bio, setBio] = useState(currentAdmin?.bio ?? "");
  const [notify, setNotify] = useState({ sales: true, giveaways: true, weekly: false });
  const [theme, setTheme] = useState<"light" | "dark">("light");

  if (!currentAdmin) return null;

  const save = () => toast.success("Settings saved locally");

  return (
    <div>
      <AdminPageHeader title="Settings" subtitle="Admin profile and preferences" />

      <div className="grid gap-5 lg:grid-cols-2">
        <section className="rounded-3xl bg-background p-6 shadow-card">
          <h2 className="display text-2xl">Profile</h2>
          <div className="mt-4 space-y-4">
            <Field label="Name">
              <input value={name} onChange={(e) => setName(e.target.value)} className="w-full rounded-xl bg-secondary px-4 py-2.5 text-sm outline-none" />
            </Field>
            <Field label="Email">
              <input value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-xl bg-secondary px-4 py-2.5 text-sm outline-none" />
            </Field>
            <Field label="Bio">
              <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={3} className="w-full rounded-xl bg-secondary px-4 py-2.5 text-sm outline-none" />
            </Field>
            <Button onClick={save} className="rounded-full">Save changes</Button>
          </div>
        </section>

        <section className="rounded-3xl bg-background p-6 shadow-card">
          <h2 className="display text-2xl">Notifications</h2>
          <div className="mt-4 space-y-3">
            {(
              [
                ["sales", "New sales & purchases"],
                ["giveaways", "Giveaway winners"],
                ["weekly", "Weekly digest"],
              ] as const
            ).map(([k, label]) => (
              <label key={k} className="flex cursor-pointer items-center justify-between rounded-xl bg-secondary/60 px-4 py-3">
                <span className="text-sm">{label}</span>
                <input
                  type="checkbox"
                  checked={notify[k]}
                  onChange={(e) => setNotify({ ...notify, [k]: e.target.checked })}
                  className="h-4 w-4 accent-primary"
                />
              </label>
            ))}
          </div>

          <h2 className="display mt-6 text-2xl">Appearance</h2>
          <div className="mt-3 flex gap-2">
            {(["light", "dark"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTheme(t)}
                className={`flex-1 rounded-xl px-4 py-3 text-sm font-medium capitalize transition ${
                  theme === t ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <div className="mt-8 rounded-2xl border border-destructive/30 bg-destructive/5 p-4">
            <div className="font-semibold text-destructive">Danger zone</div>
            <p className="mt-1 text-sm text-muted-foreground">Sign out of this admin session.</p>
            <Button
              variant="destructive"
              className="mt-3 rounded-full"
              onClick={() => { logout(); router.push("/"); }}
            >
              Sign out
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <div className="mb-1.5 text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
      {children}
    </label>
  );
}
