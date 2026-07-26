"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useStore, type Listing } from "@/lib/store";
import { useCurrency } from "@/lib/currency";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { Eye, MousePointerClick, Pencil, Plus, Trash2, ExternalLink, Rocket } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { BoostListingsDialog } from "@/components/boost-listings-dialog";
import { isListingBoosted, getBoostTimeRemaining } from "@/lib/boost";

const categories = ["Sealed Product", "Single Hits", "Accessories", "Slabs", "Comics", "Diecast"] as const;
const conditions = ["Mint", "Near Mint", "Lightly Played", "Played"] as const;

type ListingForm = {
  title: string;
  set: string;
  price: number;
  image: string;
  description: string;
  category: (typeof categories)[number];
  condition: (typeof conditions)[number];
};

const emptyForm: ListingForm = {
  title: "",
  set: "",
  price: 0,
  image: "",
  description: "",
  category: "Single Hits",
  condition: "Near Mint",
};

export function ListingFormFields({
  form,
  setForm,
}: {
  form: ListingForm;
  setForm: (f: ListingForm) => void;
}) {
  return (
    <div className="space-y-4">
      <div>
        <Label>Title</Label>
        <Input
          className="mt-1"
          placeholder="Card title"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Set / year</Label>
          <Input
            className="mt-1"
            placeholder="Base Set 1999"
            value={form.set}
            onChange={(e) => setForm({ ...form, set: e.target.value })}
          />
        </div>
        <div>
          <Label>Price (USD)</Label>
          <Input
            className="mt-1"
            type="number"
            placeholder="0"
            value={form.price || ""}
            onChange={(e) => setForm({ ...form, price: +e.target.value })}
          />
        </div>
      </div>
      <div>
        <Label>Image URL</Label>
        <Input
          className="mt-1"
          placeholder="https://..."
          value={form.image}
          onChange={(e) => setForm({ ...form, image: e.target.value })}
        />
      </div>
      <div>
        <Label>Description</Label>
        <Textarea
          className="mt-1"
          placeholder="Describe your item..."
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Category</Label>
          <select
            className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value as ListingForm["category"] })}
          >
            {categories.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </div>
        <div>
          <Label>Condition</Label>
          <select
            className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            value={form.condition}
            onChange={(e) => setForm({ ...form, condition: e.target.value as ListingForm["condition"] })}
          >
            {conditions.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}

function listingToForm(l: Listing): ListingForm {
  return {
    title: l.title,
    set: l.set,
    price: l.price,
    image: l.image,
    description: l.description,
    category: l.category,
    condition: l.condition,
  };
}

export function MyListingsPortal() {
  const { currentUser, listings, addListing, editListing, deleteListing } = useStore();
  const { formatPrice } = useCurrency();
  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Listing | null>(null);
  const [createForm, setCreateForm] = useState<ListingForm>(emptyForm);
  const [editForm, setEditForm] = useState<ListingForm>(emptyForm);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [boostOpen, setBoostOpen] = useState(false);
  const [boostListingIds, setBoostListingIds] = useState<string[]>([]);

  const myListings = useMemo(
    () => listings.filter((l) => l.sellerId === currentUser?.id),
    [listings, currentUser?.id]
  );

  const stats = useMemo(
    () => ({
      total: myListings.length,
      live: myListings.filter((l) => !l.sold).length,
      views: myListings.reduce((a, l) => a + (l.views ?? 0), 0),
      clicks: myListings.reduce((a, l) => a + (l.clicks ?? 0), 0),
    }),
    [myListings]
  );

  const defaultImage =
    "https://images.unsplash.com/photo-1613771404784-3a5686aa7b8f?auto=format&fit=crop&w=800&q=80";

  const handleCreate = () => {
    if (!currentUser || !createForm.title || !createForm.price) {
      toast.error("Title and price are required.");
      return;
    }
    addListing({
      sellerId: currentUser.id,
      title: createForm.title,
      set: createForm.set,
      price: createForm.price,
      image: createForm.image || defaultImage,
      description: createForm.description,
      category: createForm.category,
      condition: createForm.condition,
    });
    setCreateForm(emptyForm);
    setCreateOpen(false);
    toast.success("Listing published!");
  };

  const handleEdit = () => {
    if (!editTarget || !editForm.title || !editForm.price) {
      toast.error("Title and price are required.");
      return;
    }
    editListing(editTarget.id, {
      title: editForm.title,
      set: editForm.set,
      price: editForm.price,
      image: editForm.image || defaultImage,
      description: editForm.description,
      category: editForm.category,
      condition: editForm.condition,
    });
    setEditTarget(null);
    toast.success("Listing updated!");
  };

  const handleDelete = (id: string) => {
    deleteListing(id);
    setSelected((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
    toast.success("Listing deleted.");
  };

  const liveListings = myListings.filter((l) => !l.sold);
  const selectedLive = [...selected].filter((id) => liveListings.some((l) => l.id === id));

  const openBoost = (ids: string[]) => {
    setBoostListingIds(ids);
    setBoostOpen(true);
  };

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedLive.length === liveListings.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(liveListings.map((l) => l.id)));
    }
  };

  return (
    <section className="mt-12">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="display text-3xl">My listings portal</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            List products, track performance, and manage your inventory.
          </p>
        </div>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button className="bg-maple text-tuft hover:bg-maple/90">
              <Plus className="mr-2 h-4 w-4" /> New listing
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Create listing</DialogTitle>
            </DialogHeader>
            <ListingFormFields form={createForm} setForm={setCreateForm} />
            <Button className="mt-4 w-full bg-primary" onClick={handleCreate}>
              Publish listing
            </Button>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Total listings", value: stats.total, icon: null },
          { label: "Live listings", value: stats.live, icon: null },
          { label: "Total views", value: stats.views, icon: Eye },
          { label: "Total clicks", value: stats.clicks, icon: MousePointerClick },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl border border-border bg-card p-5 shadow-card">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">{s.label}</p>
              {s.icon && <s.icon className="h-4 w-4 text-muted-foreground" />}
            </div>
            <p className="display mt-2 text-3xl text-primary">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      {myListings.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-border bg-card/50 p-12 text-center">
          <p className="text-muted-foreground">You haven&apos;t listed anything yet.</p>
          <Button className="mt-4 bg-maple text-tuft hover:bg-maple/90" onClick={() => setCreateOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> List your first product
          </Button>
        </div>
      ) : (
        <div className="mt-8 space-y-3">
          {selectedLive.length > 0 && (
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-maple/30 bg-maple/5 px-4 py-3">
              <p className="text-sm font-medium">
                {selectedLive.length} listing{selectedLive.length !== 1 ? "s" : ""} selected
              </p>
              <Button
                className="bg-maple text-tuft hover:bg-maple/90"
                onClick={() => openBoost(selectedLive)}
              >
                <Rocket className="mr-2 h-4 w-4" />
                Boost selected
              </Button>
            </div>
          )}
          <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10">
                  <Checkbox
                    checked={liveListings.length > 0 && selectedLive.length === liveListings.length}
                    onCheckedChange={toggleSelectAll}
                    aria-label="Select all live listings"
                  />
                </TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Price</TableHead>
                <TableHead className="text-center">
                  <span className="inline-flex items-center gap-1">
                    <Eye className="h-3.5 w-3.5" /> Views
                  </span>
                </TableHead>
                <TableHead className="text-center">
                  <span className="inline-flex items-center gap-1">
                    <MousePointerClick className="h-3.5 w-3.5" /> Clicks
                  </span>
                </TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {myListings.map((l) => (
                <TableRow key={l.id}>
                  <TableCell>
                    {!l.sold ? (
                      <Checkbox
                        checked={selected.has(l.id)}
                        onCheckedChange={() => toggleSelect(l.id)}
                        aria-label={`Select ${l.title}`}
                      />
                    ) : null}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <img src={l.image} alt="" className="h-12 w-12 rounded-lg object-cover" />
                      <div>
                        <p className="font-medium line-clamp-1">{l.title}</p>
                        <p className="text-xs text-muted-foreground">{l.category} · {l.condition}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="font-semibold text-primary">{formatPrice(l.price)}</TableCell>
                  <TableCell className="text-center">{l.views ?? 0}</TableCell>
                  <TableCell className="text-center">{l.clicks ?? 0}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap items-center gap-2">
                      {l.sold ? (
                        <Badge className="bg-destructive text-destructive-foreground">Sold</Badge>
                      ) : (
                        <Badge variant="outline" className="border-primary/30 text-primary">Live</Badge>
                      )}
                      {isListingBoosted(l) && (
                        <Badge className="bg-maple text-tuft">
                          <Rocket className="mr-1 h-3 w-3" />
                          Boosted · {getBoostTimeRemaining(l)}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      {!l.sold && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openBoost([l.id])}
                          aria-label="Boost listing"
                        >
                          <Rocket className="h-4 w-4 text-maple" />
                        </Button>
                      )}
                      <Button variant="ghost" size="icon" asChild>
                        <Link href={`/listing/${l.id}`} aria-label="View listing">
                          <ExternalLink className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setEditTarget(l);
                          setEditForm(listingToForm(l));
                        }}
                        aria-label="Edit listing"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" aria-label="Delete listing">
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete listing?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will permanently remove &ldquo;{l.title}&rdquo; from the marketplace.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              onClick={() => handleDelete(l.id)}
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          </div>
        </div>
      )}

      <BoostListingsDialog
        open={boostOpen}
        onOpenChange={setBoostOpen}
        listingIds={boostListingIds}
        onSuccess={() => setSelected(new Set())}
      />

      {/* Edit dialog */}
      <Dialog open={!!editTarget} onOpenChange={(open) => !open && setEditTarget(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit listing</DialogTitle>
          </DialogHeader>
          <ListingFormFields form={editForm} setForm={setEditForm} />
          <Button className="mt-4 w-full bg-primary" onClick={handleEdit}>
            Save changes
          </Button>
        </DialogContent>
      </Dialog>
    </section>
  );
}
