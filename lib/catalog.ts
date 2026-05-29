import { db, type Banner, type Product } from "@/lib/db";

const productColumns = `
  p.id, p.name, p.category, p.price, p.compare_at_price,
  p.discount_label, p.image_url, p.main_image, p.hover_image,
  p.sizes, p.description, p.material, p.weight,
  p.is_featured, p.sort_order,
  COALESCE(
    (SELECT json_agg(pi.image_url ORDER BY pi.sort_order)
     FROM product_images pi WHERE pi.product_id = p.id),
    '[]'
  ) AS extra_images_json
`;

function parseProduct(row: any): Product {
  const sizes =
    typeof row.sizes === "string" ? JSON.parse(row.sizes) : row.sizes ?? [];
  const extraImages: string[] =
    typeof row.extra_images_json === "string"
      ? JSON.parse(row.extra_images_json)
      : row.extra_images_json ?? [];

  const images = [
    row.main_image,
    row.hover_image,
    ...extraImages,
  ].filter((u): u is string => Boolean(u));

  return {
    ...row,
    sizes,
    extra_images: extraImages,
    images,
    image_url: row.main_image || row.image_url || "",
  };
}

export async function getProducts() {
  const { rows } = await db.query(
    `SELECT ${productColumns}
     FROM products p
     ORDER BY p.sort_order ASC, p.id ASC`,
  );
  return rows.map(parseProduct);
}

export async function getFeaturedProducts() {
  const { rows } = await db.query(
    `SELECT ${productColumns}
     FROM products p
     WHERE p.is_featured = true
     ORDER BY p.sort_order ASC, p.id ASC
     LIMIT 8`,
  );
  return rows.map(parseProduct);
}

export async function getProductById(id: number) {
  const { rows } = await db.query(
    `SELECT ${productColumns}
     FROM products p
     WHERE p.id = $1`,
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

export { formatRupiah } from "@/lib/format";
