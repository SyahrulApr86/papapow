/**
 * Migrate base64 images from DB → object storage (MinIO/R2).
 *
 * Usage:
 *   npx tsx scripts/migrate-images.ts
 *
 * Requires STORAGE_* env vars to be set (copy from .env.example).
 * Safe to re-run — skips images that are already URLs (not base64).
 */

import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { randomUUID } from "crypto";

const db = new PrismaClient();

/* ── S3 client ─────────────────────────────────────────── */

const endpoint = process.env.STORAGE_ENDPOINT;
const bucket   = process.env.STORAGE_BUCKET ?? "papapow";
const publicBase = (process.env.STORAGE_PUBLIC_URL ?? "").replace(/\/$/, "");

if (!endpoint) {
  console.error("ERROR: STORAGE_ENDPOINT not set");
  process.exit(1);
}
if (!publicBase) {
  console.error("ERROR: STORAGE_PUBLIC_URL not set");
  process.exit(1);
}

const s3 = new S3Client({
  endpoint,
  region: process.env.STORAGE_REGION ?? "auto",
  credentials: {
    accessKeyId:     process.env.STORAGE_ACCESS_KEY_ID ?? "",
    secretAccessKey: process.env.STORAGE_SECRET_ACCESS_KEY ?? "",
  },
  forcePathStyle: process.env.STORAGE_FORCE_PATH_STYLE === "true",
});

/* ── helpers ────────────────────────────────────────────── */

function isBase64(value: string | null | undefined): value is string {
  return typeof value === "string" && value.startsWith("data:");
}

function mimeFromDataUrl(dataUrl: string): string {
  const m = dataUrl.match(/^data:([^;]+);/);
  return m?.[1] ?? "image/jpeg";
}

function extFromMime(mime: string): string {
  const map: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/jpg":  "jpg",
    "image/png":  "png",
    "image/webp": "webp",
    "image/gif":  "gif",
    "image/avif": "avif",
  };
  return map[mime] ?? "jpg";
}

async function uploadBase64(dataUrl: string, folder: string): Promise<string> {
  const mime   = mimeFromDataUrl(dataUrl);
  const ext    = extFromMime(mime);
  const key    = `${folder}/${randomUUID()}.${ext}`;
  const base64 = dataUrl.split(",")[1];
  const buffer = Buffer.from(base64, "base64");

  await s3.send(new PutObjectCommand({
    Bucket:       bucket,
    Key:          key,
    Body:         buffer,
    ContentType:  mime,
    CacheControl: "public, max-age=31536000, immutable",
  }));

  return `${publicBase}/${key}`;
}

/* ── main ───────────────────────────────────────────────── */

async function main() {
  console.log(`\nStorage endpoint : ${endpoint}`);
  console.log(`Bucket           : ${bucket}`);
  console.log(`Public base URL  : ${publicBase}\n`);

  /* ── Products ── */
  const products = await db.product.findMany({
    include: { extra_images: true },
  });

  let productUpdates = 0;

  for (const p of products) {
    const updates: Record<string, unknown> = {};

    if (isBase64(p.main_image)) {
      process.stdout.write(`Product #${p.id} main_image  → uploading...`);
      updates.main_image = await uploadBase64(p.main_image, "products");
      process.stdout.write(" ✓\n");
    }

    if (isBase64(p.hover_image)) {
      process.stdout.write(`Product #${p.id} hover_image → uploading...`);
      updates.hover_image = await uploadBase64(p.hover_image, "products");
      process.stdout.write(" ✓\n");
    }

    if (Object.keys(updates).length > 0) {
      await db.product.update({ where: { id: p.id }, data: updates });
      productUpdates++;
    }

    // Extra images
    for (const img of p.extra_images) {
      if (isBase64(img.image_url)) {
        process.stdout.write(`Product #${p.id} extra #${img.id} → uploading...`);
        const url = await uploadBase64(img.image_url, "products");
        await db.productImage.update({ where: { id: img.id }, data: { image_url: url } });
        process.stdout.write(" ✓\n");
        productUpdates++;
      }
    }
  }

  /* ── Banners ── */
  const banners = await db.banner.findMany();
  let bannerUpdates = 0;

  for (const b of banners) {
    if (isBase64(b.image_url)) {
      process.stdout.write(`Banner #${b.id} "${b.title}" → uploading...`);
      const url = await uploadBase64(b.image_url, "banners");
      await db.banner.update({ where: { id: b.id }, data: { image_url: url } });
      process.stdout.write(" ✓\n");
      bannerUpdates++;
    }
  }

  console.log(`\nDone.`);
  console.log(`  Products / images migrated : ${productUpdates}`);
  console.log(`  Banners migrated           : ${bannerUpdates}`);

  await db.$disconnect();
}

main().catch((err) => {
  console.error(err);
  db.$disconnect();
  process.exit(1);
});
