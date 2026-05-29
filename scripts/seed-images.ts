/**
 * Download Unsplash images and store as base64 data URIs in the DB.
 * Run: npx tsx scripts/seed-images.ts
 */

import { Pool } from "pg";

const db = new Pool({
  connectionString:
    process.env.DATABASE_URL ??
    "postgres://papapow:papapow@localhost:55432/papapow",
});

// Each product: [main image URL, hover image URL?, ...extra URLs]
const PRODUCT_IMAGES: Record<number, string[]> = {
  // Boxy Oversize Tee - White Signal
  1: [
    "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=900&q=85",
    "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=900&q=85",
  ],
  // Boxy Oversize Tee - Black Signal
  2: [
    "https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=900&q=85",
    "https://images.unsplash.com/photo-1618354691438-25bc04584c23?w=900&q=85",
  ],
  // Polo Shirt - White Pace
  3: [
    "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=900&q=85",
    "https://images.unsplash.com/photo-1618354691229-88d47f285158?w=900&q=85",
  ],
  // Polo Shirt - Black Pace
  4: [
    "https://images.unsplash.com/photo-1618354691551-44de113f0164?w=900&q=85",
    "https://images.unsplash.com/photo-1618354691520-b67f5c05a8e6?w=900&q=85",
  ],
  // Utility Pants - Bone
  5: [
    "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=900&q=85",
    "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=900&q=85",
  ],
  // Heavy Hoodie - Night
  6: [
    "https://images.unsplash.com/photo-1578587018452-892bacefd3f2?w=900&q=85",
    "https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=900&q=85",
  ],
  // Longsleeve Waffle - Grid
  7: [
    "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=900&q=85",
    "https://images.unsplash.com/photo-1603252109303-2751441dd157?w=900&q=85",
  ],
  // Cap - Core Mark
  8: [
    "https://images.unsplash.com/photo-1521369909029-2afed882baee?w=900&q=85",
    "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=900&q=85",
  ],
};

async function fetchAsBase64(url: string): Promise<string> {
  console.log(`  Downloading: ${url.slice(0, 60)}...`);
  const res = await fetch(url, {
    headers: { "User-Agent": "papapow-seed/1.0" },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  const contentType = res.headers.get("content-type") ?? "image/jpeg";
  const mime = contentType.split(";")[0].trim();
  const buf = await res.arrayBuffer();
  const b64 = Buffer.from(buf).toString("base64");
  return `data:${mime};base64,${b64}`;
}

async function main() {
  console.log("Seeding product images as base64...\n");

  for (const [idStr, urls] of Object.entries(PRODUCT_IMAGES)) {
    const id = Number(idStr);
    console.log(`Product #${id}:`);

    const base64Images: string[] = [];
    for (const url of urls) {
      try {
        const data = await fetchAsBase64(url);
        base64Images.push(data);
        console.log(`  ✓ ${data.length.toLocaleString()} chars`);
      } catch (err: any) {
        console.warn(`  ✗ Failed: ${err.message} — skipping`);
      }
    }

    if (base64Images.length === 0) {
      console.warn(`  No images for product #${id}, skipping\n`);
      continue;
    }

    const imageUrl = base64Images[0];
    const imagesJson = JSON.stringify(base64Images);

    await db.query(
      "UPDATE products SET image_url = $1, images = $2 WHERE id = $3",
      [imageUrl, imagesJson, id],
    );
    console.log(`  → Saved ${base64Images.length} image(s) to DB\n`);
  }

  console.log("Done!");
  await db.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
