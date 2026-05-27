import { createHash, pbkdf2Sync, randomBytes, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { db } from "@/lib/db";

const COOKIE = "papapow_user";
const SECRET = process.env.USER_SESSION_SECRET ?? "papapow-user-dev-secret";
const ITERATIONS = 100_000;
const KEYLEN = 64;
const DIGEST = "sha512";

export type User = { id: number; email: string; name: string };

export function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const hash = pbkdf2Sync(password, salt, ITERATIONS, KEYLEN, DIGEST).toString("hex");
  return { hash, salt };
}

export function verifyPassword(password: string, hash: string, salt: string) {
  const attempt = pbkdf2Sync(password, salt, ITERATIONS, KEYLEN, DIGEST).toString("hex");
  if (attempt.length !== hash.length) return false;
  return timingSafeEqual(Buffer.from(attempt), Buffer.from(hash));
}

function sessionToken(userId: number) {
  return createHash("sha256").update(`${userId}:${SECRET}`).digest("hex");
}

export async function setUserSession(userId: number) {
  const cookieStore = await cookies();
  const value = `${userId}.${sessionToken(userId)}`;
  cookieStore.set(COOKIE, value, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function clearUserSession() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE);
}

export async function getUserSession(): Promise<User | null> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(COOKIE)?.value;
  if (!raw) return null;

  const [idStr, token] = raw.split(".");
  const id = parseInt(idStr, 10);
  if (!Number.isFinite(id)) return null;

  const expected = sessionToken(id);
  if (!token || token.length !== expected.length) return null;
  if (!timingSafeEqual(Buffer.from(token), Buffer.from(expected))) return null;

  const { rows } = await db.query<User>(
    "SELECT id, email, name FROM users WHERE id = $1",
    [id],
  );
  return rows[0] ?? null;
}

export async function registerUser(email: string, name: string, password: string) {
  const existing = await db.query("SELECT id FROM users WHERE email = $1", [email]);
  if (existing.rows.length > 0) return { error: "Email sudah terdaftar" };

  const { hash, salt } = hashPassword(password);
  const { rows } = await db.query<{ id: number }>(
    "INSERT INTO users (email, name, password_hash, salt) VALUES ($1, $2, $3, $4) RETURNING id",
    [email.toLowerCase().trim(), name.trim(), hash, salt],
  );
  return { userId: rows[0].id };
}

export async function loginUser(email: string, password: string) {
  const { rows } = await db.query<{ id: number; password_hash: string; salt: string }>(
    "SELECT id, password_hash, salt FROM users WHERE email = $1",
    [email.toLowerCase().trim()],
  );
  if (!rows[0]) return { error: "Email atau password salah" };

  const ok = verifyPassword(password, rows[0].password_hash, rows[0].salt);
  if (!ok) return { error: "Email atau password salah" };

  return { userId: rows[0].id };
}
