-- Refactor image storage: explicit main_image + hover_image on products,
-- separate product_images table for gallery extras (1-to-many)

-- 1. New columns on products
ALTER TABLE products ADD COLUMN IF NOT EXISTS main_image TEXT NOT NULL DEFAULT '';
ALTER TABLE products ADD COLUMN IF NOT EXISTS hover_image TEXT;

-- 2. Gallery table
CREATE TABLE IF NOT EXISTS product_images (
  id          SERIAL PRIMARY KEY,
  product_id  INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  image_url   TEXT NOT NULL,
  sort_order  INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS product_images_product_id_idx ON product_images(product_id);

-- 3. Migrate existing JSONB images array → new columns + rows
DO $$
DECLARE
  r    RECORD;
  imgs TEXT[];
  i    INTEGER;
BEGIN
  FOR r IN SELECT id, images FROM products WHERE images IS NOT NULL LOOP
    imgs := ARRAY(SELECT jsonb_array_elements_text(r.images));

    -- images[1] = main, images[2] = hover (1-indexed in PG arrays)
    UPDATE products
    SET
      main_image  = COALESCE(imgs[1], ''),
      hover_image = imgs[2],
      image_url   = COALESCE(imgs[1], image_url)
    WHERE id = r.id;

    -- images[3+] = extra gallery
    IF array_length(imgs, 1) >= 3 THEN
      FOR i IN 3..array_length(imgs, 1) LOOP
        INSERT INTO product_images (product_id, image_url, sort_order)
        VALUES (r.id, imgs[i], i - 3);
      END LOOP;
    END IF;
  END LOOP;
END $$;
