"use client";

import Link from "next/link";
import { useStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Gift, Users, Trophy } from "lucide-react";
import { toast } from "sonner";

export default function Giveaways() {
  const { giveaways, users, currentUser, currentAdmin, enterGiveaway, drawGiveaway } = useStore();

  return (
    <div className="page-shell py-12">
      <h1 className="display text-5xl">Live giveaways</h1>
      <p className="text-muted-foreground mt-2">Free to enter. Sellers draw winners live — good luck.</p>

      <div className="mt-10 grid gap-6 md:grid-cols-2">
        {giveaways.map((g) => {
          const host = users.find((u) => u.id === g.sellerId);
          const winner = g.winnerId ? users.find((u) => u.id === g.winnerId) : null;
          const entered = currentUser ? g.entrants.includes(currentUser.id) : false;
          const isHost = currentUser?.id === g.sellerId || !!currentAdmin;
          return (
            <article key={g.id} className="overflow-hidden rounded-2xl bg-card shadow-card">
              <div className="relative aspect-[16/9] overflow-hidden bg-muted">
                <img src={g.cover} alt={g.prize} className="h-full w-full object-cover" />
                <Badge className="absolute top-3 left-3 bg-maple text-tuft border-0">
                  <Gift className="mr-1 h-3 w-3" /> Ends {g.endsAt}
                </Badge>
              </div>
              <div className="p-6">
                <h2 className="display text-2xl">{g.prize}</h2>
                <p className="mt-2 text-sm text-foreground/85">{g.description}</p>
                <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="inline-flex items-center gap-1.5"><Users className="h-4 w-4" />{g.entrants.length} entrants</span>
                  {host && <Link href={`/sellers/${host.id}`} className="text-primary hover:underline">by {host.name}</Link>}
                </div>

                {winner ? (
                  <div className="mt-5 rounded-lg bg-gradient-sun p-4 text-maple">
                    <div className="inline-flex items-center gap-2 font-semibold"><Trophy className="h-5 w-5" /> Winner: {winner.name}</div>
                  </div>
                ) : (
                  <div className="mt-5 flex gap-2">
                    <Button
                      disabled={!currentUser || entered}
                      onClick={() => { enterGiveaway(g.id); toast.success("You're in!"); }}
                      className="bg-primary flex-1"
                    >
                      {entered ? "Entered ✓" : currentUser ? "Enter giveaway" : "Sign in to enter"}
                    </Button>
                    {isHost && (
                      <Button variant="outline" onClick={() => { drawGiveaway(g.id); toast.success("Winner drawn!"); }}>
                        Draw winner
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </article>
          );
        })}
        {giveaways.length === 0 && <p className="text-muted-foreground">No giveaways live right now.</p>}
      </div>
    </div>
  );
}
