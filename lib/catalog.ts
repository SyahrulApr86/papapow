import { db, type Banner, type Product } from "@/lib/db";

const includeExtraImages = {
  extra_images: { orderBy: { sort_order: "asc" as const } },
};

function toProduct(row: any): Product {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    price: row.price,
    compare_at_price: row.compare_at_price,
    discount_label: row.discount_label,
    main_image: row.main_image,
    hover_image: row.hover_image,
    extra_images: (row.extra_images ?? []).map((img: any) => img.image_url),
    sizes: Array.isArray(row.sizes) ? row.sizes : [],
    description: row.description,
    material: row.material,
    weight: row.weight,
    is_featured: row.is_featured,
    sort_order: row.sort_order,
  };
}

export async function getProducts(): Promise<Product[]> {
  const rows = await db.product.findMany({
    include: includeExtraImages,
    orderBy: [{ sort_order: "asc" }, { id: "asc" }],
  });
  return rows.map(toProduct);
}

export async function getFeaturedProducts(): Promise<Product[]> {
  const rows = await db.product.findMany({
    where: { is_featured: true },
    include: includeExtraImages,
    orderBy: [{ sort_order: "asc" }, { id: "asc" }],
    take: 8,
  });
  return rows.map(toProduct);
}

export async function getProductById(id: number): Promise<Product | null> {
  const row = await db.product.findUnique({
    where: { id },
    include: includeExtraImages,
  });
  return row ? toProduct(row) : null;
}

export async function getBanners(): Promise<Banner[]> {
  const rows = await db.banner.findMany({
    orderBy: [{ sort_order: "asc" }, { id: "asc" }],
  });
  return rows.map((r) => ({
    id: r.id,
    title: r.title,
    subtitle: r.subtitle,
    image_url: r.image_url,
    cta_label: r.cta_label,
    cta_href: r.cta_href,
    placement: r.placement as "hero" | "bottom",
    sort_order: r.sort_order,
  }));
}

export { formatRupiah } from "@/lib/format";
