"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { isAdmin, loginAdmin, logoutAdmin } from "@/lib/admin-auth";

function text(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function intValue(formData: FormData, key: string) {
  const value = Number.parseInt(text(formData, key), 10);
  return Number.isFinite(value) ? value : 0;
}

function nullableInt(formData: FormData, key: string) {
  const raw = text(formData, key);
  if (!raw) return null;
  const value = Number.parseInt(raw, 10);
  return Number.isFinite(value) ? value : null;
}

function nullableText(formData: FormData, key: string) {
  const value = text(formData, key);
  return value || null;
}

async function requireAdmin() {
  if (!(await isAdmin())) {
    redirect("/admin");
  }
}

export async function loginAction(formData: FormData) {
  const ok = await loginAdmin(text(formData, "password"));
  if (!ok) {
    redirect("/admin?error=1");
  }

  redirect("/admin");
}

export async function logoutAction() {
  await logoutAdmin();
  redirect("/admin");
}

export async function createProduct(formData: FormData) {
  await requireAdmin();

  await db.query(
    `INSERT INTO products
      (name, category, price, compare_at_price, discount_label, image_url, is_featured, sort_order)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
    [
      text(formData, "name"),
      text(formData, "category"),
      intValue(formData, "price"),
      nullableInt(formData, "compare_at_price"),
      nullableText(formData, "discount_label"),
      text(formData, "image_url"),
      formData.get("is_featured") === "on",
      intValue(formData, "sort_order"),
    ],
  );

  revalidatePath("/");
  revalidatePath("/admin");
}

export async function updateProduct(formData: FormData) {
  await requireAdmin();

  await db.query(
    `UPDATE products
     SET name = $1,
         category = $2,
         price = $3,
         compare_at_price = $4,
         discount_label = $5,
         image_url = $6,
         is_featured = $7,
         sort_order = $8
     WHERE id = $9`,
    [
      text(formData, "name"),
      text(formData, "category"),
      intValue(formData, "price"),
      nullableInt(formData, "compare_at_price"),
      nullableText(formData, "discount_label"),
      text(formData, "image_url"),
      formData.get("is_featured") === "on",
      intValue(formData, "sort_order"),
      intValue(formData, "id"),
    ],
  );

  revalidatePath("/");
  revalidatePath("/admin");
}

export async function deleteProduct(formData: FormData) {
  await requireAdmin();

  await db.query("DELETE FROM products WHERE id = $1", [intValue(formData, "id")]);
  revalidatePath("/");
  revalidatePath("/admin");
}

export async function updateBanner(formData: FormData) {
  await requireAdmin();

  await db.query(
    `UPDATE banners
     SET title = $1,
         subtitle = $2,
         image_url = $3,
         cta_label = $4,
         cta_href = $5,
         sort_order = $6
     WHERE id = $7`,
    [
      text(formData, "title"),
      nullableText(formData, "subtitle"),
      text(formData, "image_url"),
      nullableText(formData, "cta_label"),
      nullableText(formData, "cta_href"),
      intValue(formData, "sort_order"),
      intValue(formData, "id"),
    ],
  );

  revalidatePath("/");
  revalidatePath("/admin");
}
