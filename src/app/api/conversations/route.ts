import { NextResponse } from "next/server";
import { requireUserAuth, isAuthError } from "@/lib/chat/auth-middleware";
import { findOrCreateConversation, getUserConversations } from "@/lib/chat/service";
import { getListing } from "@/lib/firebase/db";
import { getServerFirestore, isFirebaseConfigured } from "@/lib/firebase/server";
import { seedData } from "@/lib/firebase/seed";

export async function GET(request: Request) {
  const auth = requireUserAuth(request);
  if (isAuthError(auth)) return auth;

  try {
    const conversations = await getUserConversations(auth.userId);
    return NextResponse.json({ conversations });
  } catch (error) {
    console.error("GET /api/conversations", error);
    return NextResponse.json({ error: "Failed to fetch conversations" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const auth = requireUserAuth(request);
  if (isAuthError(auth)) return auth;

  try {
    const body = (await request.json()) as { listingId?: string; sellerId?: string };
    const { listingId, sellerId } = body;

    if (!listingId || !sellerId) {
      return NextResponse.json({ error: "listingId and sellerId are required" }, { status: 400 });
    }

    if (auth.userId === sellerId) {
      return NextResponse.json({ error: "Cannot start a conversation with yourself" }, { status: 400 });
    }

    let listing = null;
    if (isFirebaseConfigured()) {
      listing = await getListing(getServerFirestore(), listingId);
    } else {
      listing = seedData.listings.find((l) => l.id === listingId) ?? null;
    }

    if (!listing) {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 });
    }
    if (listing.sellerId !== sellerId) {
      return NextResponse.json({ error: "Seller does not own this listing" }, { status: 400 });
    }

    const conversation = await findOrCreateConversation({
      buyerId: auth.userId,
      sellerId,
      listingId,
    });

    return NextResponse.json({ conversation }, { status: 201 });
  } catch (error) {
    console.error("POST /api/conversations", error);
    return NextResponse.json({ error: "Failed to create conversation" }, { status: 500 });
  }
}
