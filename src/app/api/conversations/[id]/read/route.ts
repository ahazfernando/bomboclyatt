import { NextResponse } from "next/server";
import { requireUserAuth, isAuthError, forbidden } from "@/lib/chat/auth-middleware";
import { isParticipant, markMessagesRead } from "@/lib/chat/service";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(_request: Request, context: RouteContext) {
  const auth = requireUserAuth(_request);
  if (isAuthError(auth)) return auth;

  try {
    const { id } = await context.params;
    const allowed = await isParticipant(id, auth.userId);
    if (!allowed) return forbidden("Not a participant in this conversation");

    const marked = await markMessagesRead(id, auth.userId);
    return NextResponse.json({ marked });
  } catch (error) {
    console.error("PATCH /api/conversations/[id]/read", error);
    return NextResponse.json({ error: "Failed to mark messages read" }, { status: 500 });
  }
}
