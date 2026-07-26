"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { useStore } from "@/lib/store";
import { AuthNavActions } from "@/components/auth-nav-actions";
import {
  LayoutGrid,
  Package,
  ShoppingBag,
  BarChart3,
  Calendar,
  Gift,
  Settings,
  LogOut,
  Search,
  Bell,
  User,
  Wallet,
  MessageSquare,
} from "lucide-react";

const buyerRail = [
  { to: "/dashboard", icon: LayoutGrid, label: "Overview" },
  { to: "/dashboard/listings", icon: Package, label: "My Listings" },
  { to: "/dashboard/messages", icon: MessageSquare, label: "Messages" },
  { to: "/dashboard/purchases", icon: ShoppingBag, label: "Purchases" },
] as const;

const sellerRail = [
  { to: "/dashboard", icon: LayoutGrid, label: "Overview" },
  { to: "/dashboard/listings", icon: Package, label: "Listings" },
  { to: "/dashboard/messages", icon: MessageSquare, label: "Messages" },
  { to: "/dashboard/wallet", icon: Wallet, label: "Wallet" },
  { to: "/dashboard/analytics", icon: BarChart3, label: "Analytics" },
  { to: "/dashboard/events", icon: Calendar, label: "Events" },
  { to: "/dashboard/giveaways", icon: Gift, label: "Giveaways" },
] as const;

export function DashboardShell({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { currentUser, currentAdmin, sessionType, loading, logout } = useStore();
  const pathname = usePathname() ?? "";

  useEffect(() => {
    if (loading) return;
    if (sessionType === "admin" && currentAdmin) {
      router.replace("/admin");
      return;
    }
    if (!currentUser) router.push("/auth?mode=login");
  }, [currentUser, currentAdmin, sessionType, loading, router]);

  if (loading || (sessionType === "admin" && currentAdmin) || !currentUser) return null;

  const isSeller = currentUser.role === "seller";
  const rail = isSeller ? sellerRail : buyerRail;

  const isActive = (to: string) =>
    to === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(to);

  return (
    <div className="min-h-screen bg-secondary/40 px-3 py-4 sm:px-6 sm:py-6">
      <div className="mx-auto max-w-[1400px] rounded-[36px] bg-background p-4 shadow-card sm:p-6">
        <header className="flex items-center justify-between gap-4">
          <Link href="/dashboard" className="flex items-center gap-2">
            <img src="/logo/BomboclyattRedesign.png" alt="BomboClyatt" className="h-9 w-auto" />
          </Link>

          <div className="hidden items-center gap-1 rounded-full bg-secondary/60 p-1 md:flex">
            {rail.slice(0, 4).map((n) => (
              <Link
                key={n.to}
                href={n.to}
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                  isActive(n.to) ? "bg-background shadow-sm" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {n.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button className="grid h-11 w-11 place-items-center rounded-full bg-secondary/70 hover:bg-secondary">
              <Search className="h-4 w-4" />
            </button>
            <button className="grid h-11 w-11 place-items-center rounded-full bg-secondary/70 hover:bg-secondary">
              <Bell className="h-4 w-4" />
            </button>
            <AuthNavActions showPoints={false} />
          </div>
        </header>

        <div className="mt-6 grid gap-5 lg:grid-cols-[72px_1fr]">
          <aside className="hidden flex-col items-center justify-between rounded-3xl bg-secondary/50 py-6 lg:flex">
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
            </div>
            <div className="flex flex-col items-center gap-3">
              <Link
                href={`/sellers/${currentUser.id}`}
                title="Profile"
                className="grid h-12 w-12 place-items-center rounded-2xl bg-background text-muted-foreground hover:text-foreground"
              >
                <User className="h-5 w-5" />
              </Link>
              <Link
                href="/"
                title="Marketplace"
                className="grid h-12 w-12 place-items-center rounded-2xl bg-background text-muted-foreground hover:text-foreground"
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

          <div>{children}</div>
        </div>
      </div>
    </div>
  );
}
