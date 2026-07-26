"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useStore, type Listing } from "@/lib/store";
import { useCurrency } from "@/lib/currency";
import { AdminPageHeader } from "@/components/admin-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
import { ListingFormFields } from "@/components/my-listings-portal";
import { toast } from "sonner";
import { Eye, ExternalLink, MousePointerClick, Pencil, Search, Trash2 } from "lucide-react";

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

const defaultImage =
  "https://images.unsplash.com/photo-1613771404784-3a5686aa7b8f?auto=format&fit=crop&w=800&q=80";

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

export default function AdminListings() {
  const { listings, users, editListing, deleteListing } = useStore();
  const { formatPrice } = useCurrency();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<"all" | "live" | "sold">("all");
  const [editTarget, setEditTarget] = useState<Listing | null>(null);
  const [editForm, setEditForm] = useState<ListingForm | null>(null);

  const filtered = useMemo(() => {
    return listings.filter((l) => {
      if (status === "live" && l.sold) return false;
      if (status === "sold" && !l.sold) return false;
      if (!q) return true;
      const needle = q.toLowerCase();
      const seller = users.find((u) => u.id === l.sellerId);
      return (
        l.title.toLowerCase().includes(needle) ||
        seller?.name.toLowerCase().includes(needle) ||
        seller?.email.toLowerCase().includes(needle)
      );
    });
  }, [listings, users, q, status]);

  const openEdit = (l: Listing) => {
    setEditTarget(l);
    setEditForm(listingToForm(l));
  };

  const handleEdit = () => {
    if (!editTarget || !editForm?.title || !editForm.price) {
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
    toast.success("Listing updated.");
  };

  return (
    <div>
      <AdminPageHeader
        title="Listings"
        subtitle={`${filtered.length} of ${listings.length} marketplace items`}
      />

      <div className="mb-4 flex flex-wrap gap-3">
        <div className="flex flex-1 items-center gap-2 rounded-full bg-background px-4 py-2.5 shadow-card">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by title or seller…"
            className="w-full bg-transparent text-sm outline-none"
          />
        </div>
        <div className="flex items-center gap-1 rounded-full bg-background p-1 text-xs shadow-card">
          {(["all", "live", "sold"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatus(s)}
              className={`rounded-full px-4 py-2 font-medium capitalize transition ${
                status === s ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-hidden rounded-3xl bg-background shadow-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>Seller</TableHead>
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
            {filtered.map((l) => {
              const seller = users.find((u) => u.id === l.sellerId);
              return (
                <TableRow key={l.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <img src={l.image} alt="" className="h-12 w-12 rounded-lg object-cover" />
                      <div>
                        <p className="font-medium line-clamp-1">{l.title}</p>
                        <p className="text-xs text-muted-foreground">{l.category} · {l.condition}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {seller ? (
                      <Link href={`/admin/users/${seller.id}`} className="font-medium hover:text-primary">
                        {seller.name}
                      </Link>
                    ) : (
                      "—"
                    )}
                  </TableCell>
                  <TableCell className="font-semibold text-primary">{formatPrice(l.price)}</TableCell>
                  <TableCell className="text-center">{l.views ?? 0}</TableCell>
                  <TableCell className="text-center">{l.clicks ?? 0}</TableCell>
                  <TableCell>
                    {l.sold ? (
                      <Badge className="bg-destructive text-destructive-foreground">Sold</Badge>
                    ) : (
                      <Badge variant="outline" className="border-primary/30 text-primary">Live</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon" asChild>
                        <Link href={`/listing/${l.id}`} aria-label="View listing">
                          <ExternalLink className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => openEdit(l)} aria-label="Edit listing">
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
                              onClick={() => {
                                deleteListing(l.id);
                                toast.success("Listing deleted.");
                              }}
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!editTarget} onOpenChange={(open) => !open && setEditTarget(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit listing</DialogTitle>
          </DialogHeader>
          {editForm && <ListingFormFields form={editForm} setForm={setEditForm} />}
          <Button className="mt-4 w-full bg-primary" onClick={handleEdit}>
            Save changes
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
