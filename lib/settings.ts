import { unstable_cache } from "next/cache";
import { db } from "@/lib/db";

export const getSetting = unstable_cache(
  async (key: string, fallback = ""): Promise<string> => {
    const row = await db.siteSetting.findUnique({ where: { key } });
    return row?.value ?? fallback;
  },
  ["settings"],
  { tags: ["settings"] },
);

export async function setSetting(key: string, value: string): Promise<void> {
  await db.siteSetting.upsert({
    where: { key },
    update: { value },
    create: { key, value },
  });
}
