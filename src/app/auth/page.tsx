"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { useStore, type Role } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

function AuthContent() {
  const searchParams = useSearchParams();
  const mode = searchParams.get("mode") === "register" ? "register" : "login";
  const router = useRouter();
  const { login, register, users } = useStore();

  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<Role>("buyer");
  const [whatsapp, setWhatsapp] = useState("");
  const [bio, setBio] = useState("");

  return (
    <div className="mx-auto max-w-md px-6 py-16">
      <h1 className="display text-4xl text-center mb-2">Welcome to Emberdex</h1>
      <p className="text-center text-muted-foreground mb-8">Prototype auth — no passwords, just pick your account.</p>

      <Tabs defaultValue={mode}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="login">Sign in</TabsTrigger>
          <TabsTrigger value="register">Create account</TabsTrigger>
        </TabsList>

        <TabsContent value="login" className="mt-6 space-y-4">
          <div className="rounded-xl border border-border bg-card p-4">
            <p className="text-sm font-medium mb-3">Quick demo sign-in</p>
            <div className="space-y-2">
              {users.map((u) => (
                <button
                  key={u.id}
                  onClick={() => { login(u.email); toast.success(`Signed in as ${u.name}`); router.push("/dashboard"); }}
                  className="flex w-full items-center justify-between rounded-lg border border-border p-3 text-left hover:border-primary transition-colors"
                >
                  <div>
                    <div className="font-medium">{u.name}</div>
                    <div className="text-xs text-muted-foreground capitalize">{u.role} · {u.email}</div>
                  </div>
                  <span className="text-xs text-primary">Sign in →</span>
                </button>
              ))}
            </div>
          </div>
          <div className="pt-2">
            <Label>Or by email</Label>
            <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com" className="mt-1" />
            <Button
              className="mt-3 w-full bg-primary"
              onClick={() => {
                if (login(email)) { toast.success("Signed in"); router.push("/dashboard"); }
                else toast.error("No account with that email.");
              }}
            >
              Sign in
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="register" className="mt-6 space-y-4">
          <div>
            <Label>Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} className="mt-1" />
          </div>
          <div>
            <Label>Email</Label>
            <Input value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1" />
          </div>
          <div>
            <Label>Role</Label>
            <div className="mt-1 grid grid-cols-3 gap-2">
              {(["buyer", "seller", "admin"] as Role[]).map((r) => (
                <Button key={r} type="button" variant={role === r ? "default" : "outline"} onClick={() => setRole(r)} className="capitalize">
                  {r}
                </Button>
              ))}
            </div>
          </div>
          {role !== "admin" && (
            <div>
              <Label>WhatsApp number (with country code, digits only)</Label>
              <Input value={whatsapp} onChange={(e) => setWhatsapp(e.target.value.replace(/\D/g, ""))} placeholder="15551234567" className="mt-1" />
            </div>
          )}
          <div>
            <Label>Bio (optional)</Label>
            <Textarea value={bio} onChange={(e) => setBio(e.target.value)} className="mt-1" />
          </div>
          <Button
            className="w-full bg-gradient-hero text-primary-foreground border-0"
            onClick={() => {
              if (!name || !email) { toast.error("Name and email required."); return; }
              register({ name, email, role, whatsapp, bio });
              toast.success("Welcome to Emberdex!");
              router.push("/dashboard");
            }}
          >
            Create account
          </Button>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={null}>
      <AuthContent />
    </Suspense>
  );
}
