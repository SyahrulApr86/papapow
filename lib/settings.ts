import { db } from "@/lib/db";

export async function getSetting(key: string, fallback = ""): Promise<string> {
  const { rows } = await db.query<{ value: string }>(
    "SELECT value FROM site_settings WHERE key = $1",
    [key],
  );
  return rows[0]?.value ?? fallback;
}

export async function setSetting(key: string, value: string): Promise<void> {
  await db.query(
    `INSERT INTO site_settings (key, value) VALUES ($1, $2)
     ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value`,
    [key, value],
  );
}
