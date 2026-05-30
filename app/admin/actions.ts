"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { isAdmin, loginAdmin, logoutAdmin } from "@/lib/admin-auth";
import { setSetting } from "@/lib/settings";

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

async function uploadFile(file: FormDataEntryValue | null, label: string): Promise<string | null> {
  if (file instanceof File && file.size > 0) return fileToBase64(file, label);
  return null;
}

async function uploadFiles(files: FormDataEntryValue[], label: string): Promise<string[]> {
  const results = await Promise.all(
    files
      .filter((f): f is File => f instanceof File && f.size > 0)
      .map((f) => fileToBase64(f, label)),
  );
  return results.filter((u): u is string => u !== null);
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
  redirect("/admin/products");
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
    return JSON.stringify(
      raw
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    );
  }
}

export async function createProduct(formData: FormData) {
  await requireAdmin();

  try {
    const mainImage  = await uploadFile(formData.get("main_image_file"),  "Gambar Utama") ?? "";
    const hoverImage = await uploadFile(formData.get("hover_image_file"), "Gambar Hover");
    // extra_keep = existing URLs to retain, extra_new = newly uploaded files
    const keptUrls   = formData.getAll("extra_keep").map(String).filter(Boolean);
    const newExtras  = await uploadFiles(formData.getAll("extra_new"), "Gambar Tambahan");
    const extraImages = [...keptUrls, ...newExtras];

    const { rows } = await db.query(
      `INSERT INTO products
        (name, category, price, compare_at_price, discount_label,
         main_image, hover_image,
         sizes, description, material, weight, is_featured, sort_order)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
       RETURNING id`,
      [
        text(formData, "name"),
        text(formData, "category"),
        intValue(formData, "price"),
        nullableInt(formData, "compare_at_price"),
        nullableText(formData, "discount_label"),
        mainImage,
        hoverImage,
        jsonArray(formData, "sizes"),
        nullableText(formData, "description"),
        nullableText(formData, "material"),
        nullableInt(formData, "weight") ?? 0,
        formData.get("is_featured") === "on",
        intValue(formData, "sort_order"),
      ],
    );

    const productId = rows[0].id;
    if (extraImages.length > 0) {
      await Promise.all(
        extraImages.map((url, i) =>
          db.query(
            "INSERT INTO product_images (product_id, image_url, sort_order) VALUES ($1,$2,$3)",
            [productId, url, i],
          ),
        ),
      );
    }

    revalidatePath("/", "layout");
    redirect("/admin/products?updated=Produk+berhasil+ditambahkan");
  } catch (e: any) {
    rethrowRedirect(e);
    redirect(`/admin/products/new?error=${encodeURIComponent(e.message)}`);
  }
}

export async function updateProduct(formData: FormData) {
  await requireAdmin();

  try {
    const productId = intValue(formData, "id");

    // Fetch existing images to fall back to if no new file uploaded
    const existing = await db.query<{ main_image: string; hover_image: string | null }>(
      "SELECT main_image, hover_image FROM products WHERE id = $1",
      [productId],
    );
    const existingMain  = existing.rows[0]?.main_image  ?? "";
    const existingHover = existing.rows[0]?.hover_image ?? null;

    const mainImage  = (await uploadFile(formData.get("main_image_file"),  "Gambar Utama"))  ?? existingMain;
    const hoverImage = (await uploadFile(formData.get("hover_image_file"), "Gambar Hover")) ?? existingHover;
    // extra_keep = existing URLs to retain, extra_new = newly uploaded files
    const keptUrls  = formData.getAll("extra_keep").map(String).filter(Boolean);
    const uploaded  = await uploadFiles(formData.getAll("extra_new"), "Gambar Tambahan");
    const newExtras = [...keptUrls, ...uploaded];

    await db.query(
      `UPDATE products
       SET name=$1, category=$2, price=$3, compare_at_price=$4,
           discount_label=$5, main_image=$6, hover_image=$7,
           sizes=$8, description=$9, material=$10, weight=$11,
           is_featured=$12, sort_order=$13
       WHERE id=$14`,
      [
        text(formData, "name"),
        text(formData, "category"),
        intValue(formData, "price"),
        nullableInt(formData, "compare_at_price"),
        nullableText(formData, "discount_label"),
        mainImage,
        hoverImage,
        jsonArray(formData, "sizes"),
        nullableText(formData, "description"),
        nullableText(formData, "material"),
        nullableInt(formData, "weight") ?? 0,
        formData.get("is_featured") === "on",
        intValue(formData, "sort_order"),
        productId,
      ],
    );

    // Always reconcile gallery — delete all and reinsert based on submitted state
    // (extra_keep preserves existing URLs; extra_new adds new uploads; absence = deleted)
    await db.query("DELETE FROM product_images WHERE product_id = $1", [productId]);
    if (newExtras.length > 0) {
      await Promise.all(
        newExtras.map((url, i) =>
          db.query(
            "INSERT INTO product_images (product_id, image_url, sort_order) VALUES ($1,$2,$3)",
            [productId, url, i],
          ),
        ),
      );
    }

    revalidatePath("/", "layout");
    redirect("/admin/products?updated=Produk+berhasil+diupdate");
  } catch (e: any) {
    rethrowRedirect(e);
    redirect(`/admin/products?error=${encodeURIComponent(e.message)}`);
  }
}

export async function deleteProduct(formData: FormData) {
  await requireAdmin();

  const productId = intValue(formData, "id");
  // product_images auto-deleted via ON DELETE CASCADE
  await db.query("DELETE FROM products WHERE id = $1", [productId]);
  revalidatePath("/", "layout");
  redirect("/admin/products?updated=Produk+berhasil+dihapus");
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
     SET title=$1, subtitle=$2, image_url=$3, cta_label=$4, cta_href=$5, sort_order=$6
     WHERE id=$7`,
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

  revalidatePath("/", "layout");
  redirect("/admin/banners?updated=Banner+berhasil+diupdate");
}

export async function updateSettings(formData: FormData) {
  await requireAdmin();
  await setSetting("wa_number", text(formData, "wa_number"));
  revalidatePath("/", "layout");
  redirect("/admin/settings?updated=Pengaturan+berhasil+disimpan");
}
