import { createHash, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

const cookieName = "papapow_admin";

// In-memory rate limiter — resets on cold start (good enough for single admin)
const attempts = new Map<string, { count: number; resetAt: number }>();
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = attempts.get(ip);
  if (!entry || now > entry.resetAt) {
    attempts.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return true;
  }
  if (entry.count >= MAX_ATTEMPTS) return false;
  entry.count++;
  return true;
}

function clearRateLimit(ip: string) {
  attempts.delete(ip);
}

function digest(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

function sessionValue(password: string) {
  const secret = process.env.ADMIN_SESSION_SECRET ?? "papapow-dev-secret";
  return digest(`${password}:${secret}`);
}

export async function isAdmin() {
  const password = process.env.ADMIN_PASSWORD ?? "papapow";
  const cookieStore = await cookies();
  const token = cookieStore.get(cookieName)?.value;
  const expected = sessionValue(password);

  if (!token || token.length !== expected.length) return false;
  return timingSafeEqual(Buffer.from(token), Buffer.from(expected));
}

export async function loginAdmin(password: string, ip = "unknown") {
  if (!checkRateLimit(ip)) return "rate_limited";

  const expectedPassword = process.env.ADMIN_PASSWORD ?? "papapow";

  // Timing-safe compare via digest — both sides go through same hash
  const inputHash    = Buffer.from(digest(password));
  const expectedHash = Buffer.from(digest(expectedPassword));

  const match =
    inputHash.length === expectedHash.length &&
    timingSafeEqual(inputHash, expectedHash);

  if (!match) return false;

  clearRateLimit(ip);

  const cookieStore = await cookies();
  cookieStore.set(cookieName, sessionValue(expectedPassword), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 8,
  });

  return true;
}

export async function logoutAdmin() {
  const cookieStore = await cookies();
  cookieStore.delete(cookieName);
}
