"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useStore, type BusinessDocument } from "@/lib/store";
import { useCurrency } from "@/lib/currency";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  BadgeCheck,
  Building2,
  Camera,
  ExternalLink,
  FileText,
  ShieldCheck,
  Trash2,
  Upload,
  UserRound,
  Wallet,
} from "lucide-react";
import { fileToCompressedDataUrl } from "@/lib/listing-media";
import {
  MAX_BUSINESS_DOCUMENTS,
  VERIFICATION_BADGE_PRICE,
  isValidUsername,
  normalizeUsername,
} from "@/lib/profile";

async function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Could not read file."));
    reader.readAsDataURL(file);
  });
}

export default function DashboardProfilePage() {
  const { currentUser, updateProfile, purchaseVerificationBadge } = useStore();
  const { formatPrice } = useCurrency();
  const avatarRef = useRef<HTMLInputElement>(null);
  const docsRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [bio, setBio] = useState("");
  const [role, setRole] = useState<"buyer" | "seller">("buyer");
  const [avatar, setAvatar] = useState<string | undefined>();
  const [docs, setDocs] = useState<BusinessDocument[]>([]);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingDoc, setUploadingDoc] = useState(false);

  useEffect(() => {
    if (!currentUser) return;
    setName(currentUser.name);
    setUsername(currentUser.username ?? "");
    setWhatsapp(currentUser.whatsapp ?? "");
    setBio(currentUser.bio ?? "");
    setRole(currentUser.role);
    setAvatar(currentUser.avatar);
    setDocs(currentUser.businessDocuments ?? []);
  }, [currentUser]);

  if (!currentUser) return null;

  const balance = currentUser.walletBalance ?? 0;
  const initials = currentUser.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const handleAvatar = async (files: FileList | null) => {
    const file = files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file.");
      return;
    }
    setUploadingAvatar(true);
    try {
      const dataUrl = await fileToCompressedDataUrl(file, 640, 0.8);
      setAvatar(dataUrl);
      const result = updateProfile({ avatar: dataUrl });
      if (!result.ok) toast.error(result.reason);
      else toast.success("Profile photo updated.");
    } catch {
      toast.error("Could not process that image.");
    } finally {
      setUploadingAvatar(false);
      if (avatarRef.current) avatarRef.current.value = "";
    }
  };

  const handleSave = () => {
    if (!name.trim()) {
      toast.error("Display name is required.");
      return;
    }
    const cleanUsername = normalizeUsername(username);
    if (cleanUsername && !isValidUsername(cleanUsername)) {
      toast.error("Username must be 3–24 characters (letters, numbers, . or _).");
      return;
    }
    setSaving(true);
    const result = updateProfile({
      name: name.trim(),
      username: cleanUsername,
      whatsapp: whatsapp.trim() || undefined,
      bio: bio.trim() || undefined,
      role,
      avatar,
      businessDocuments: docs,
    });
    setSaving(false);
    if (!result.ok) toast.error(result.reason);
    else toast.success("Profile saved.");
  };

  const handlePurchaseBadge = () => {
    const result = purchaseVerificationBadge();
    if (!result.ok) {
      toast.error(result.reason);
      return;
    }
    toast.success("Verification badge purchased!");
  };

  const handleDocs = async (files: FileList | null) => {
    if (!files?.length) return;
    const remaining = MAX_BUSINESS_DOCUMENTS - docs.length;
    if (remaining <= 0) {
      toast.error(`You can upload up to ${MAX_BUSINESS_DOCUMENTS} documents.`);
      return;
    }
    setUploadingDoc(true);
    try {
      const next = [...docs];
      for (const file of Array.from(files)) {
        if (next.length >= MAX_BUSINESS_DOCUMENTS) break;
        const allowed =
          file.type.startsWith("image/") ||
          file.type === "application/pdf" ||
          file.name.toLowerCase().endsWith(".pdf");
        if (!allowed) {
          toast.error(`${file.name} must be an image or PDF.`);
          continue;
        }
        if (file.size > 4 * 1024 * 1024) {
          toast.error(`${file.name} is too large (max 4MB).`);
          continue;
        }
        const url = file.type.startsWith("image/")
          ? await fileToCompressedDataUrl(file, 1600, 0.75)
          : await readFileAsDataUrl(file);
        next.push({
          id: `doc-${Date.now()}-${next.length}`,
          name: file.name,
          url,
          mimeType: file.type || "application/octet-stream",
          uploadedAt: new Date().toISOString(),
        });
      }
      setDocs(next);
      const result = updateProfile({ businessDocuments: next });
      if (!result.ok) toast.error(result.reason);
      else toast.success("Document uploaded.");
    } catch {
      toast.error("Could not upload document.");
    } finally {
      setUploadingDoc(false);
      if (docsRef.current) docsRef.current.value = "";
    }
  };

  const removeDoc = (id: string) => {
    const next = docs.filter((d) => d.id !== id);
    setDocs(next);
    const result = updateProfile({ businessDocuments: next });
    if (!result.ok) toast.error(result.reason);
    else toast.success("Document removed.");
  };

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="display text-4xl sm:text-5xl">Your profile</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Update your public identity, verification, and business documents.
          </p>
        </div>
        <Button asChild variant="outline" className="rounded-full">
          <Link href={`/sellers/${currentUser.id}`}>
            <ExternalLink className="mr-2 h-4 w-4" />
            View public profile
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-6">
          {/* Identity card */}
          <section className="overflow-hidden rounded-3xl border border-border bg-card shadow-card">
            <div className="relative bg-gradient-hero px-6 pb-16 pt-8 text-tuft">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm text-tuft/75">Signed in as</p>
                  <p className="mt-1 text-lg font-medium">{currentUser.email}</p>
                </div>
                {currentUser.verified ? (
                  <Badge className="border-0 bg-tuft text-maple">
                    <BadgeCheck className="mr-1 h-3.5 w-3.5" />
                    Verified
                  </Badge>
                ) : (
                  <Badge className="border-0 bg-tuft/15 text-tuft">Unverified</Badge>
                )}
              </div>
            </div>

            <div className="relative px-6 pb-6">
              <div className="-mt-12 flex flex-col gap-4 sm:flex-row sm:items-end">
                <div className="relative">
                  <div className="grid h-28 w-28 place-items-center overflow-hidden rounded-3xl border-4 border-card bg-secondary shadow-card">
                    {avatar ? (
                      <img src={avatar} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <span className="display text-3xl text-maple">{initials}</span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => avatarRef.current?.click()}
                    disabled={uploadingAvatar}
                    className="absolute -bottom-1 -right-1 grid h-10 w-10 place-items-center rounded-full bg-maple text-tuft shadow-glow transition hover:bg-maple/90"
                    aria-label="Upload profile photo"
                  >
                    <Camera className="h-4 w-4" />
                  </button>
                  <input
                    ref={avatarRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => void handleAvatar(e.target.files)}
                  />
                </div>
                <div className="pb-1">
                  <h2 className="display text-3xl text-primary">{currentUser.name}</h2>
                  <p className="text-sm text-muted-foreground">
                    {currentUser.username ? `@${currentUser.username}` : "No username set"} ·{" "}
                    <span className="capitalize">{currentUser.role}</span>
                  </p>
                </div>
              </div>

              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <Label htmlFor="display-name">Display name</Label>
                  <Input
                    id="display-name"
                    className="mt-1"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <Label htmlFor="username">Username</Label>
                  <div className="relative mt-1">
                    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                      @
                    </span>
                    <Input
                      id="username"
                      className="pl-7"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="collector99"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="whatsapp">WhatsApp</Label>
                  <Input
                    id="whatsapp"
                    className="mt-1"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    placeholder="15551234567"
                  />
                </div>
                <div className="sm:col-span-2">
                  <Label htmlFor="role">Account type</Label>
                  <select
                    id="role"
                    className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={role}
                    onChange={(e) => setRole(e.target.value as "buyer" | "seller")}
                  >
                    <option value="buyer">Buyer</option>
                    <option value="seller">Seller</option>
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    className="mt-1"
                    rows={4}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Tell collectors what you buy and sell…"
                  />
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-2">
                <Button
                  className="bg-maple text-tuft hover:bg-maple/90"
                  onClick={handleSave}
                  disabled={saving}
                >
                  <UserRound className="mr-2 h-4 w-4" />
                  {saving ? "Saving…" : "Save changes"}
                </Button>
                {uploadingAvatar && (
                  <span className="self-center text-xs text-muted-foreground">Updating photo…</span>
                )}
              </div>
            </div>
          </section>

          {/* Business documents */}
          <section className="rounded-3xl border border-border bg-card p-6 shadow-card">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <div className="grid h-10 w-10 place-items-center rounded-2xl bg-maple/10 text-maple">
                    <Building2 className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="font-semibold">Business registration</h2>
                    <p className="text-sm text-muted-foreground">
                      Upload certificates, permits, or company docs (PDF or image).
                    </p>
                  </div>
                </div>
              </div>
              <Badge variant="outline" className="w-fit">
                {docs.length}/{MAX_BUSINESS_DOCUMENTS}
              </Badge>
            </div>

            <div className="mt-5 space-y-3">
              {docs.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-border bg-secondary/30 px-4 py-10 text-center">
                  <FileText className="mx-auto h-8 w-8 text-muted-foreground" />
                  <p className="mt-3 text-sm text-muted-foreground">No documents uploaded yet.</p>
                </div>
              ) : (
                docs.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center gap-3 rounded-2xl border border-border bg-secondary/20 px-3 py-3"
                  >
                    <div className="grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-xl bg-background">
                      {doc.mimeType.startsWith("image/") ? (
                        <img src={doc.url} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <FileText className="h-5 w-5 text-maple" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{doc.name}</p>
                      <p className="text-xs text-muted-foreground">
                        Uploaded {new Date(doc.uploadedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <Button variant="ghost" size="icon" asChild>
                      <a href={doc.url} target="_blank" rel="noreferrer" aria-label="Open document">
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeDoc(doc.id)}
                      aria-label="Remove document"
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ))
              )}
            </div>

            {docs.length < MAX_BUSINESS_DOCUMENTS && (
              <>
                <input
                  ref={docsRef}
                  type="file"
                  accept="image/*,application/pdf,.pdf"
                  multiple
                  className="hidden"
                  onChange={(e) => void handleDocs(e.target.files)}
                />
                <Button
                  type="button"
                  variant="outline"
                  className="mt-4 w-full rounded-2xl"
                  disabled={uploadingDoc}
                  onClick={() => docsRef.current?.click()}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  {uploadingDoc ? "Uploading…" : "Upload documents"}
                </Button>
              </>
            )}
          </section>
        </div>

        <div className="space-y-6">
          {/* Verification */}
          <section className="rounded-3xl border border-border bg-card p-6 shadow-card">
            <div className="flex items-center gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-sun text-tuft shadow-glow">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div>
                <h2 className="font-semibold">Verification badge</h2>
                <p className="text-sm text-muted-foreground">
                  Stand out as a trusted seller on listings and your public page.
                </p>
              </div>
            </div>

            <ul className="mt-5 space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <BadgeCheck className="mt-0.5 h-4 w-4 shrink-0 text-maple" />
                Verified checkmark on your profile and storefront
              </li>
              <li className="flex items-start gap-2">
                <BadgeCheck className="mt-0.5 h-4 w-4 shrink-0 text-maple" />
                Higher buyer confidence when closing WhatsApp deals
              </li>
              <li className="flex items-start gap-2">
                <BadgeCheck className="mt-0.5 h-4 w-4 shrink-0 text-maple" />
                One-time purchase from your wallet balance
              </li>
            </ul>

            <div className="mt-6 rounded-2xl bg-secondary/50 p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs text-muted-foreground">Badge price</p>
                  <p className="display text-3xl text-primary">{formatPrice(VERIFICATION_BADGE_PRICE)}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Wallet</p>
                  <p className="font-semibold">{formatPrice(balance)}</p>
                </div>
              </div>
            </div>

            {currentUser.verified ? (
              <div className="mt-4 rounded-2xl border border-primary/20 bg-primary/5 px-4 py-3 text-sm">
                <p className="font-medium text-primary">You&apos;re verified</p>
                {currentUser.verifiedAt && (
                  <p className="mt-1 text-muted-foreground">
                    Since {new Date(currentUser.verifiedAt).toLocaleDateString()}
                  </p>
                )}
              </div>
            ) : (
              <div className="mt-4 space-y-2">
                <Button
                  className="w-full bg-maple text-tuft hover:bg-maple/90"
                  onClick={handlePurchaseBadge}
                >
                  <BadgeCheck className="mr-2 h-4 w-4" />
                  Purchase verification
                </Button>
                {balance < VERIFICATION_BADGE_PRICE && (
                  <Button asChild variant="outline" className="w-full">
                    <Link href="/dashboard/wallet">
                      <Wallet className="mr-2 h-4 w-4" />
                      Top up wallet
                    </Link>
                  </Button>
                )}
              </div>
            )}
          </section>

          {/* Quick tips */}
          <section className="rounded-3xl bg-gradient-soft p-6 shadow-card">
            <h2 className="font-semibold text-primary">Profile tips</h2>
            <ul className="mt-3 space-y-3 text-sm text-muted-foreground">
              <li>Use a clear photo so buyers recognize you in chats.</li>
              <li>Pick a unique username — it appears next to your storefront.</li>
              <li>Sellers should keep WhatsApp up to date for deal closings.</li>
              <li>Business docs help admins review you faster when needed.</li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
