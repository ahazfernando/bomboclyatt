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
import { ListingFormFields, type ListingForm } from "@/components/my-listings-portal";
import { toast } from "sonner";
import {
  Check,
  Eye,
  ExternalLink,
  MousePointerClick,
  Pencil,
  Search,
  Star,
  Trash2,
  Rocket,
  X,
} from "lucide-react";
import { isListingBoosted, getBoostTimeRemaining } from "@/lib/boost";
import {
  DEFAULT_LISTING_IMAGE,
  approvalLabel,
  listingImages,
  listingPrimaryImage,
  normalizeListingImages,
} from "@/lib/listing-media";

function listingToForm(l: Listing): ListingForm {
  return {
    title: l.title,
    set: l.set,
    price: l.price,
    images: listingImages(l),
    description: l.description,
    category: l.category,
    condition: l.condition,
    location: l.location || "colombo",
    featured: l.featured ?? false,
  };
}

export default function AdminListings() {
  const { listings, users, editListing, deleteListing } = useStore();
  const { formatPrice } = useCurrency();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<"all" | "pending" | "live" | "sold" | "rejected">("all");
  const [editTarget, setEditTarget] = useState<Listing | null>(null);
  const [editForm, setEditForm] = useState<ListingForm | null>(null);

  const filtered = useMemo(() => {
    return listings.filter((l) => {
      if (status === "pending" && (l.sold || l.approvalStatus !== "pending")) return false;
      if (status === "live" && (l.sold || l.approvalStatus !== "approved")) return false;
      if (status === "sold" && !l.sold) return false;
      if (status === "rejected" && (l.sold || l.approvalStatus !== "rejected")) return false;
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

  const pendingCount = listings.filter((l) => !l.sold && l.approvalStatus === "pending").length;

  const openEdit = (l: Listing) => {
    setEditTarget(l);
    setEditForm(listingToForm(l));
  };

  const handleEdit = () => {
    if (!editTarget || !editForm?.title || !editForm.price) {
      toast.error("Title and price are required.");
      return;
    }
    const images = normalizeListingImages(editForm.images, DEFAULT_LISTING_IMAGE);
    editListing(editTarget.id, {
      title: editForm.title,
      set: editForm.set,
      price: editForm.price,
      images,
      image: images[0],
      description: editForm.description,
      category: editForm.category,
      condition: editForm.condition,
      location: editForm.location,
      featured: editForm.featured,
    });
    setEditTarget(null);
    toast.success("Listing updated.");
  };

  const approve = (l: Listing) => {
    editListing(l.id, { approvalStatus: "approved" });
    toast.success(`Approved “${l.title}”.`);
  };

  const reject = (l: Listing) => {
    editListing(l.id, { approvalStatus: "rejected", featured: false });
    toast.success(`Rejected “${l.title}”.`);
  };

  const toggleFeatured = (l: Listing) => {
    editListing(l.id, { featured: !l.featured });
    toast.success(l.featured ? "Removed featured." : "Marked as featured.");
  };

  return (
    <div>
      <AdminPageHeader
        title="Listings"
        subtitle={`${filtered.length} of ${listings.length} marketplace items${pendingCount ? ` · ${pendingCount} pending` : ""}`}
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
        <div className="flex flex-wrap items-center gap-1 rounded-full bg-background p-1 text-xs shadow-card">
          {(["all", "pending", "live", "rejected", "sold"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatus(s)}
              className={`rounded-full px-4 py-2 font-medium capitalize transition ${
                status === s ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {s}
              {s === "pending" && pendingCount > 0 ? ` (${pendingCount})` : ""}
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
              <TableHead>Boost</TableHead>
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
                      <img src={listingPrimaryImage(l)} alt="" className="h-12 w-12 rounded-lg object-cover" />
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
                    <div className="flex flex-wrap items-center gap-2">
                      {l.sold ? (
                        <Badge className="bg-destructive text-destructive-foreground">Sold</Badge>
                      ) : l.approvalStatus === "approved" ? (
                        <Badge variant="outline" className="border-primary/30 text-primary">Live</Badge>
                      ) : (
                        <Badge variant="outline" className="border-border text-muted-foreground">
                          {approvalLabel(l.approvalStatus)}
                        </Badge>
                      )}
                      {l.featured && (
                        <Badge className="bg-maple text-tuft">
                          <Star className="mr-1 h-3 w-3" />
                          Featured
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {isListingBoosted(l) ? (
                      <Badge className="bg-maple text-tuft">
                        <Rocket className="mr-1 h-3 w-3" />
                        {getBoostTimeRemaining(l)}
                      </Badge>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      {!l.sold && l.approvalStatus === "pending" && (
                        <>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => approve(l)}
                            aria-label="Approve listing"
                            title="Approve"
                          >
                            <Check className="h-4 w-4 text-primary" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => reject(l)}
                            aria-label="Reject listing"
                            title="Reject"
                          >
                            <X className="h-4 w-4 text-destructive" />
                          </Button>
                        </>
                      )}
                      {!l.sold && l.approvalStatus === "rejected" && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => approve(l)}
                          aria-label="Approve listing"
                          title="Approve"
                        >
                          <Check className="h-4 w-4 text-primary" />
                        </Button>
                      )}
                      {!l.sold && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => toggleFeatured(l)}
                          aria-label="Toggle featured"
                          title="Toggle featured"
                        >
                          <Star className={`h-4 w-4 ${l.featured ? "fill-maple text-maple" : "text-muted-foreground"}`} />
                        </Button>
                      )}
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
