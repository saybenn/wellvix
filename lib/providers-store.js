// /lib/providers-store.js
// Dev-only JSON provider store. Replace with Prisma/Supabase in prod.
// TODO Supabase: select from 'Provider' or a view by slug/id.

import fs from "fs/promises";
import path from "path";

const DATA_PATH = path.join(process.cwd(), "data", "providers.json");

async function readProviders() {
  const buf = await fs.readFile(DATA_PATH, "utf8");
  return JSON.parse(buf);
}

export async function getProviderById(id) {
  const all = await readProviders();
  return all.find((p) => p.id === id) || null;
}

export async function getProviderBySlug(slug) {
  const all = await readProviders();
  return all.find((p) => p.slug === slug) || null;
}
