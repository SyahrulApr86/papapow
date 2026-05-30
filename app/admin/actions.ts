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
  if (!(await isAdmin())) redirect("/admin");
}

function rethrowRedirect(e: any) {
  if (e?.digest?.startsWith("NEXT_REDIRECT")) throw e;
}

function parseSizes(formData: FormData): string[] {
  const raw = text(formData, "sizes");
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return raw.split(",").map((s) => s.trim()).filter(Boolean);
  }
}

export async function loginAction(formData: FormData) {
  const ok = await loginAdmin(text(formData, "password"));
  if (!ok) redirect("/admin?error=1");
  redirect("/admin/products");
}

export async function logoutAction() {
  await logoutAdmin();
  redirect("/admin");
}

export async function createProduct(formData: FormData) {
  await requireAdmin();

  try {
    const mainImage  = await uploadFile(formData.get("main_image_file"),  "Gambar Utama") ?? "";
    const hoverImage = await uploadFile(formData.get("hover_image_file"), "Gambar Hover");
    const keptUrls   = formData.getAll("extra_keep").map(String).filter(Boolean);
    const newExtras  = await uploadFiles(formData.getAll("extra_new"), "Gambar Tambahan");
    const extraImages = [...keptUrls, ...newExtras];

    const product = await db.product.create({
      data: {
        name:             text(formData, "name"),
        category:         text(formData, "category"),
        price:            intValue(formData, "price"),
        compare_at_price: nullableInt(formData, "compare_at_price"),
        discount_label:   nullableText(formData, "discount_label"),
        main_image:       mainImage,
        hover_image:      hoverImage,
        sizes:            parseSizes(formData),
        description:      nullableText(formData, "description"),
        material:         nullableText(formData, "material"),
        weight:           nullableInt(formData, "weight") ?? 0,
        is_featured:      formData.get("is_featured") === "on",
        sort_order:       intValue(formData, "sort_order"),
        extra_images: {
          create: extraImages.map((url, i) => ({ image_url: url, sort_order: i })),
        },
      },
    });

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

    const existing = await db.product.findUnique({
      where: { id: productId },
      select: { main_image: true, hover_image: true },
    });

    const mainImage  = (await uploadFile(formData.get("main_image_file"),  "Gambar Utama"))  ?? existing?.main_image  ?? "";
    const hoverImage = (await uploadFile(formData.get("hover_image_file"), "Gambar Hover")) ?? existing?.hover_image ?? null;
    const keptUrls   = formData.getAll("extra_keep").map(String).filter(Boolean);
    const uploaded   = await uploadFiles(formData.getAll("extra_new"), "Gambar Tambahan");
    const newExtras  = [...keptUrls, ...uploaded];

    await db.product.update({
      where: { id: productId },
      data: {
        name:             text(formData, "name"),
        category:         text(formData, "category"),
        price:            intValue(formData, "price"),
        compare_at_price: nullableInt(formData, "compare_at_price"),
        discount_label:   nullableText(formData, "discount_label"),
        main_image:       mainImage,
        hover_image:      hoverImage,
        sizes:            parseSizes(formData),
        description:      nullableText(formData, "description"),
        material:         nullableText(formData, "material"),
        weight:           nullableInt(formData, "weight") ?? 0,
        is_featured:      formData.get("is_featured") === "on",
        sort_order:       intValue(formData, "sort_order"),
        extra_images: {
          deleteMany: {},
          create: newExtras.map((url, i) => ({ image_url: url, sort_order: i })),
        },
      },
    });

    revalidatePath("/", "layout");
    redirect("/admin/products?updated=Produk+berhasil+diupdate");
  } catch (e: any) {
    rethrowRedirect(e);
    redirect(`/admin/products?error=${encodeURIComponent(e.message)}`);
  }
}

export async function deleteProduct(formData: FormData) {
  await requireAdmin();

  await db.product.delete({ where: { id: intValue(formData, "id") } });
  revalidatePath("/", "layout");
  redirect("/admin/products?updated=Produk+berhasil+dihapus");
}

export async function updateBanner(formData: FormData) {
  await requireAdmin();

  const id = intValue(formData, "id");
  const file = formData.get("image_file");
  let imageUrl: string | null = null;

  if (file instanceof File && file.size > 0) {
    imageUrl = await fileToBase64(file, "Gambar Banner");
  }
  if (!imageUrl) {
    const existing = await db.banner.findUnique({ where: { id }, select: { image_url: true } });
    imageUrl = existing?.image_url ?? null;
  }

  await db.banner.update({
    where: { id },
    data: {
      title:      text(formData, "title"),
      subtitle:   nullableText(formData, "subtitle"),
      image_url:  imageUrl ?? "",
      cta_label:  nullableText(formData, "cta_label"),
      cta_href:   nullableText(formData, "cta_href"),
      sort_order: intValue(formData, "sort_order"),
    },
  });

  revalidatePath("/", "layout");
  redirect("/admin/banners?updated=Banner+berhasil+diupdate");
}

export async function updateSettings(formData: FormData) {
  await requireAdmin();
  await setSetting("wa_number", text(formData, "wa_number"));
  revalidatePath("/", "layout");
  redirect("/admin/settings?updated=Pengaturan+berhasil+disimpan");
}
