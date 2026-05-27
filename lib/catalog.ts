import { db, type Banner, type Product } from "@/lib/db";

const productColumns = `id, name, category, price, compare_at_price,
  discount_label, image_url, images, sizes, description, material, weight,
  is_featured, sort_order`;

function parseProduct(row: any): Product {
  return {
    ...row,
    images: typeof row.images === "string" ? JSON.parse(row.images) : row.images ?? [],
    sizes: typeof row.sizes === "string" ? JSON.parse(row.sizes) : row.sizes ?? [],
  };
}

export async function getProducts() {
  const { rows } = await db.query<Product>(
    `SELECT ${productColumns}
     FROM products
     ORDER BY sort_order ASC, id ASC`,
  );

  return rows.map(parseProduct);
}

export async function getFeaturedProducts() {
  const { rows } = await db.query<Product>(
    `SELECT ${productColumns}
     FROM products
     WHERE is_featured = true
     ORDER BY sort_order ASC, id ASC
     LIMIT 8`,
  );

  return rows.map(parseProduct);
}

export async function getProductById(id: number) {
  const { rows } = await db.query<Product>(
    `SELECT ${productColumns}
     FROM products
     WHERE id = $1`,
    [id],
  );

  return rows.length ? parseProduct(rows[0]) : null;
}

export async function getBanners() {
  const { rows } = await db.query<Banner>(
    `SELECT id, title, subtitle, image_url, cta_label, cta_href, placement, sort_order
     FROM banners
     ORDER BY sort_order ASC, id ASC`,
  );

  return rows;
}

export function formatRupiah(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  })
    .format(value)
    .replace("IDR", "Rp");
}
