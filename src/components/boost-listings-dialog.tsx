"use client";

import { useState } from "react";
import { useStore } from "@/lib/store";
import { useCurrency } from "@/lib/currency";
import {
  BOOST_PLANS,
  calculateBoostTotal,
  type BoostPlanId,
} from "@/lib/boost";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";
import { Rocket, Wallet } from "lucide-react";
import Link from "next/link";

type BoostListingsDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  listingIds: string[];
  onSuccess?: () => void;
};

export function BoostListingsDialog({
  open,
  onOpenChange,
  listingIds,
  onSuccess,
}: BoostListingsDialogProps) {
  const { currentUser, boostListings } = useStore();
  const { formatPrice } = useCurrency();
  const [planId, setPlanId] = useState<BoostPlanId>("7d");

  const total = calculateBoostTotal(listingIds.length, planId);
  const balance = currentUser?.walletBalance ?? 0;
  const canAfford = balance >= total;

  const handleBoost = () => {
    const result = boostListings(listingIds, planId);
    if (!result.ok) {
      toast.error(result.reason);
      return;
    }
    toast.success(
      listingIds.length === 1
        ? "Listing boosted!"
        : `${listingIds.length} listings boosted!`
    );
    onOpenChange(false);
    onSuccess?.();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Rocket className="h-5 w-5 text-maple" />
            Boost {listingIds.length} listing{listingIds.length !== 1 ? "s" : ""}
          </DialogTitle>
          <DialogDescription>
            Boosted listings appear at the top of browse results until the boost expires.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label className="text-sm font-medium">Boost duration</Label>
            <RadioGroup
              value={planId}
              onValueChange={(v) => setPlanId(v as BoostPlanId)}
              className="mt-2 space-y-2"
            >
              {BOOST_PLANS.map((plan) => (
                <label
                  key={plan.id}
                  htmlFor={`plan-${plan.id}`}
                  className={`flex cursor-pointer items-center justify-between rounded-xl border p-3 transition-colors ${
                    planId === plan.id
                      ? "border-maple bg-maple/5"
                      : "border-border hover:bg-muted/50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <RadioGroupItem value={plan.id} id={`plan-${plan.id}`} />
                    <div>
                      <p className="font-medium">{plan.label}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatPrice(plan.pricePerListing)} per listing
                      </p>
                    </div>
                  </div>
                  <span className="font-semibold text-primary">
                    {formatPrice(plan.pricePerListing * listingIds.length)}
                  </span>
                </label>
              ))}
            </RadioGroup>
          </div>

          <div className="rounded-xl border border-border bg-muted/30 p-4">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-sm text-muted-foreground">
                <Wallet className="h-4 w-4" />
                Wallet balance
              </span>
              <span className="font-semibold">{formatPrice(balance)}</span>
            </div>
            <div className="mt-2 flex items-center justify-between border-t border-border pt-2">
              <span className="font-medium">Total due</span>
              <span className="display text-xl text-primary">{formatPrice(total)}</span>
            </div>
          </div>

          {!canAfford && (
            <p className="text-sm text-destructive">
              Insufficient balance.{" "}
              <Link href="/dashboard/wallet" className="underline hover:no-underline">
                Add funds to your wallet
              </Link>
            </p>
          )}

          <Button
            className="w-full bg-maple text-tuft hover:bg-maple/90"
            disabled={!canAfford || listingIds.length === 0}
            onClick={handleBoost}
          >
            Pay {formatPrice(total)} & boost
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
