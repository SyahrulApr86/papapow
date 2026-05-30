# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Setup (first time)
cp .env.example .env
docker compose up -d          # starts postgres + minio (bucket auto-created)
npm install

# Migrate existing base64 images to MinIO (run once after first docker compose up)
npx tsx scripts/migrate-images.ts

# Dev
npm run dev          # http://localhost:3000 (or 3001 if busy)
npm run build
npm run lint
```

No test framework is configured.

## Architecture

Next.js 16 (App Router) + PostgreSQL via raw `pg` (no ORM). All data access is server-side only.

**Data layer** (`lib/`)
- `db.ts` — Prisma client singleton (global to survive HMR)
- `catalog.ts` — all read queries (`getProducts`, `getFeaturedProducts`, `getProductById`, `getBanners`) + `formatRupiah` (IDR formatter)
- `storage.ts` — S3-compatible upload (`uploadImage`, `uploadBuffer`, `deleteImage`); works with MinIO locally and R2 in prod
- `admin-auth.ts` — cookie-based session auth using SHA-256 HMAC; password and secret from env

**Routes**
- `/` — homepage: hero banner, featured products grid, full catalog, bottom banner (all SSR)
- `/products/[id]` — product detail page (SSR)
- `/admin` — full CRUD panel for products and banners; protected by `isAdmin()` check at render time

**Server Actions** (`app/admin/actions.ts`) — `createProduct`, `updateProduct`, `deleteProduct`, `updateBanner`, `loginAction`, `logoutAction`. Each mutating action calls `revalidatePath("/")` and `revalidatePath("/admin")`.

**Database**
- Postgres on host port `55432` (avoids conflict with local installs)
- Schema + seed: `db/init.sql` (auto-run by Docker on first start)
- Migrations: `db/migrate.sql`
- `price` and `compare_at_price` stored as integers (IDR, no decimals)
- `images` and `sizes` columns are JSONB arrays

## Environment

| Var | Dev default | Notes |
|-----|-------------|-------|
| `DATABASE_URL` | `postgres://papapow:papapow@localhost:55432/papapow` | |
| `ADMIN_PASSWORD` | `papapow` | Change before production |
| `ADMIN_SESSION_SECRET` | `papapow-dev-secret` | Change before production |
| `STORAGE_ENDPOINT` | `http://localhost:9000` | MinIO dev; R2: `https://<account>.r2.cloudflarestorage.com` |
| `STORAGE_ACCESS_KEY_ID` | `papapow` | MinIO root user |
| `STORAGE_SECRET_ACCESS_KEY` | `papapow123` | MinIO root password |
| `STORAGE_BUCKET` | `papapow` | |
| `STORAGE_PUBLIC_URL` | `http://localhost:9000/papapow` | Public base URL for served images |
| `STORAGE_FORCE_PATH_STYLE` | `true` | Must be `true` for MinIO; `false` for R2 |
| `STORAGE_REGION` | `us-east-1` | Use `auto` for R2 |

Admin session cookie (`papapow_admin`) is `httpOnly`, `sameSite: lax`, 8-hour TTL.

## Object Storage

- Dev: MinIO runs on `localhost:9000` (S3 API) and `localhost:9001` (web console, login: `papapow` / `papapow123`)
- Prod: Cloudflare R2 — set `STORAGE_FORCE_PATH_STYLE=false`, `STORAGE_REGION=auto`
- Images uploaded via admin panel go to `products/` or `banners/` prefix in the bucket
- Migration script: `npx tsx scripts/migrate-images.ts` — extracts base64 images from DB and re-uploads to storage
