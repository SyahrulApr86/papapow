import { Pool } from "pg";

declare global {
  // eslint-disable-next-line no-var
  var papapowPool: Pool | undefined;
}

const connectionString =
  process.env.DATABASE_URL ?? "postgres://papapow:papapow@localhost:55432/papapow";

export const db =
  globalThis.papapowPool ??
  new Pool({
    connectionString,
  });

if (process.env.NODE_ENV !== "production") {
  globalThis.papapowPool = db;
}

export type Product = {
  id: number;
  name: string;
  category: string;
  price: number;
  compare_at_price: number | null;
  discount_label: string | null;
  image_url: string;
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
