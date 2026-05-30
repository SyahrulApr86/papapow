import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { randomUUID } from "crypto";
import path from "path";

function getClient() {
  const endpoint = process.env.STORAGE_ENDPOINT;
  if (!endpoint) throw new Error("STORAGE_ENDPOINT is not set");

  return new S3Client({
    endpoint,
    region: process.env.STORAGE_REGION ?? "auto",
    credentials: {
      accessKeyId: process.env.STORAGE_ACCESS_KEY_ID ?? "",
      secretAccessKey: process.env.STORAGE_SECRET_ACCESS_KEY ?? "",
    },
    // Required for MinIO / path-style endpoints (not virtual-hosted)
    forcePathStyle: process.env.STORAGE_FORCE_PATH_STYLE === "true",
  });
}

function bucket() {
  return process.env.STORAGE_BUCKET ?? "papapow";
}

/** Public base URL for served files, no trailing slash */
function publicBase() {
  const url = process.env.STORAGE_PUBLIC_URL ?? "";
  return url.endsWith("/") ? url.slice(0, -1) : url;
}

function extFromMime(mime: string): string {
  const map: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/jpg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/gif": "gif",
    "image/avif": "avif",
  };
  return map[mime] ?? "jpg";
}

/**
 * Upload a File (from FormData) to object storage.
 * Returns the public URL.
 */
export async function uploadImage(
  file: File,
  folder = "uploads",
): Promise<string> {
  const ext = extFromMime(file.type) || path.extname(file.name).slice(1) || "jpg";
  const key = `${folder}/${randomUUID()}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  await getClient().send(
    new PutObjectCommand({
      Bucket: bucket(),
      Key: key,
      Body: buffer,
      ContentType: file.type || "image/jpeg",
      CacheControl: "public, max-age=31536000, immutable",
    }),
  );

  return `${publicBase()}/${key}`;
}

/**
 * Upload raw buffer to object storage.
 * Returns the public URL.
 */
export async function uploadBuffer(
  buffer: Buffer,
  key: string,
  contentType = "image/jpeg",
): Promise<string> {
  await getClient().send(
    new PutObjectCommand({
      Bucket: bucket(),
      Key: key,
      Body: buffer,
      ContentType: contentType,
      CacheControl: "public, max-age=31536000, immutable",
    }),
  );

  return `${publicBase()}/${key}`;
}

/**
 * Delete an object by its public URL or key.
 */
export async function deleteImage(urlOrKey: string): Promise<void> {
  const base = publicBase();
  const key = urlOrKey.startsWith(base)
    ? urlOrKey.slice(base.length + 1)
    : urlOrKey;

  await getClient().send(
    new DeleteObjectCommand({ Bucket: bucket(), Key: key }),
  );
}

/** Returns true if a string looks like a base64 data URL */
export function isBase64DataUrl(value: string): boolean {
  return value.startsWith("data:");
}
