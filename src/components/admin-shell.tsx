"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { useStore } from "@/lib/store";
import {
  LayoutGrid,
  BarChart3,
  Wallet,
  ClipboardList,
  Mail,
  HelpCircle,
  Package,
  Users,
  Settings,
  LogOut,
  Search,
  Bell,
  ChevronDown,
} from "lucide-react";

const rail = [
  { to: "/admin", icon: LayoutGrid, label: "Overview" },
  { to: "/admin/analytics", icon: BarChart3, label: "Analytics" },
  { to: "/admin/wallet", icon: Wallet, label: "Wallet" },
  { to: "/admin/reports", icon: ClipboardList, label: "Reports" },
] as const;
const rail2 = [
  { to: "/admin/users", icon: Users, label: "Users" },
  { to: "/admin/listings", icon: Package, label: "Listings" },
  { to: "/admin/messages", icon: Mail, label: "Messages" },
  { to: "/admin/help", icon: HelpCircle, label: "Help" },
] as const;

export function AdminShell({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { currentAdmin, loading, logout } = useStore();
  const pathname = usePathname() ?? "";

  useEffect(() => {
    if (!loading && !currentAdmin) router.push("/auth/admin");
  }, [currentAdmin, loading, router]);

  if (loading || !currentAdmin) return null;

  const isActive = (to: string) =>
    to === "/admin" ? pathname === "/admin" : pathname.startsWith(to);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="flex shrink-0 items-center justify-between gap-4 border-b border-border/40 px-6 py-4">
        <Link href="/admin" className="flex items-center gap-2">
          <img src="/logo/BomboclyattRedesign.png" alt="BomboClyatt" className="h-9 w-auto" />
          <span className="rounded-full bg-maple/10 px-2 py-0.5 text-xs font-semibold text-maple">Admin</span>
        </Link>

        <div className="flex items-center gap-2">
          <button className="grid h-11 w-11 place-items-center rounded-full bg-secondary/70 hover:bg-secondary">
            <Search className="h-4 w-4" />
          </button>
          <button className="grid h-11 w-11 place-items-center rounded-full bg-secondary/70 hover:bg-secondary">
            <Bell className="h-4 w-4" />
          </button>
          <div className="flex items-center gap-2 rounded-full bg-secondary/70 py-1 pl-1 pr-3">
            <div className="grid h-9 w-9 place-items-center rounded-full bg-maple text-tuft text-xs font-bold">
              {currentAdmin.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
            </div>
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          </div>
        </div>
      </header>

      <div className="flex min-h-0 flex-1 gap-5 px-4 pb-4 pt-4 sm:px-6 sm:pb-6 sm:pt-5">
        <aside className="hidden w-[72px] shrink-0 flex-col items-center justify-between self-stretch rounded-3xl bg-secondary/50 py-6 lg:flex">
          <div className="flex flex-col items-center gap-3">
            {rail.map((n) => (
              <Link
                key={n.to}
                href={n.to}
                title={n.label}
                className={`grid h-12 w-12 place-items-center rounded-2xl transition ${
                  isActive(n.to)
                    ? "bg-maple text-tuft shadow-glow"
                    : "bg-background text-muted-foreground hover:text-foreground"
                }`}
              >
                <n.icon className="h-5 w-5" />
              </Link>
            ))}
            <div className="my-2 h-px w-8 bg-border" />
            {rail2.map((n) => (
              <Link
                key={n.to}
                href={n.to}
                title={n.label}
                className={`grid h-12 w-12 place-items-center rounded-2xl transition ${
                  isActive(n.to)
                    ? "bg-maple text-tuft shadow-glow"
                    : "bg-background text-muted-foreground hover:text-foreground"
                }`}
              >
                <n.icon className="h-5 w-5" />
              </Link>
            ))}
          </div>
          <div className="flex flex-col items-center gap-3">
            <Link
              href="/admin/settings"
              title="Settings"
              className={`grid h-12 w-12 place-items-center rounded-2xl transition ${
                isActive("/admin/settings")
                  ? "bg-maple text-tuft shadow-glow"
                  : "bg-background text-muted-foreground hover:text-foreground"
              }`}
            >
              <Settings className="h-5 w-5" />
            </Link>
            <button
              onClick={() => {
                logout();
                router.push("/");
              }}
              title="Sign out"
              className="grid h-12 w-12 place-items-center rounded-2xl bg-background text-muted-foreground hover:text-foreground"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </aside>

        <main className="min-w-0 flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  );
}

export function AdminPageHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="display text-4xl sm:text-5xl">{title}</h1>
        {subtitle && <p className="mt-1 text-muted-foreground">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
