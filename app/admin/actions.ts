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

async function fileToBase64(file: File | null, label = "Gambar"): Promise<string | null> {
  if (!file || !(file instanceof File) || file.size === 0) return null;
  if (!file.type.startsWith("image/")) {
    throw new Error(`${label}: hanya file gambar yang diizinkan`);
  }
  const bytes = await file.arrayBuffer();
  const base64 = Buffer.from(bytes).toString("base64");
  return `data:${file.type};base64,${base64}`;
}

async function mainImage(formData: FormData) {
  const file = formData.get("image_file");
  if (file instanceof File && file.size > 0) {
    return fileToBase64(file, "Gambar Utama");
  }
  return null;
}

async function extraImages(formData: FormData) {
  const files = formData.getAll("images_file").filter(
    (f): f is File => f instanceof File && f.size > 0,
  );
  if (files.length === 0) return "[]";
  const uris = await Promise.all(
    files.map((f) => fileToBase64(f, "Gambar Tambahan")),
  );
  const valid = uris.filter((u): u is string => u !== null);
  return JSON.stringify(valid);
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

function rethrowRedirect(e: any) {
  if (e?.digest?.startsWith("NEXT_REDIRECT")) throw e;
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

  try {
    const image = await mainImage(formData);

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
        await extraImages(formData),
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
  } catch (e: any) {
    rethrowRedirect(e);
    redirect(`/admin?error=${encodeURIComponent(e.message)}`);
  }
}

export async function updateProduct(formData: FormData) {
  await requireAdmin();

  try {
    const productId = intValue(formData, "id");
    let image = await mainImage(formData);

    const existing = await db.query(
      "SELECT image_url, images FROM products WHERE id = $1",
      [productId],
    );
    if (!image) {
      image = existing.rows[0]?.image_url ?? null;
    }

    const newFiles = formData.getAll("images_file").filter(
      (f): f is File => f instanceof File && f.size > 0,
    );

    const common = [
      text(formData, "name"),
      text(formData, "category"),
      intValue(formData, "price"),
      nullableInt(formData, "compare_at_price"),
      nullableText(formData, "discount_label"),
      image,
      jsonArray(formData, "sizes"),
      text(formData, "description"),
      text(formData, "material"),
      intValue(formData, "weight"),
      formData.get("is_featured") === "on",
      intValue(formData, "sort_order"),
      productId,
    ];

    if (newFiles.length > 0) {
      const images = await extraImages(formData);
      common.splice(6, 0, images);
      await db.query(
        `UPDATE products
         SET name = $1, category = $2, price = $3, compare_at_price = $4,
             discount_label = $5, image_url = $6, images = $7,
             sizes = $8, description = $9, material = $10, weight = $11,
             is_featured = $12, sort_order = $13
         WHERE id = $14`,
        common,
      );
    } else {
      await db.query(
        `UPDATE products
         SET name = $1, category = $2, price = $3, compare_at_price = $4,
             discount_label = $5, image_url = $6,
             sizes = $7, description = $8, material = $9, weight = $10,
             is_featured = $11, sort_order = $12
         WHERE id = $13`,
        common,
      );
    }

    revalidatePath("/");
    redirect("/admin?updated=Produk+berhasil+diupdate");
  } catch (e: any) {
    rethrowRedirect(e);
    redirect(`/admin?error=${encodeURIComponent(e.message)}`);
  }
}

export async function deleteProduct(formData: FormData) {
  await requireAdmin();

  await db.query("DELETE FROM products WHERE id = $1", [intValue(formData, "id")]);
  revalidatePath("/");
  redirect("/admin?updated=Produk+berhasil+dihapus");
}

export async function updateBanner(formData: FormData) {
  await requireAdmin();

  const file = formData.get("image_file");
  let imageUrl: string | null = null;
  if (file instanceof File && file.size > 0) {
    imageUrl = await fileToBase64(file, "Gambar Banner");
  }
  if (!imageUrl) {
    const existing = await db.query(
      "SELECT image_url FROM banners WHERE id = $1",
      [intValue(formData, "id")],
    );
    imageUrl = existing.rows[0]?.image_url ?? null;
  }

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
      imageUrl,
      nullableText(formData, "cta_label"),
      nullableText(formData, "cta_href"),
      intValue(formData, "sort_order"),
      intValue(formData, "id"),
    ],
  );

  revalidatePath("/");
  redirect("/admin?updated=Banner+berhasil+diupdate");
}
