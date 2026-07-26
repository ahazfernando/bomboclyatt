import { NextResponse } from "next/server";
import { verifyChatToken, getBearerToken } from "@/lib/auth/jwt";

export type AuthContext = { userId: string };

export function unauthorized(message = "Unauthorized") {
  return NextResponse.json({ error: message }, { status: 401 });
}

export function forbidden(message = "Forbidden") {
  return NextResponse.json({ error: message }, { status: 403 });
}

export function requireUserAuth(request: Request): AuthContext | NextResponse {
  const token = getBearerToken(request.headers.get("authorization"));
  if (!token) return unauthorized("Missing bearer token");

  try {
    const payload = verifyChatToken(token);
    return { userId: payload.userId };
  } catch {
    return unauthorized("Invalid or expired token");
  }
}

export function isAuthError(result: AuthContext | NextResponse): result is NextResponse {
  return result instanceof NextResponse;
}
