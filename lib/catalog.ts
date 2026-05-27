import { db, type Banner, type Product } from "@/lib/db";

export async function getProducts() {
  const { rows } = await db.query<Product>(
    `SELECT id, name, category, price, compare_at_price, discount_label, image_url, is_featured, sort_order
     FROM products
     ORDER BY sort_order ASC, id ASC`,
  );

  return rows;
}

export async function getFeaturedProducts() {
  const { rows } = await db.query<Product>(
    `SELECT id, name, category, price, compare_at_price, discount_label, image_url, is_featured, sort_order
     FROM products
     WHERE is_featured = true
     ORDER BY sort_order ASC, id ASC
     LIMIT 8`,
  );

  return rows;
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
