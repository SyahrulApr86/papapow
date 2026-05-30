-- Drop legacy columns that stored images as base64 strings.
-- Data has been migrated to object storage (R2/MinIO).
-- main_image, hover_image, and product_images table are the canonical source.
ALTER TABLE "products" DROP COLUMN IF EXISTS "image_url";
ALTER TABLE "products" DROP COLUMN IF EXISTS "images";
