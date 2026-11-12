"use client";

import Link from "next/link";
import { useStore } from "@/lib/store";
import { useCurrency, CURRENCIES, type Currency } from "@/lib/currency";
import { AuthNavActions } from "@/components/auth-nav-actions";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function SiteNav() {
  const { currentAdmin, sessionType } = useStore();
  const { currency, setCurrency } = useCurrency();
  const isAdmin = sessionType === "admin" && !!currentAdmin;

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur">
      <div className="page-shell flex items-center justify-between py-4">
        <Link href="/" className="flex items-center group">
          <img
            src="/logo/BomboclyattRedesign.png"
            alt="Bomboclyatt"
            className="h-11 w-auto transition-transform group-hover:scale-105"
          />
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          <Link href="/browse" className="text-sm font-medium hover:text-primary transition-colors">Buy</Link>
          {isAdmin && (
            <Link href="/admin" className="text-sm font-medium hover:text-primary transition-colors">Admin</Link>
          )}
        </nav>

        <div className="flex items-center gap-3">
          <Select value={currency} onValueChange={(v) => setCurrency(v as Currency)}>
            <SelectTrigger aria-label="Currency" className="h-9 w-[5.5rem] bg-card">
              <SelectValue />
            </SelectTrigger>
            <SelectContent align="end">
              {CURRENCIES.map((c) => (
                <SelectItem key={c.code} value={c.code}>
                  {c.code}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <AuthNavActions />
        </div>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-24 bg-maple text-tuft">
      <div className="page-shell py-16">
        <div className="grid gap-12 lg:grid-cols-[1.5fr_1fr_1fr_auto]">
          {/* About block */}
          <div className="space-y-8">
            <div>
              <h3 className="font-semibold text-tuft text-base">The Bomboclyatt Community</h3>
              <p className="mt-3 text-sm text-tuft/70 leading-relaxed max-w-sm">
                A community-first marketplace for all collectible items. Buy from trusted sellers, close deals on WhatsApp, and earn points on every confirmed pickup.
              </p>
            </div>
            <div className="grid gap-8 sm:grid-cols-2 max-w-lg">
              <div>
                <h4 className="font-semibold text-tuft text-sm">Our Mission</h4>
                <p className="mt-2 text-sm text-tuft/70 leading-relaxed">
                  Empowering collectors with a transparent, reputation-driven marketplace where every trade feels personal.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-tuft text-sm">Verified Sellers</h4>
                <p className="mt-2 text-sm text-tuft/70 leading-relaxed">
                  Every seller is rated by the community. Reviews on every product keep the marketplace honest.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-tuft text-sm">Points &amp; Rewards</h4>
                <p className="mt-2 text-sm text-tuft/70 leading-relaxed">
                  Earn 10 points per confirmed pickup and redeem them at exclusive drops.
                </p>
              </div>
            </div>
          </div>

          {/* Marketplace links */}
          <div>
            <div className="text-xs font-semibold uppercase tracking-widest text-koromiko">Marketplace</div>
            <ul className="mt-4 space-y-3 text-sm">
              <li><Link href="/browse" className="hover:text-crusta transition-colors">Buy Collectibles</Link></li>
              <li><Link href="/browse" className="hover:text-crusta transition-colors">New Drops</Link></li>
              <li><Link href="/auth?mode=register" className="hover:text-crusta transition-colors">Become a Seller</Link></li>
              <li><Link href="/auth" className="hover:text-crusta transition-colors">Sign In</Link></li>
            </ul>
          </div>

          {/* Community links */}
          <div>
            <div className="text-xs font-semibold uppercase tracking-widest text-koromiko">Community</div>
            <ul className="mt-4 space-y-3 text-sm">
              <li><a href="#" className="hover:text-crusta transition-colors">Trust &amp; Safety</a></li>
              <li><a href="#" className="hover:text-crusta transition-colors">Seller Guide</a></li>
              <li><a href="#" className="hover:text-crusta transition-colors">Buyer Protection</a></li>
              <li><a href="#" className="hover:text-crusta transition-colors">Reputation System</a></li>
              <li><a href="#" className="hover:text-crusta transition-colors">Support</a></li>
              <li><a href="#" className="hover:text-crusta transition-colors">Contact Us</a></li>
            </ul>
          </div>

          {/* CTA */}
          <div className="flex flex-col gap-4 lg:items-end">
            <Link
              href="/auth?mode=register"
              className="inline-flex items-center justify-center border-2 border-tuft px-8 py-3 text-sm font-semibold tracking-widest uppercase text-tuft hover:bg-tuft hover:text-maple transition-colors"
            >
              Join Bomboclyatt
            </Link>
            <a href="https://wa.me/94777490077" className="text-sm text-tuft/80 hover:text-crusta transition-colors">
              +94777490077
            </a>
          </div>
        </div>

        {/* Logo + inline nav row */}
        <div className="mt-16 border-t border-tuft/15 pt-8 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-8 flex-wrap">
            <Link href="/" className="flex items-center">
              <img
                src="/logo/BomboclyattRedesign.png"
                alt="Bomboclyatt"
                className="h-12 w-auto"
              />
            </Link>
            <nav className="flex items-center gap-6 text-sm">
              <Link href="/browse" className="hover:text-crusta transition-colors">Buy</Link>
            </nav>
          </div>
          <p className="text-sm text-tuft/60 max-w-md lg:text-right">
            A community-first marketplace for all collectible items. Trusted sellers, real people, real trades.
          </p>
        </div>

        {/* Bottom bar */}
        <div className="mt-8 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <p className="text-xs text-tuft/50 max-w-2xl leading-relaxed">
            © 2026 Thundrblyaz. All trades are between community members. Thundrblyaz facilitates connection and reputation but is not a party to individual transactions. Prototype build.
          </p>
          <div className="flex items-center gap-4 text-tuft/70">
            <a href="#" aria-label="Facebook" className="hover:text-crusta transition-colors">
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c5.05-.5 9-4.76 9-9.95z"/></svg>
            </a>
            <a href="#" aria-label="Twitter" className="hover:text-crusta transition-colors">
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z"/></svg>
            </a>
            <a href="#" aria-label="YouTube" className="hover:text-crusta transition-colors">
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23.5 6.2c-.3-1-1.1-1.8-2.1-2.1C19.6 3.6 12 3.6 12 3.6s-7.6 0-9.4.5c-1 .3-1.8 1.1-2.1 2.1C0 8 0 12 0 12s0 4 .5 5.8c.3 1 1.1 1.8 2.1 2.1 1.8.5 9.4.5 9.4.5s7.6 0 9.4-.5c1-.3 1.8-1.1 2.1-2.1.5-1.8.5-5.8.5-5.8s0-4-.5-5.8zM9.6 15.6V8.4l6.4 3.6-6.4 3.6z"/></svg>
            </a>
            <a href="#" aria-label="Instagram" className="hover:text-crusta transition-colors">
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.2c3.2 0 3.6 0 4.8.1 1.2.1 1.8.2 2.2.4.6.2 1 .5 1.4.9.4.4.7.9.9 1.4.2.4.4 1.1.4 2.2.1 1.2.1 1.6.1 4.8s0 3.6-.1 4.8c-.1 1.2-.2 1.8-.4 2.2-.2.6-.5 1-.9 1.4-.4.4-.9.7-1.4.9-.4.2-1.1.4-2.2.4-1.2.1-1.6.1-4.8.1s-3.6 0-4.8-.1c-1.2-.1-1.8-.2-2.2-.4-.6-.2-1-.5-1.4-.9-.4-.4-.7-.9-.9-1.4-.2-.4-.4-1.1-.4-2.2-.1-1.2-.1-1.6-.1-4.8s0-3.6.1-4.8c.1-1.2.2-1.8.4-2.2.2-.6.5-1 .9-1.4.4-.4.9-.7 1.4-.9.4-.2 1.1-.4 2.2-.4 1.2-.1 1.6-.1 4.8-.1M12 0C8.7 0 8.3 0 7.1.1 5.8.1 5 .3 4.2.6c-.8.3-1.5.7-2.2 1.4C1.3 2.7.9 3.4.6 4.2.3 5 .1 5.8.1 7.1 0 8.3 0 8.7 0 12s0 3.7.1 4.9c.1 1.3.3 2.1.6 2.9.3.8.7 1.5 1.4 2.2.7.7 1.4 1.1 2.2 1.4.8.3 1.6.5 2.9.6C8.3 24 8.7 24 12 24s3.7 0 4.9-.1c1.3-.1 2.1-.3 2.9-.6.8-.3 1.5-.7 2.2-1.4.7-.7 1.1-1.4 1.4-2.2.3-.8.5-1.6.6-2.9.1-1.2.1-1.6.1-4.9s0-3.7-.1-4.9c-.1-1.3-.3-2.1-.6-2.9-.3-.8-.7-1.5-1.4-2.2C21.3 1.3 20.6.9 19.8.6 19 .3 18.2.1 16.9.1 15.7 0 15.3 0 12 0zm0 5.8A6.2 6.2 0 1 0 12 18.2 6.2 6.2 0 0 0 12 5.8zm0 10.2a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.4-10.4a1.4 1.4 0 1 0 0-2.8 1.4 1.4 0 0 0 0 2.8z"/></svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
