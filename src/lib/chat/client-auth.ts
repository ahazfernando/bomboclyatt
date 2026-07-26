const TOKEN_KEY = "bomboclyatt-chat-token";

export async function fetchChatToken(userId: string): Promise<string | null> {
  try {
    const res = await fetch("/api/auth/token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { token: string };
    localStorage.setItem(TOKEN_KEY, data.token);
    return data.token;
  } catch {
    return null;
  }
}

export function getChatToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function clearChatToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

export function chatAuthHeaders(): HeadersInit {
  const token = getChatToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}
