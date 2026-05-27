import { createHash, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

const cookieName = "papapow_admin";

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

  if (!token || token.length !== expected.length) {
    return false;
  }

  return timingSafeEqual(Buffer.from(token), Buffer.from(expected));
}

export async function loginAdmin(password: string) {
  const expectedPassword = process.env.ADMIN_PASSWORD ?? "papapow";

  if (password !== expectedPassword) {
    return false;
  }

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
