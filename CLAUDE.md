# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Setup (first time)
cp .env.example .env
docker compose up -d postgres
npm install

# Dev
npm run dev          # http://localhost:3000 (or 3001 if busy)
npm run build
npm run lint
```

No test framework is configured.

## Architecture

Next.js 16 (App Router) + PostgreSQL via raw `pg` (no ORM). All data access is server-side only.

**Data layer** (`lib/`)
- `db.ts` — singleton `Pool` (global to survive HMR), type definitions for `Product` and `Banner`
- `catalog.ts` — all read queries (`getProducts`, `getFeaturedProducts`, `getProductById`, `getBanners`) + `formatRupiah` (IDR formatter)
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

| Var | Default | Notes |
|-----|---------|-------|
| `DATABASE_URL` | `postgres://papapow:papapow@localhost:55432/papapow` | |
| `ADMIN_PASSWORD` | `papapow` | Change before production |
| `ADMIN_SESSION_SECRET` | `papapow-dev-secret` | Change before production |

Admin session cookie (`papapow_admin`) is `httpOnly`, `sameSite: lax`, 8-hour TTL.
