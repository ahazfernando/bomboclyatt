"use client";

import Link from "next/link";
import { useState } from "react";
import { AdminPageHeader } from "@/components/admin-shell";
import { ChevronDown, LifeBuoy, MessageCircle, Mail } from "lucide-react";

const faqs = [
  {
    q: "How are seller points calculated?",
    a: "Buyers earn 10 points per confirmed purchase. Sellers earn reputation via 5-star ratings after each successful sale.",
  },
  {
    q: "Why does Buy Now redirect to WhatsApp?",
    a: "Emberdex is a directory — payments and shipping details are negotiated directly between buyer and seller through WhatsApp.",
  },
  {
    q: "How do I moderate a listing?",
    a: "Open the Reports page, find the listing in the table, and use the status column to mark it as sold or remove it.",
  },
  {
    q: "Can I host multiple giveaways at once?",
    a: "Yes. Sellers with an admin-approved profile can run any number of concurrent giveaways from their Dashboard.",
  },
];

export default function Help() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div>
      <AdminPageHeader title="Help Center" subtitle="Guides, FAQs and direct support" />

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { icon: LifeBuoy, title: "Documentation", body: "Product tours and setup guides." },
          { icon: MessageCircle, title: "Live chat", body: "Chat with the Emberdex team." },
          { icon: Mail, title: "Email support", body: "support@emberdex.com" },
        ].map((c) => (
          <div key={c.title} className="rounded-3xl bg-background p-5 shadow-card">
            <div className="grid h-10 w-10 place-items-center rounded-full bg-gradient-hero text-primary-foreground shadow-glow">
              <c.icon className="h-5 w-5" />
            </div>
            <div className="mt-3 font-semibold">{c.title}</div>
            <div className="text-sm text-muted-foreground">{c.body}</div>
          </div>
        ))}
      </div>

      <div className="mt-6 rounded-3xl bg-background p-2 shadow-card">
        {faqs.map((f, i) => (
          <div key={i} className="border-b border-border/60 last:border-0">
            <button
              onClick={() => setOpen(open === i ? null : i)}
              className="flex w-full items-center justify-between p-4 text-left"
            >
              <span className="font-medium">{f.q}</span>
              <ChevronDown className={`h-4 w-4 transition ${open === i ? "rotate-180" : ""}`} />
            </button>
            {open === i && <div className="px-4 pb-4 text-sm text-muted-foreground">{f.a}</div>}
          </div>
        ))}
      </div>

      <div className="mt-6 rounded-3xl bg-gradient-hero p-6 text-primary-foreground shadow-glow">
        <div className="display text-3xl">Still stuck?</div>
        <p className="mt-1 opacity-90">Reach the team from any listing or seller profile.</p>
        <Link href="/browse" className="mt-4 inline-flex rounded-full bg-primary-foreground/15 px-5 py-2.5 text-sm font-semibold backdrop-blur hover:bg-primary-foreground/25">
          Browse the marketplace
        </Link>
      </div>
    </div>
  );
}
