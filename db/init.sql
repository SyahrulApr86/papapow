CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  price INTEGER NOT NULL,
  compare_at_price INTEGER,
  discount_label TEXT,
  image_url TEXT NOT NULL,
  is_featured BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS banners (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  subtitle TEXT,
  image_url TEXT NOT NULL,
  cta_label TEXT,
  cta_href TEXT,
  placement TEXT NOT NULL DEFAULT 'hero',
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO banners (title, subtitle, image_url, cta_label, cta_href, placement, sort_order)
VALUES
  ('PAPAPOW', 'Monochrome goods for daily motion.', 'https://images.unsplash.com/photo-1523398002811-999ca8dec234?auto=format&fit=crop&w=1800&q=90', NULL, NULL, 'hero', 1),
  ('CURATED DROP', 'Apparel and accessories in quiet contrast.', 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=1800&q=90', 'SEE ALL PRODUCT', '#catalog', 'bottom', 1)
ON CONFLICT DO NOTHING;

INSERT INTO products (name, category, price, compare_at_price, discount_label, image_url, is_featured, sort_order)
VALUES
  ('PAPAPOW - Boxy Oversize Tee - White Signal', 'Tshirt', 219000, 279000, '21%', 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=90', true, 1),
  ('PAPAPOW - Boxy Oversize Tee - Black Signal', 'Tshirt', 219000, 279000, '21%', 'https://images.unsplash.com/photo-1503341504253-dff4815485f1?auto=format&fit=crop&w=900&q=90', true, 2),
  ('PAPAPOW - Polo Shirt - White Pace', 'Polo', 279000, 349000, '20%', 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?auto=format&fit=crop&w=900&q=90', true, 3),
  ('PAPAPOW - Polo Shirt - Black Pace', 'Polo', 279000, 349000, '20%', 'https://images.unsplash.com/photo-1618354691551-44de113f0164?auto=format&fit=crop&w=900&q=90', true, 4),
  ('PAPAPOW - Utility Pants - Bone', 'Pants', 419000, 499000, '16%', 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&q=90', true, 5),
  ('PAPAPOW - Heavy Hoodie - Night', 'Outerwear', 419000, 499000, '16%', 'https://images.unsplash.com/photo-1578587018452-892bacefd3f2?auto=format&fit=crop&w=900&q=90', true, 6),
  ('PAPAPOW - Longsleeve Waffle - Grid', 'Longsleeve', 349000, 469000, '25%', 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=900&q=90', true, 7),
  ('PAPAPOW - Cap - Core Mark', 'Accessories', 175000, 209000, '16%', 'https://images.unsplash.com/photo-1521369909029-2afed882baee?auto=format&fit=crop&w=900&q=90', true, 8)
ON CONFLICT DO NOTHING;
