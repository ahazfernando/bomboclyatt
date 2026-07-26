import { promises as fs } from "fs";
import path from "path";
import type { User } from "@/lib/types";

const DATA_DIR = path.join(process.cwd(), ".data");
const USERS_FILE = path.join(DATA_DIR, "users.json");

async function readUsers(): Promise<User[]> {
  try {
    const raw = await fs.readFile(USERS_FILE, "utf-8");
    return JSON.parse(raw) as User[];
  } catch {
    return [];
  }
}

async function writeUsers(users: User[]): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(USERS_FILE, JSON.stringify(users, null, 2));
}

export async function syncLocalUser(user: User): Promise<void> {
  const users = await readUsers();
  const idx = users.findIndex((u) => u.id === user.id);
  if (idx >= 0) users[idx] = user;
  else users.push(user);
  await writeUsers(users);
}

export async function getLocalUser(userId: string): Promise<User | null> {
  const users = await readUsers();
  return users.find((u) => u.id === userId) ?? null;
}

export async function getAllLocalUsers(): Promise<User[]> {
  return readUsers();
}
