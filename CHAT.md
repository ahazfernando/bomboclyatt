# Buyer-Seller Real-Time Chat

Real-time messaging between buyers and sellers, scoped to a specific listing.

## Architecture

| Layer | Technology |
|-------|------------|
| REST API | Next.js App Router (`/api/conversations/*`) |
| WebSocket | Socket.IO sidecar (`server/index.ts`, port 3001) |
| Persistence | Firestore (`conversations`, `messages`) or `.data/chat.json` locally |
| Pub/sub | `@socket.io/redis-adapter` + Redis |
| Auth | JWT bearer tokens (buyer/seller only — not admin) |

## Running locally

```bash
# Terminal 1 — Next.js
npm run dev

# Terminal 2 — Socket.IO server
npm run dev:socket

# Or both at once
npm run dev:all
```

Optional: start Redis (`redis://localhost:6379`) and set `REDIS_URL` in `.env.local`. Without Redis, the socket server uses an in-memory adapter (single instance only).

## Environment variables

See `.env.example`:

- `JWT_SECRET` — signs chat tokens (server-only)
- `NEXT_PUBLIC_SOCKET_URL` — client WebSocket URL
- `SOCKET_PORT` — socket server port (default 3001)
- `CLIENT_URL` — CORS origin for socket server
- `REDIS_URL` — Redis connection for multi-instance adapter

## Data model

### Conversation

```
id, buyerId, sellerId, listingId, createdAt, lastMessageAt
```

Unique tuple: `(buyerId, sellerId, listingId)` — enforced in `findOrCreateConversation`.

### Message

```
id, conversationId, senderId, body, attachmentUrl?, readAt?, createdAt
```

`body` is sanitized with `sanitize-html` (no HTML tags allowed).

## REST endpoints

All routes require `Authorization: Bearer <jwt>`.

| Method | Route | Description |
|--------|-------|-------------|
| `POST` | `/api/auth/token` | Issue JWT for a valid user id |
| `GET` | `/api/conversations` | List user's conversations |
| `POST` | `/api/conversations` | Start/reuse conversation `{ listingId, sellerId }` |
| `GET` | `/api/conversations/:id/messages?limit=50&before=` | Paginated history |
| `PATCH` | `/api/conversations/:id/read` | Mark incoming messages read |

## Socket.IO integration

### Connect

```typescript
import { io } from "socket.io-client";

const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL!, {
  auth: { token: "<jwt from /api/auth/token>" },
});
```

Obtain a token after login via `POST /api/auth/token` with `{ userId }`. The app stores it in `localStorage` under `bomboclyatt-chat-token`.

### Server → client events

| Event | Payload |
|-------|---------|
| `connected` | `{ userId, conversationIds }` |
| `new_message` | `{ message: Message }` |
| `typing` | `{ conversationId, userId }` |
| `stop_typing` | `{ conversationId, userId }` |

### Client → server events

| Event | Payload | Notes |
|-------|---------|-------|
| `join_conversation` | `{ conversationId }` | Verified participant check |
| `send_message` | `{ conversationId, body, attachmentUrl? }` | Persisted then broadcast |
| `typing` | `{ conversationId }` | Not persisted |
| `stop_typing` | `{ conversationId }` | Not persisted |

### Rooms

Each conversation uses room `conversation:{conversationId}`. On connect, the server joins the socket to all rooms where the user is buyer or seller (DB-verified). `join_conversation` allows joining a newly created thread.

## Security

- JWT type must be `"user"` — admin tokens are rejected on the socket namespace.
- Every REST and socket path verifies the requester is a conversation participant.
- Rate limits: 10 messages / 10s (socket) + 30 messages / minute (DB-backed).
- Message bodies sanitized before storage.
- Admin moderation is **not** on this namespace — use a separate `/admin-chat` namespace if needed later.

## Frontend entry points

- **Dashboard → Messages** (`/dashboard/messages`)
- **Listing detail → Message seller** (creates conversation, redirects to messages)

## Attachments (future)

Attachment upload is not wired yet. When added:

1. Validate MIME type + size server-side (images, PDF only).
2. Upload to S3/R2 — never store binary in DB.
3. Pass `attachmentUrl` (signed, time-limited) in `send_message`.

## Future extensions

- Push notifications on new message
- Full-text message search
- Admin moderation via separate `/admin-chat` namespace
