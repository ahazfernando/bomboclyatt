"use client";

import Link from "next/link";
import { useStore } from "@/lib/store";
import { CategoryBrowse } from "@/components/category-browse";
import { Button } from "@/components/ui/button";
import { Flame, Trophy, MessageCircle, ShieldCheck } from "lucide-react";

export default function Index() {
  const { events, giveaways } = useStore();

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <img
          src="/home/tempImage0xcRkb.heic_2K_202607190758.jpeg"
          alt=""
          className="absolute inset-0 h-full w-full object-cover object-center"
        />
        <div className="relative mx-auto max-w-7xl px-6 py-24 md:py-32 lg:py-40">
          <div className="max-w-xl text-primary-foreground">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-medium backdrop-blur">
              <Flame className="h-3.5 w-3.5" /> New drops every day
            </div>
            <h1 className="display mt-6 text-5xl leading-[0.95] md:text-7xl">
              Trade cards<br />like a champion.
            </h1>
            <p className="mt-6 max-w-md text-lg text-primary-foreground/90">
              A community-first marketplace for Pokémon cards and collectibles. Buy from trusted sellers, close deals on WhatsApp, and earn points on every confirmed pickup.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg" className="bg-background text-foreground hover:bg-background/90">
                <Link href="/browse">Browse categories</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-white/40 bg-transparent text-primary-foreground hover:bg-white/10">
                <Link href="/auth?mode=register">Become a seller</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <CategoryBrowse />

      {/* Feature strip */}
      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid gap-6 md:grid-cols-3">
          {[
            { icon: MessageCircle, title: "Close on WhatsApp", desc: "Buy Now pings the seller directly with your listing details." },
            { icon: Trophy, title: "Earn points every pickup", desc: "Confirm delivery to earn 10 points toward drops and giveaways." },
            { icon: ShieldCheck, title: "Two-way reputation", desc: "Buyers rate sellers. Sellers rate buyers. Reviews on every product." },
          ].map((f) => (
            <div key={f.title} className="rounded-2xl border border-border bg-card p-6 shadow-card">
              <div className="grid h-11 w-11 place-items-center rounded-lg bg-gradient-sun text-primary-foreground">
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 font-semibold text-lg">{f.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Events + giveaways teaser */}
      <section className="mx-auto max-w-7xl px-6 py-16 grid gap-6 md:grid-cols-2">
        <Link href="/events" className="group relative overflow-hidden rounded-2xl bg-gradient-sun p-8 shadow-card min-h-56 flex flex-col justify-between">
          <div>
            <div className="text-xs font-semibold uppercase tracking-widest text-maple/70">Events</div>
            <h3 className="display text-3xl text-maple mt-2">Meet the collectors IRL</h3>
          </div>
          <div className="text-maple font-medium">{events.length} upcoming →</div>
        </Link>
        <Link href="/giveaways" className="group relative overflow-hidden rounded-2xl bg-maple p-8 shadow-card min-h-56 flex flex-col justify-between">
          <div>
            <div className="text-xs font-semibold uppercase tracking-widest text-koromiko">Giveaways</div>
            <h3 className="display text-3xl text-tuft mt-2">Free packs, weekly drops</h3>
          </div>
          <div className="text-koromiko font-medium">{giveaways.length} live now →</div>
        </Link>
      </section>
    </div>
  );
}
