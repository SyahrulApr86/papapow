"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db, type Product } from "@/lib/db";
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

async function fileToBase64(file: File | null | string): Promise<string | null> {
  if (!file || typeof file === "string") return null;
  const bytes = await file.arrayBuffer();
  const base64 = Buffer.from(bytes).toString("base64");
  return `data:${file.type};base64,${base64}`;
}

async function imageValue(formData: FormData, fileKey: string, urlKey: string) {
  const file = formData.get(fileKey);
  if (file instanceof File && file.size > 0) {
    return await fileToBase64(file);
  }
  const url = text(formData, urlKey);
  return nullableText(formData, urlKey);
}

async function imagesJson(formData: FormData, fileKey: string, urlKey: string) {
  const files = formData.getAll(fileKey).filter(
    (f): f is File => f instanceof File && f.size > 0,
  );
  if (files.length > 0) {
    const uris = await Promise.all(files.map((f) => fileToBase64(f)));
    const valid = uris.filter((u): u is string => u !== null);
    if (valid.length > 0) return JSON.stringify(valid);
  }
  return jsonArray(formData, urlKey);
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

function jsonArray(formData: FormData, key: string) {
  const raw = text(formData, key);
  if (!raw) return "[]";
  try {
    JSON.parse(raw);
    return raw;
  } catch {
    return JSON.stringify(raw.split(",").map((s) => s.trim()).filter(Boolean));
  }
}

export async function createProduct(formData: FormData) {
  await requireAdmin();

  const image = await imageValue(formData, "image_file", "image_url");
  const images = await imagesJson(formData, "images_file", "images");

  await db.query(
    `INSERT INTO products
      (name, category, price, compare_at_price, discount_label, image_url, images, sizes, description, material, weight, is_featured, sort_order)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
    [
      text(formData, "name"),
      text(formData, "category"),
      intValue(formData, "price"),
      nullableInt(formData, "compare_at_price"),
      nullableText(formData, "discount_label"),
      image,
      images,
      jsonArray(formData, "sizes"),
      text(formData, "description"),
      text(formData, "material"),
      intValue(formData, "weight"),
      formData.get("is_featured") === "on",
      intValue(formData, "sort_order"),
    ],
  );

  revalidatePath("/");
  redirect("/admin?updated=Produk+berhasil+ditambahkan");
}

export async function updateProduct(formData: FormData) {
  await requireAdmin();

  const productId = intValue(formData, "id");
  const existing = await db.query<Product>(
    "SELECT image_url, images FROM products WHERE id = $1",
    [productId],
  );

  const existingImage = existing.rows[0]?.image_url ?? "";
  const existingImages = existing.rows[0]?.images ?? "[]";

  const image = (await imageValue(formData, "image_file", "image_url")) ?? existingImage;
  const images = await imagesJson(formData, "images_file", "images");

  await db.query(
    `UPDATE products
     SET name = $1,
         category = $2,
         price = $3,
         compare_at_price = $4,
         discount_label = $5,
         image_url = $6,
         images = $7,
         sizes = $8,
         description = $9,
         material = $10,
         weight = $11,
         is_featured = $12,
         sort_order = $13
     WHERE id = $14`,
    [
      text(formData, "name"),
      text(formData, "category"),
      intValue(formData, "price"),
      nullableInt(formData, "compare_at_price"),
      nullableText(formData, "discount_label"),
      image,
      images,
      jsonArray(formData, "sizes"),
      text(formData, "description"),
      text(formData, "material"),
      intValue(formData, "weight"),
      formData.get("is_featured") === "on",
      intValue(formData, "sort_order"),
      productId,
    ],
  );

  revalidatePath("/");
  redirect("/admin?updated=Produk+berhasil+diupdate");
}

export async function deleteProduct(formData: FormData) {
  await requireAdmin();

  await db.query("DELETE FROM products WHERE id = $1", [intValue(formData, "id")]);
  revalidatePath("/");
  redirect("/admin?updated=Produk+berhasil+dihapus");
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
  redirect("/admin?updated=Banner+berhasil+diupdate");
}
