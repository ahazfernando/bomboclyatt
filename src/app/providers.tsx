"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { StoreProvider } from "@/lib/store";
import { CurrencyProvider } from "@/lib/currency";
import { LocationProvider } from "@/lib/location";
import { SiteNav, SiteFooter } from "@/components/site-nav";
import { Toaster } from "@/components/ui/sonner";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin") ?? false;
  const isAuth = pathname?.startsWith("/auth") ?? false;
  const isDashboard = pathname?.startsWith("/dashboard") ?? false;
  const showSiteChrome = !isAdmin && !isAuth && !isDashboard;

  return (
    <QueryClientProvider client={queryClient}>
      <StoreProvider>
        <CurrencyProvider>
          <LocationProvider>
            {showSiteChrome && <SiteNav />}
            {children}
            {showSiteChrome && <SiteFooter />}
            <Toaster />
          </LocationProvider>
        </CurrencyProvider>
      </StoreProvider>
    </QueryClientProvider>
  );
}
