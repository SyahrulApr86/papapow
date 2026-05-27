"use server";

import { redirect } from "next/navigation";
import { registerUser, loginUser, setUserSession, clearUserSession } from "@/lib/user-auth";

export async function registerAction(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!name || !email || !password) {
    redirect("/account?error=Semua+field+harus+diisi");
  }
  if (password.length < 6) {
    redirect("/account?error=Password+minimal+6+karakter");
  }

  const result = await registerUser(email, name, password);
  if ("error" in result) {
    redirect(`/account?error=${encodeURIComponent(result.error)}`);
  }

  await setUserSession(result.userId);
  redirect("/account");
}

export async function loginAction(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  const result = await loginUser(email, password);
  if ("error" in result) {
    redirect(`/account?error=${encodeURIComponent(result.error)}&tab=login`);
  }

  await setUserSession(result.userId);
  redirect("/account");
}

export async function logoutAction() {
  await clearUserSession();
  redirect("/account");
}
