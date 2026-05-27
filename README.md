# PAPAPOW Catalog

Next.js catalog UI for PAPAPOW with PostgreSQL-backed admin panel.

## Run

```bash
cp .env.example .env
docker compose up -d postgres
npm install
npm run dev
```

Open `http://localhost:3001` if port `3000` is busy.

## Admin

Open `/admin`.

Default dev password: `papapow`

Change these before production:

```env
ADMIN_PASSWORD=change-this-password
ADMIN_SESSION_SECRET=change-this-secret
```

Database uses host port `55432` to avoid common local PostgreSQL conflicts.
