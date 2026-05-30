import { PrismaClient } from "@prisma/client";

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

export const db = globalThis.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalThis.prisma = db;
}

export type Product = {
  id: number;
  name: string;
  category: string;
  price: number;
  compare_at_price: number | null;
  discount_label: string | null;
  main_image: string;
  hover_image: string | null;
  extra_images: string[];
  sizes: string[];
  description: string | null;
  material: string | null;
  weight: number | null;
  is_featured: boolean;
  sort_order: number;
};

export type Banner = {
  id: number;
  title: string;
  subtitle: string | null;
  image_url: string;
  cta_label: string | null;
  cta_href: string | null;
  placement: "hero" | "bottom";
  sort_order: number;
};
