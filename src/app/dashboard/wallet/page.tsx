"use client";

import { useMemo, useState } from "react";
import { useStore } from "@/lib/store";
import { useCurrency } from "@/lib/currency";
import { BOOST_PLANS } from "@/lib/boost";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { CreditCard, Rocket, Wallet } from "lucide-react";
import Link from "next/link";

const TOP_UP_AMOUNTS = [10, 25, 50, 100];

export default function SellerWalletPage() {
  const { currentUser, boostTransactions, listings, addWalletFunds } = useStore();
  const { formatPrice } = useCurrency();
  const [customAmount, setCustomAmount] = useState("");

  const myTransactions = useMemo(
    () =>
      boostTransactions
        .filter((t) => t.sellerId === currentUser?.id)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [boostTransactions, currentUser?.id]
  );

  if (!currentUser) return null;

  const balance = currentUser.walletBalance ?? 0;

  const handleTopUp = (amount: number) => {
    if (amount <= 0) {
      toast.error("Enter a valid amount.");
      return;
    }
    addWalletFunds(amount);
    toast.success(`${formatPrice(amount)} added to your wallet.`);
    setCustomAmount("");
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="display text-4xl">Wallet</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Add funds to boost your listings and increase visibility.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
        <div className="space-y-6">
          <div className="rounded-3xl border border-border bg-card p-6 shadow-card">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-maple/10">
                <Wallet className="h-6 w-6 text-maple" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Available balance</p>
                <p className="display text-4xl text-primary">{formatPrice(balance)}</p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-border bg-card p-6 shadow-card">
            <h2 className="font-semibold">Add funds</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Demo top-up — no real payment processed.
            </p>
            <div className="mt-4 grid grid-cols-2 gap-2">
              {TOP_UP_AMOUNTS.map((amt) => (
                <Button
                  key={amt}
                  variant="outline"
                  className="h-11"
                  onClick={() => handleTopUp(amt)}
                >
                  <CreditCard className="mr-2 h-4 w-4" />
                  {formatPrice(amt)}
                </Button>
              ))}
            </div>
            <div className="mt-4 flex gap-2">
              <div className="flex-1">
                <Label htmlFor="custom-amount" className="sr-only">
                  Custom amount
                </Label>
                <Input
                  id="custom-amount"
                  type="number"
                  min={1}
                  placeholder="Custom amount (USD)"
                  value={customAmount}
                  onChange={(e) => setCustomAmount(e.target.value)}
                />
              </div>
              <Button
                className="bg-maple text-tuft hover:bg-maple/90"
                onClick={() => handleTopUp(Number(customAmount))}
              >
                Add
              </Button>
            </div>
          </div>

          <div className="rounded-3xl border border-border bg-card p-6 shadow-card">
            <h2 className="font-semibold">Boost pricing</h2>
            <ul className="mt-3 space-y-2 text-sm">
              {BOOST_PLANS.map((plan) => (
                <li key={plan.id} className="flex justify-between">
                  <span>{plan.label}</span>
                  <span className="font-medium">{formatPrice(plan.pricePerListing)} / listing</span>
                </li>
              ))}
            </ul>
            <Button asChild className="mt-4 w-full bg-primary">
              <Link href="/dashboard/listings">
                <Rocket className="mr-2 h-4 w-4" />
                Go boost listings
              </Link>
            </Button>
          </div>
        </div>

        <div className="rounded-3xl border border-border bg-card shadow-card">
          <div className="border-b border-border px-6 py-4">
            <h2 className="font-semibold">Boost history</h2>
            <p className="text-sm text-muted-foreground">Payments for listing boosts</p>
          </div>
          {myTransactions.length === 0 ? (
            <p className="p-8 text-center text-sm text-muted-foreground">
              No boost purchases yet.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Listings</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {myTransactions.map((tx) => {
                  const plan = BOOST_PLANS.find((p) => p.id === tx.planId);
                  const titles = tx.listingIds
                    .map((id) => listings.find((l) => l.id === id)?.title)
                    .filter(Boolean)
                    .slice(0, 2);
                  return (
                    <TableRow key={tx.id}>
                      <TableCell className="text-sm">
                        {new Date(tx.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="max-w-[180px]">
                        <p className="truncate text-sm">
                          {titles.join(", ")}
                          {tx.listingIds.length > 2 && ` +${tx.listingIds.length - 2} more`}
                        </p>
                      </TableCell>
                      <TableCell className="text-sm">{plan?.label ?? tx.planId}</TableCell>
                      <TableCell className="text-right font-semibold text-primary">
                        {formatPrice(tx.amount)}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </div>
      </div>
    </div>
  );
}
