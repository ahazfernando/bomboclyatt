"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useStore, avgRating, type User, type UserRole } from "@/lib/store";
import { AdminUserListings } from "@/components/admin-user-listings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { toast } from "sonner";
import { ArrowLeft, Pencil, Star, Trash2 } from "lucide-react";

type UserForm = {
  name: string;
  email: string;
  role: UserRole;
  whatsapp: string;
  bio: string;
  points: number;
};

function userToForm(u: User): UserForm {
  return {
    name: u.name,
    email: u.email,
    role: u.role,
    whatsapp: u.whatsapp ?? "",
    bio: u.bio ?? "",
    points: u.points,
  };
}

export default function AdminUserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { users, listings, adminUpdateUser, adminDeleteUser } = useStore();
  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState<UserForm | null>(null);

  const user = users.find((u) => u.id === id);

  const userListings = useMemo(
    () => listings.filter((l) => l.sellerId === id),
    [listings, id]
  );

  if (!user) {
    return (
      <div className="rounded-3xl bg-background p-12 text-center shadow-card">
        <p className="text-muted-foreground">User not found.</p>
        <Button asChild className="mt-4 rounded-full" variant="outline">
          <Link href="/admin/users">Back to users</Link>
        </Button>
      </div>
    );
  }

  const rating = avgRating(user.ratings);

  const openEdit = () => {
    setEditForm(userToForm(user));
    setEditOpen(true);
  };

  const handleEdit = () => {
    if (!editForm || !editForm.name || !editForm.email) {
      toast.error("Name and email are required.");
      return;
    }
    adminUpdateUser(user.id, {
      name: editForm.name,
      email: editForm.email,
      role: editForm.role,
      whatsapp: editForm.whatsapp || undefined,
      bio: editForm.bio || undefined,
      points: editForm.points,
    });
    setEditOpen(false);
    toast.success("User updated.");
  };

  const handleDelete = () => {
    adminDeleteUser(user.id);
    toast.success("User deleted.");
    router.push("/admin/users");
  };

  return (
    <div>
      <Button asChild variant="ghost" className="mb-4 -ml-2 rounded-full">
        <Link href="/admin/users">
          <ArrowLeft className="mr-2 h-4 w-4" /> All users
        </Link>
      </Button>

      <div className="rounded-3xl bg-background p-6 shadow-card sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="display text-4xl sm:text-5xl">{user.name}</h1>
              <Badge variant="outline" className="capitalize">{user.role}</Badge>
            </div>
            <p className="mt-2 text-muted-foreground">{user.email}</p>
            {user.bio && <p className="mt-3 max-w-xl text-sm">{user.bio}</p>}
          </div>
          <div className="flex gap-2">
            <Dialog open={editOpen} onOpenChange={setEditOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="rounded-full" onClick={openEdit}>
                  <Pencil className="mr-2 h-4 w-4" /> Edit user
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                  <DialogTitle>Edit user</DialogTitle>
                </DialogHeader>
                {editForm && (
                  <div className="space-y-4">
                    <div>
                      <Label>Name</Label>
                      <Input
                        className="mt-1"
                        value={editForm.name}
                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label>Email</Label>
                      <Input
                        className="mt-1"
                        type="email"
                        value={editForm.email}
                        onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Role</Label>
                        <select
                          className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                          value={editForm.role}
                          onChange={(e) => setEditForm({ ...editForm, role: e.target.value as UserRole })}
                        >
                          <option value="buyer">Buyer</option>
                          <option value="seller">Seller</option>
                        </select>
                      </div>
                      <div>
                        <Label>Points</Label>
                        <Input
                          className="mt-1"
                          type="number"
                          value={editForm.points || ""}
                          onChange={(e) => setEditForm({ ...editForm, points: +e.target.value })}
                        />
                      </div>
                    </div>
                    <div>
                      <Label>WhatsApp</Label>
                      <Input
                        className="mt-1"
                        value={editForm.whatsapp}
                        onChange={(e) => setEditForm({ ...editForm, whatsapp: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label>Bio</Label>
                      <Textarea
                        className="mt-1"
                        value={editForm.bio}
                        onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                      />
                    </div>
                  </div>
                )}
                <Button className="mt-4 w-full bg-primary" onClick={handleEdit}>
                  Save changes
                </Button>
              </DialogContent>
            </Dialog>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" className="rounded-full text-destructive hover:text-destructive">
                  <Trash2 className="mr-2 h-4 w-4" /> Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete {user.name}?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently remove the account
                    {userListings.length > 0
                      ? ` and ${userListings.length} listing${userListings.length === 1 ? "" : "s"}`
                      : ""}
                    .
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    onClick={handleDelete}
                  >
                    Delete user
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Listings", value: userListings.length },
            { label: "Live", value: userListings.filter((l) => !l.sold).length },
            { label: "Points", value: user.points },
            {
              label: "Rating",
              value: user.ratings.length ? `${rating.toFixed(1)} (${user.ratings.length})` : "—",
            },
          ].map((s) => (
            <div key={s.label} className="rounded-2xl bg-secondary/40 p-4">
              <p className="text-sm text-muted-foreground">{s.label}</p>
              <p className="display mt-1 text-2xl text-primary">
                {s.label === "Rating" && user.ratings.length ? (
                  <span className="inline-flex items-center gap-1">
                    <Star className="h-5 w-5 fill-maple text-maple" />
                    {s.value}
                  </span>
                ) : (
                  s.value
                )}
              </p>
            </div>
          ))}
        </div>

        {user.whatsapp && (
          <p className="mt-4 text-sm text-muted-foreground">
            WhatsApp: <span className="text-foreground">{user.whatsapp}</span>
          </p>
        )}

        {user.ratings.length > 0 && (
          <div className="mt-6">
            <h3 className="font-semibold">Recent ratings</h3>
            <ul className="mt-2 space-y-2">
              {user.ratings.slice(-3).map((r, i) => (
                <li key={i} className="rounded-xl bg-secondary/30 px-4 py-3 text-sm">
                  <span className="font-medium">{r.stars}★</span>
                  <span className="text-muted-foreground"> · {r.date}</span>
                  <p className="mt-1">{r.comment}</p>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="mt-8">
        <AdminUserListings sellerId={user.id} />
      </div>
    </div>
  );
}
