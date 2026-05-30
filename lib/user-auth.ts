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

  const user = await db.user.findUnique({
    where: { id },
    select: { id: true, email: true, name: true },
  });
  return user ?? null;
}

export async function registerUser(email: string, name: string, password: string) {
  const existing = await db.user.findUnique({ where: { email: email.toLowerCase().trim() } });
  if (existing) return { error: "Email sudah terdaftar" };

  const { hash, salt } = hashPassword(password);
  const user = await db.user.create({
    data: {
      email: email.toLowerCase().trim(),
      name: name.trim(),
      password_hash: hash,
      salt,
    },
  });
  return { userId: user.id };
}

export async function loginUser(email: string, password: string) {
  const user = await db.user.findUnique({
    where: { email: email.toLowerCase().trim() },
    select: { id: true, password_hash: true, salt: true },
  });
  if (!user) return { error: "Email atau password salah" };

  const ok = verifyPassword(password, user.password_hash, user.salt);
  if (!ok) return { error: "Email atau password salah" };

  return { userId: user.id };
}
