"use client";

import { useEffect, useState, type SyntheticEvent } from "react";
import { Check, Copy, Facebook, Mail, MessageCircle, Share2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

type ListingShareProps = {
  listingId: string;
  title: string;
  /** Compact icon-only trigger for cards/rows. */
  compact?: boolean;
  className?: string;
};

function getListingUrl(listingId: string) {
  if (typeof window === "undefined") return `/listing/${listingId}`;
  return `${window.location.origin}/listing/${listingId}`;
}

function shareText(title: string) {
  return `Check out "${title}" on BomboClyatt`;
}

export function ListingShareButton({
  listingId,
  title,
  compact = false,
  className,
}: ListingShareProps) {
  const [copied, setCopied] = useState(false);
  const [canNativeShare, setCanNativeShare] = useState(false);
  const text = shareText(title);

  useEffect(() => {
    setCanNativeShare(typeof navigator.share === "function");
  }, []);

  const stop = (e: SyntheticEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const resolveUrl = () => getListingUrl(listingId);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(resolveUrl());
      setCopied(true);
      toast.success("Link copied");
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      toast.error("Couldn’t copy link");
    }
  };

  const openShare = (href: string) => {
    window.open(href, "_blank", "noopener,noreferrer");
  };

  const nativeShare = async () => {
    try {
      await navigator.share({ title, text, url: resolveUrl() });
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      toast.error("Couldn’t open share sheet");
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant={compact ? "secondary" : "outline"}
          size={compact ? "icon" : "default"}
          aria-label={`Share ${title}`}
          className={cn(
            compact
              ? "h-9 w-9 rounded-full bg-background/90 shadow-sm backdrop-blur hover:bg-background"
              : "h-12 rounded-full px-5",
            className,
          )}
          onClick={stop}
          onPointerDown={stop}
        >
          <Share2 className={cn("h-4 w-4", !compact && "mr-2")} />
          {!compact && "Share"}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-52"
        onClick={stop}
        onPointerDown={stop}
      >
        {canNativeShare && (
          <>
            <DropdownMenuItem onSelect={() => void nativeShare()}>
              <Share2 className="mr-2 h-4 w-4" />
              Share…
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}
        <DropdownMenuItem onSelect={() => void copyLink()}>
          {copied ? (
            <Check className="mr-2 h-4 w-4 text-primary" />
          ) : (
            <Copy className="mr-2 h-4 w-4" />
          )}
          Copy link
        </DropdownMenuItem>
        <DropdownMenuItem
          onSelect={() => {
            const url = resolveUrl();
            openShare(`https://wa.me/?text=${encodeURIComponent(`${text}\n${url}`)}`);
          }}
        >
          <MessageCircle className="mr-2 h-4 w-4" />
          WhatsApp
        </DropdownMenuItem>
        <DropdownMenuItem
          onSelect={() =>
            openShare(
              `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(resolveUrl())}`,
            )
          }
        >
          <Facebook className="mr-2 h-4 w-4" />
          Facebook
        </DropdownMenuItem>
        <DropdownMenuItem
          onSelect={() => {
            const url = resolveUrl();
            openShare(
              `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
            );
          }}
        >
          <Share2 className="mr-2 h-4 w-4" />
          X / Twitter
        </DropdownMenuItem>
        <DropdownMenuItem
          onSelect={() => {
            const url = resolveUrl();
            openShare(
              `mailto:?subject=${encodeURIComponent(text)}&body=${encodeURIComponent(`${text}\n\n${url}`)}`,
            );
          }}
        >
          <Mail className="mr-2 h-4 w-4" />
          Email
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
