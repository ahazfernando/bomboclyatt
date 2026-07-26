import jwt, { type SignOptions } from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET ?? "dev-chat-secret-change-in-production";
const JWT_EXPIRES_IN = (process.env.JWT_EXPIRES_IN ?? "7d") as SignOptions["expiresIn"];

export type ChatTokenPayload = {
  userId: string;
  type: "user";
};

export function signChatToken(userId: string): string {
  return jwt.sign({ userId, type: "user" } satisfies ChatTokenPayload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
}

export function verifyChatToken(token: string): ChatTokenPayload {
  const payload = jwt.verify(token, JWT_SECRET) as ChatTokenPayload;
  if (payload.type !== "user" || !payload.userId) {
    throw new Error("Invalid token type");
  }
  return payload;
}

export function getBearerToken(authHeader: string | null): string | null {
  if (!authHeader?.startsWith("Bearer ")) return null;
  return authHeader.slice(7).trim() || null;
}
