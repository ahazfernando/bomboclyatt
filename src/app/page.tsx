"use client";

import Link from "next/link";
import { CategoryBrowse } from "@/components/category-browse";
import { Button } from "@/components/ui/button";
import { Flame, Trophy, MessageCircle, ShieldCheck } from "lucide-react";

export default function Index() {
  return (
    <div>
      {/* Hero */}
      <section className="px-3 pt-3 md:px-4 md:pt-4">
        <div className="relative overflow-hidden rounded-[2rem] md:rounded-[2.75rem] lg:rounded-[3.25rem]">
          <img
            src="/home/be4e5454159b1182ad3340a8b5bbfb86.jpg"
            alt=""
            className="absolute inset-0 h-full w-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-black/35" aria-hidden="true" />
          <div className="page-shell relative flex min-h-[70vh] items-end py-10 md:min-h-[78vh] md:py-12 lg:py-14">
            <div className="max-w-xl text-primary-foreground">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-medium backdrop-blur">
                <Flame className="h-3.5 w-3.5" /> New drops every day
              </div>
              <h1 className="display mt-6 text-5xl leading-[0.95] md:text-7xl">
                Trade the marketplace<br />like a champion.
              </h1>
              <p className="mt-6 max-w-md text-lg text-primary-foreground/90">
                Collectibles marketplace: buy from trusted sellers, close on WhatsApp, earn points on pickup.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button asChild size="lg" className="bg-background text-foreground hover:bg-background/90">
                  <Link href="/browse">Go to Marketplace</Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="border-white/40 bg-transparent text-primary-foreground hover:bg-white/10">
                  <Link href="/auth?mode=register">Become a seller</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <CategoryBrowse />

      {/* Feature strip */}
      <section className="page-shell py-16">
        <div className="grid gap-6 md:grid-cols-3">
          {[
            { icon: MessageCircle, title: "Close on WhatsApp", desc: "Buy Now pings the seller directly with your listing details." },
            { icon: Trophy, title: "Earn points every pickup", desc: "Confirm delivery to earn 10 points toward exclusive drops." },
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
    </div>
  );
}
