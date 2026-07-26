"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useStore, type User, type UserRole } from "@/lib/store";
import { AdminPageHeader } from "@/components/admin-shell";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { ChevronRight, Pencil, Plus, Search, Trash2 } from "lucide-react";

type UserForm = {
  name: string;
  email: string;
  role: UserRole;
  whatsapp: string;
  bio: string;
  points: number;
};

const emptyForm: UserForm = {
  name: "",
  email: "",
  role: "buyer",
  whatsapp: "",
  bio: "",
  points: 0,
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

function UserFormFields({ form, setForm }: { form: UserForm; setForm: (f: UserForm) => void }) {
  return (
    <div className="space-y-4">
      <div>
        <Label>Name</Label>
        <Input
          className="mt-1"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          placeholder="Full name"
        />
      </div>
      <div>
        <Label>Email</Label>
        <Input
          className="mt-1"
          type="email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          placeholder="user@example.com"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Role</Label>
          <select
            className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value as UserRole })}
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
            value={form.points || ""}
            onChange={(e) => setForm({ ...form, points: +e.target.value })}
          />
        </div>
      </div>
      <div>
        <Label>WhatsApp</Label>
        <Input
          className="mt-1"
          value={form.whatsapp}
          onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
          placeholder="15551234567"
        />
      </div>
      <div>
        <Label>Bio</Label>
        <Textarea
          className="mt-1"
          value={form.bio}
          onChange={(e) => setForm({ ...form, bio: e.target.value })}
          placeholder="Short bio…"
        />
      </div>
    </div>
  );
}

export default function AdminUsersPage() {
  const { users, listings, adminCreateUser, adminUpdateUser, adminDeleteUser } = useStore();
  const [q, setQ] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | UserRole>("all");
  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<User | null>(null);
  const [createForm, setCreateForm] = useState<UserForm>(emptyForm);
  const [editForm, setEditForm] = useState<UserForm>(emptyForm);

  const listingCounts = useMemo(() => {
    const map = new Map<string, number>();
    listings.forEach((l) => map.set(l.sellerId, (map.get(l.sellerId) ?? 0) + 1));
    return map;
  }, [listings]);

  const filtered = useMemo(() => {
    return users.filter((u) => {
      if (roleFilter !== "all" && u.role !== roleFilter) return false;
      if (!q) return true;
      const needle = q.toLowerCase();
      return u.name.toLowerCase().includes(needle) || u.email.toLowerCase().includes(needle);
    });
  }, [users, q, roleFilter]);

  const handleCreate = () => {
    if (!createForm.name || !createForm.email) {
      toast.error("Name and email are required.");
      return;
    }
    const ok = adminCreateUser({
      name: createForm.name,
      email: createForm.email,
      role: createForm.role,
      whatsapp: createForm.whatsapp || undefined,
      bio: createForm.bio || undefined,
    });
    if (!ok) {
      toast.error("A user with this email already exists.");
      return;
    }
    setCreateForm(emptyForm);
    setCreateOpen(false);
    toast.success("User created.");
  };

  const handleEdit = () => {
    if (!editTarget || !editForm.name || !editForm.email) {
      toast.error("Name and email are required.");
      return;
    }
    adminUpdateUser(editTarget.id, {
      name: editForm.name,
      email: editForm.email,
      role: editForm.role,
      whatsapp: editForm.whatsapp || undefined,
      bio: editForm.bio || undefined,
      points: editForm.points,
    });
    setEditTarget(null);
    toast.success("User updated.");
  };

  const handleDelete = (user: User) => {
    const count = listingCounts.get(user.id) ?? 0;
    adminDeleteUser(user.id);
    toast.success(
      count > 0 ? `User deleted along with ${count} listing${count === 1 ? "" : "s"}.` : "User deleted."
    );
  };

  return (
    <div>
      <AdminPageHeader
        title="Users"
        subtitle={`${filtered.length} of ${users.length} accounts`}
        action={
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button className="rounded-full bg-maple text-tuft hover:bg-maple/90">
                <Plus className="mr-2 h-4 w-4" /> Add user
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Create user</DialogTitle>
              </DialogHeader>
              <UserFormFields form={createForm} setForm={setCreateForm} />
              <Button className="mt-4 w-full bg-primary" onClick={handleCreate}>
                Create user
              </Button>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="mb-4 flex flex-wrap gap-3">
        <div className="flex flex-1 items-center gap-2 rounded-full bg-background px-4 py-2.5 shadow-card">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by name or email…"
            className="w-full bg-transparent text-sm outline-none"
          />
        </div>
        <div className="flex items-center gap-1 rounded-full bg-background p-1 text-xs shadow-card">
          {(["all", "buyer", "seller"] as const).map((r) => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={`rounded-full px-4 py-2 font-medium capitalize transition ${
                roleFilter === r ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-hidden rounded-3xl bg-background shadow-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Listings</TableHead>
              <TableHead>Points</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((u) => (
              <TableRow key={u.id}>
                <TableCell>
                  <div>
                    <p className="font-medium">{u.name}</p>
                    <p className="text-xs text-muted-foreground">{u.email}</p>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="capitalize">{u.role}</Badge>
                </TableCell>
                <TableCell>{listingCounts.get(u.id) ?? 0}</TableCell>
                <TableCell>{u.points}</TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button variant="ghost" size="icon" asChild>
                      <Link href={`/admin/users/${u.id}`} aria-label="View user">
                        <ChevronRight className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setEditTarget(u);
                        setEditForm(userToForm(u));
                      }}
                      aria-label="Edit user"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" aria-label="Delete user">
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete {u.name}?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will permanently remove the user account
                            {(listingCounts.get(u.id) ?? 0) > 0
                              ? ` and ${listingCounts.get(u.id)} associated listing${(listingCounts.get(u.id) ?? 0) === 1 ? "" : "s"}`
                              : ""}
                            .
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            onClick={() => handleDelete(u)}
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

      <Dialog open={!!editTarget} onOpenChange={(open) => !open && setEditTarget(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit user</DialogTitle>
          </DialogHeader>
          <UserFormFields form={editForm} setForm={setEditForm} />
          <Button className="mt-4 w-full bg-primary" onClick={handleEdit}>
            Save changes
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
