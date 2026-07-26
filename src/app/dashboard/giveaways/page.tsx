"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus } from "lucide-react";
import { toast } from "sonner";

export default function DashboardGiveawaysPage() {
  const router = useRouter();
  const { currentUser, giveaways, addGiveaway } = useStore();
  const [prize, setPrize] = useState("");
  const [desc, setDesc] = useState("");
  const [ends, setEnds] = useState("");
  const [cover, setCover] = useState("");

  useEffect(() => {
    if (currentUser && currentUser.role !== "seller") router.push("/dashboard");
  }, [currentUser, router]);

  const myGiveaways = giveaways.filter((g) => g.sellerId === currentUser?.id);

  if (!currentUser || currentUser.role !== "seller") return null;

  return (
    <div>
      <h1 className="display text-4xl sm:text-5xl">Giveaways</h1>
      <p className="mt-2 text-muted-foreground">Run weekly drops for your community.</p>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-primary" /> New giveaway
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Input placeholder="Prize" value={prize} onChange={(e) => setPrize(e.target.value)} />
            <Textarea placeholder="Description" value={desc} onChange={(e) => setDesc(e.target.value)} />
            <Input type="date" value={ends} onChange={(e) => setEnds(e.target.value)} />
            <Input placeholder="Cover image URL" value={cover} onChange={(e) => setCover(e.target.value)} />
            <Button
              className="w-full bg-maple text-tuft hover:bg-maple/90"
              onClick={() => {
                if (!prize || !ends) {
                  toast.error("Prize and end date required.");
                  return;
                }
                addGiveaway({
                  prize,
                  description: desc,
                  endsAt: ends,
                  cover:
                    cover ||
                    "https://images.unsplash.com/photo-1613771404721-1f92d799e49f?auto=format&fit=crop&w=800&q=80",
                });
                setPrize("");
                setDesc("");
                setEnds("");
                setCover("");
                toast.success("Giveaway live!");
              }}
            >
              Launch giveaway
            </Button>
          </CardContent>
        </Card>

        <div className="space-y-3">
          {myGiveaways.map((g) => (
            <div key={g.id} className="rounded-2xl bg-background p-4 shadow-card">
              <div className="font-semibold">{g.prize}</div>
              <div className="text-xs text-muted-foreground">Ends {g.endsAt} · {g.entrants.length} entrants</div>
              <p className="mt-2 text-sm text-muted-foreground">{g.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
