"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useStore, type Listing } from "@/lib/store";
import { useCurrency } from "@/lib/currency";
import { Button } from "@/components/ui/button";
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
import { ListingFormFields } from "@/components/my-listings-portal";
import { toast } from "sonner";
import { Eye, MousePointerClick, Pencil, Plus, Trash2, ExternalLink } from "lucide-react";

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

export function AdminUserListings({ sellerId }: { sellerId: string }) {
  const { listings, addListing, editListing, deleteListing } = useStore();
  const { formatPrice } = useCurrency();
  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Listing | null>(null);
  const [createForm, setCreateForm] = useState<ListingForm>(emptyForm);
  const [editForm, setEditForm] = useState<ListingForm>(emptyForm);

  const userListings = useMemo(
    () => listings.filter((l) => l.sellerId === sellerId),
    [listings, sellerId]
  );

  const stats = useMemo(
    () => ({
      total: userListings.length,
      live: userListings.filter((l) => !l.sold).length,
      sold: userListings.filter((l) => l.sold).length,
      views: userListings.reduce((a, l) => a + (l.views ?? 0), 0),
    }),
    [userListings]
  );

  const handleCreate = () => {
    if (!createForm.title || !createForm.price) {
      toast.error("Title and price are required.");
      return;
    }
    addListing({
      sellerId,
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
    toast.success("Listing created.");
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
    toast.success("Listing updated.");
  };

  return (
    <section>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="display text-2xl">Listings</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {stats.total} total · {stats.live} live · {stats.sold} sold · {stats.views} views
          </p>
        </div>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-full bg-maple text-tuft hover:bg-maple/90">
              <Plus className="mr-2 h-4 w-4" /> Add listing
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Create listing for user</DialogTitle>
            </DialogHeader>
            <ListingFormFields form={createForm} setForm={setCreateForm} />
            <Button className="mt-4 w-full bg-primary" onClick={handleCreate}>
              Create listing
            </Button>
          </DialogContent>
        </Dialog>
      </div>

      {userListings.length === 0 ? (
        <div className="mt-6 rounded-3xl border border-dashed border-border bg-background p-12 text-center shadow-card">
          <p className="text-muted-foreground">This user has no listings yet.</p>
          <Button className="mt-4 rounded-full bg-maple text-tuft hover:bg-maple/90" onClick={() => setCreateOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Add first listing
          </Button>
        </div>
      ) : (
        <div className="mt-6 overflow-hidden rounded-3xl bg-background shadow-card">
          <Table>
            <TableHeader>
              <TableRow>
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
              {userListings.map((l) => (
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
              ))}
            </TableBody>
          </Table>
        </div>
      )}

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
