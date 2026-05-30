import { db } from "@/lib/db";

export async function getSetting(key: string, fallback = ""): Promise<string> {
  const row = await db.siteSetting.findUnique({ where: { key } });
  return row?.value ?? fallback;
}

export async function setSetting(key: string, value: string): Promise<void> {
  await db.siteSetting.upsert({
    where: { key },
    update: { value },
    create: { key, value },
  });
}
