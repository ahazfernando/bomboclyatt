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
  Settings,
  LogOut,
  Search,
  Bell,
  ChevronDown,
  Flame,
} from "lucide-react";

const rail = [
  { to: "/admin", icon: LayoutGrid, label: "Overview" },
  { to: "/admin/analytics", icon: BarChart3, label: "Analytics" },
  { to: "/admin/wallet", icon: Wallet, label: "Wallet" },
  { to: "/admin/reports", icon: ClipboardList, label: "Reports" },
] as const;
const rail2 = [
  { to: "/admin/listings", icon: Package, label: "Listings" },
  { to: "/admin/messages", icon: Mail, label: "Messages" },
  { to: "/admin/help", icon: HelpCircle, label: "Help" },
] as const;

export function AdminShell({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { currentUser, logout } = useStore();
  const pathname = usePathname() ?? "";

  useEffect(() => {
    if (!currentUser) router.push("/auth");
    else if (currentUser.role !== "admin") router.push("/");
  }, [currentUser, router]);

  if (!currentUser || currentUser.role !== "admin") return null;

  const isActive = (to: string) =>
    to === "/admin" ? pathname === "/admin" : pathname.startsWith(to);

  return (
    <div className="min-h-screen bg-secondary/40 px-3 py-4 sm:px-6 sm:py-6">
      <div className="mx-auto max-w-[1400px] rounded-[36px] bg-background p-4 shadow-card sm:p-6">
        {/* Top bar — logo + search/bell/avatar (pill nav removed) */}
        <header className="flex items-center justify-between gap-4">
          <Link href="/admin" className="flex items-center gap-2">
            <div className="grid h-11 w-11 place-items-center rounded-full bg-gradient-hero text-primary-foreground shadow-glow">
              <Flame className="h-5 w-5" />
            </div>
            <span className="display text-3xl tracking-wide">Emberdex</span>
          </Link>

          <div className="flex items-center gap-2">
            <button className="grid h-11 w-11 place-items-center rounded-full bg-secondary/70 hover:bg-secondary">
              <Search className="h-4 w-4" />
            </button>
            <button className="grid h-11 w-11 place-items-center rounded-full bg-secondary/70 hover:bg-secondary">
              <Bell className="h-4 w-4" />
            </button>
            <Link
              href={`/sellers/${currentUser.id}`}
              className="flex items-center gap-2 rounded-full bg-secondary/70 py-1 pl-1 pr-3"
            >
              <div className="grid h-9 w-9 place-items-center rounded-full bg-gradient-sun text-primary-foreground text-xs font-bold">
                {currentUser.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
              </div>
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </Link>
          </div>
        </header>

        <div className="mt-6 grid gap-5 lg:grid-cols-[72px_1fr]">
          {/* Sidebar rail */}
          <aside className="hidden flex-col items-center justify-between rounded-3xl bg-secondary/50 py-6 lg:flex">
            <div className="flex flex-col items-center gap-3">
              {rail.map((n) => (
                <Link
                  key={n.to}
                  href={n.to}
                  title={n.label}
                  className={`grid h-12 w-12 place-items-center rounded-2xl transition ${
                    isActive(n.to)
                      ? "bg-gradient-hero text-primary-foreground shadow-glow"
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
                      ? "bg-gradient-hero text-primary-foreground shadow-glow"
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
                    ? "bg-gradient-hero text-primary-foreground shadow-glow"
                    : "bg-background text-muted-foreground hover:text-foreground"
                }`}
              >
                <Settings className="h-5 w-5" />
              </Link>
              <button
                onClick={() => { logout(); router.push("/"); }}
                title="Sign out"
                className="grid h-12 w-12 place-items-center rounded-2xl bg-background text-muted-foreground hover:text-foreground"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </aside>

          <div>{children}</div>
        </div>
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
