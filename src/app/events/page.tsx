"use client";

import Link from "next/link";
import { useStore } from "@/lib/store";
import { Calendar, MapPin } from "lucide-react";

export default function Events() {
  const { events, users } = useStore();
  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <h1 className="display text-5xl">Community events</h1>
      <p className="text-muted-foreground mt-2">IRL meetups, prereleases, and trade nights hosted by verified sellers.</p>

      <div className="mt-10 grid gap-6 md:grid-cols-2">
        {events.map((e) => {
          const host = users.find((u) => u.id === e.sellerId);
          return (
            <article key={e.id} className="group overflow-hidden rounded-2xl bg-card shadow-card transition-transform hover:-translate-y-1">
              <div className="aspect-[16/9] overflow-hidden bg-muted">
                <img src={e.cover} alt={e.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
              </div>
              <div className="p-6">
                <h2 className="display text-2xl">{e.title}</h2>
                <p className="mt-2 text-sm text-foreground/85">{e.description}</p>
                <div className="mt-4 flex flex-wrap gap-4 text-sm text-muted-foreground">
                  <span className="inline-flex items-center gap-1.5"><Calendar className="h-4 w-4" />{e.date}</span>
                  <span className="inline-flex items-center gap-1.5"><MapPin className="h-4 w-4" />{e.location}</span>
                </div>
                {host && (
                  <Link href={`/sellers/${host.id}`} className="mt-4 inline-block text-sm text-primary hover:underline">
                    Hosted by {host.name} →
                  </Link>
                )}
              </div>
            </article>
          );
        })}
        {events.length === 0 && <p className="text-muted-foreground">No events posted yet.</p>}
      </div>
    </div>
  );
}
