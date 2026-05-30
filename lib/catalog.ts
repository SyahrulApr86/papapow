import { unstable_cache } from "next/cache";
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

export const getProducts = unstable_cache(
  async (): Promise<Product[]> => {
    const rows = await db.product.findMany({
      include: includeExtraImages,
      orderBy: [{ sort_order: "asc" }, { id: "asc" }],
    });
    return rows.map(toProduct);
  },
  ["products"],
  { tags: ["products"] },
);

export const getFeaturedProducts = unstable_cache(
  async (): Promise<Product[]> => {
    const rows = await db.product.findMany({
      where: { is_featured: true },
      include: includeExtraImages,
      orderBy: [{ sort_order: "asc" }, { id: "asc" }],
      take: 8,
    });
    return rows.map(toProduct);
  },
  ["products-featured"],
  { tags: ["products"] },
);

export const getProductById = unstable_cache(
  async (id: number): Promise<Product | null> => {
    const row = await db.product.findUnique({
      where: { id },
      include: includeExtraImages,
    });
    return row ? toProduct(row) : null;
  },
  ["product-by-id"],
  { tags: ["products"] },
);

export const getBanners = unstable_cache(
  async (): Promise<Banner[]> => {
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
  },
  ["banners"],
  { tags: ["banners"] },
);

export { formatRupiah } from "@/lib/format";
