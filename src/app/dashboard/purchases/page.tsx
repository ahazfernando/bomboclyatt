"use client";

import Link from "next/link";
import { useStore } from "@/lib/store";
import { useCurrency } from "@/lib/currency";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

export default function DashboardPurchasesPage() {
  const { currentUser, listings, confirmPurchase } = useStore();
  const { formatPrice } = useCurrency();

  const myPurchases = listings.filter((l) => l.buyerId === currentUser?.id);

  return (
    <div>
      <h1 className="display text-4xl sm:text-5xl">Your purchases</h1>
      <p className="mt-2 text-muted-foreground">Track orders and earn points on confirmed pickups.</p>

      <div className="mt-8 space-y-3">
        {myPurchases.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-border bg-background p-12 text-center shadow-card">
            <p className="text-muted-foreground">No purchases yet.</p>
            <Button asChild className="mt-4 bg-maple text-tuft hover:bg-maple/90">
              <Link href="/browse">Start browsing</Link>
            </Button>
          </div>
        ) : (
          myPurchases.map((l) => (
            <div
              key={l.id}
              className="flex items-center gap-4 rounded-2xl border border-border bg-background p-4 shadow-card"
            >
              <img src={l.image} className="h-16 w-16 rounded-lg object-cover" alt="" />
              <div className="flex-1">
                <Link href={`/listing/${l.id}`} className="font-semibold hover:text-primary">
                  {l.title}
                </Link>
                <p className="text-xs text-muted-foreground">{formatPrice(l.price)}</p>
              </div>
              <Button
                size="sm"
                className="bg-maple text-tuft hover:bg-maple/90"
                onClick={() => {
                  confirmPurchase(l.id);
                  toast.success("+10 points added!");
                }}
              >
                <CheckCircle2 className="mr-2 h-4 w-4" /> Confirm & earn points
              </Button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
