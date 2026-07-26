import { NextResponse } from "next/server";
import { requireUserAuth, isAuthError, forbidden } from "@/lib/chat/auth-middleware";
import { getMessages, isParticipant } from "@/lib/chat/service";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(request: Request, context: RouteContext) {
  const auth = requireUserAuth(request);
  if (isAuthError(auth)) return auth;

  try {
    const { id } = await context.params;
    const allowed = await isParticipant(id, auth.userId);
    if (!allowed) return forbidden("Not a participant in this conversation");

    const url = new URL(request.url);
    const limit = Math.min(Number(url.searchParams.get("limit") ?? 50), 100);
    const before = url.searchParams.get("before") ?? undefined;

    const messages = await getMessages(id, { limit, before });
    return NextResponse.json({ messages });
  } catch (error) {
    console.error("GET /api/conversations/[id]/messages", error);
    return NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 });
  }
}
