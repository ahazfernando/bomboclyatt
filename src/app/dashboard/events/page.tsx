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

export default function DashboardEventsPage() {
  const router = useRouter();
  const { currentUser, events, addEvent } = useStore();
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [date, setDate] = useState("");
  const [loc, setLoc] = useState("");
  const [cover, setCover] = useState("");

  useEffect(() => {
    if (currentUser && currentUser.role !== "seller") router.push("/dashboard");
  }, [currentUser, router]);

  const myEvents = events.filter((e) => e.sellerId === currentUser?.id);

  if (!currentUser || currentUser.role !== "seller") return null;

  return (
    <div>
      <h1 className="display text-4xl sm:text-5xl">Events</h1>
      <p className="mt-2 text-muted-foreground">Host meetups and IRL collector events.</p>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-primary" /> New event
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
            <Textarea placeholder="Description" value={desc} onChange={(e) => setDesc(e.target.value)} />
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            <Input placeholder="Location" value={loc} onChange={(e) => setLoc(e.target.value)} />
            <Input placeholder="Cover image URL" value={cover} onChange={(e) => setCover(e.target.value)} />
            <Button
              className="w-full bg-maple text-tuft hover:bg-maple/90"
              onClick={() => {
                if (!title || !date) {
                  toast.error("Title and date required.");
                  return;
                }
                addEvent({
                  title,
                  description: desc,
                  date,
                  location: loc,
                  cover:
                    cover ||
                    "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=800&q=80",
                });
                setTitle("");
                setDesc("");
                setDate("");
                setLoc("");
                setCover("");
                toast.success("Event posted.");
              }}
            >
              Post event
            </Button>
          </CardContent>
        </Card>

        <div className="space-y-3">
          {myEvents.map((e) => (
            <div key={e.id} className="rounded-2xl bg-background p-4 shadow-card">
              <div className="font-semibold">{e.title}</div>
              <div className="text-xs text-muted-foreground">{e.date} · {e.location}</div>
              <p className="mt-2 text-sm text-muted-foreground">{e.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
