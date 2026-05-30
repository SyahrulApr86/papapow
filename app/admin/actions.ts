"use server";

import { revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { isAdmin, loginAdmin, logoutAdmin } from "@/lib/admin-auth";
import { setSetting } from "@/lib/settings";
import { uploadImage } from "@/lib/storage";

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

async function uploadFile(file: FormDataEntryValue | null, label: string): Promise<string | null> {
  if (!(file instanceof File) || file.size === 0) return null;
  if (!file.type.startsWith("image/")) {
    throw new Error(`${label}: hanya file gambar yang diizinkan`);
  }
  return uploadImage(file, "products");
}

async function uploadFiles(files: FormDataEntryValue[], label: string): Promise<string[]> {
  const results = await Promise.all(
    files
      .filter((f): f is File => f instanceof File && f.size > 0)
      .map((f) => {
        if (!f.type.startsWith("image/")) throw new Error(`${label}: hanya file gambar yang diizinkan`);
        return uploadImage(f, "products");
      }),
  );
  return results.filter((u): u is string => u !== null);
}

async function requireAdmin() {
  if (!(await isAdmin())) redirect("/admin");
}

function rethrowRedirect(e: any) {
  if (e?.digest?.startsWith("NEXT_REDIRECT")) throw e;
}

function calcCompareAtPrice(price: number, discountLabel: string | null): number | null {
  if (!discountLabel) return null;
  const match = discountLabel.match(/(\d+(?:\.\d+)?)/);
  if (!match) return null;
  const pct = parseFloat(match[1]);
  if (pct <= 0 || pct >= 100) return null;
  return Math.round(price / (1 - pct / 100));
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
  const headersList = await headers();
  const ip = headersList.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";
  const result = await loginAdmin(text(formData, "password"), ip);
  if (result === "rate_limited") redirect("/admin?error=rate_limited");
  if (!result) redirect("/admin?error=1");
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

    const price          = intValue(formData, "price");
    const discountLabel  = nullableText(formData, "discount_label");

    const product = await db.product.create({
      data: {
        name:             text(formData, "name"),
        category:         text(formData, "category"),
        price,
        compare_at_price: calcCompareAtPrice(price, discountLabel),
        discount_label:   discountLabel,
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

    revalidateTag("products", "default");
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

    const price         = intValue(formData, "price");
    const discountLabel = nullableText(formData, "discount_label");

    await db.product.update({
      where: { id: productId },
      data: {
        name:             text(formData, "name"),
        category:         text(formData, "category"),
        price,
        compare_at_price: calcCompareAtPrice(price, discountLabel),
        discount_label:   discountLabel,
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

    revalidateTag("products", "default");
    redirect("/admin/products?updated=Produk+berhasil+diupdate");
  } catch (e: any) {
    rethrowRedirect(e);
    redirect(`/admin/products?error=${encodeURIComponent(e.message)}`);
  }
}

export async function deleteProduct(formData: FormData) {
  await requireAdmin();

  await db.product.delete({ where: { id: intValue(formData, "id") } });
  revalidateTag("products", "default");
  redirect("/admin/products?updated=Produk+berhasil+dihapus");
}

export async function updateBanner(formData: FormData) {
  await requireAdmin();

  const id = intValue(formData, "id");
  const file = formData.get("image_file");
  let imageUrl: string | null = null;

  if (file instanceof File && file.size > 0) {
    imageUrl = await uploadImage(file, "banners");
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

  revalidateTag("banners", "default");
  redirect("/admin/banners?updated=Banner+berhasil+diupdate");
}

export async function updateSettings(formData: FormData) {
  await requireAdmin();
  await setSetting("wa_number", text(formData, "wa_number"));
  revalidateTag("settings", "default");
  redirect("/admin/settings?updated=Pengaturan+berhasil+disimpan");
}
