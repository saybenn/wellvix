// /lib/services-store.js
// Dev JSON reader for provider services pricing. TODO: Supabase in prod.
import fs from "fs/promises";
import path from "path";

const DATA_PATH = path.join(process.cwd(), "data", "provider_services.json");

export async function getServiceById(serviceId) {
  try {
    const raw = await fs.readFile(DATA_PATH, "utf8");
    const arr = JSON.parse(raw);
    return arr.find((s) => s.id === serviceId) || null;
  } catch {
    return null;
  }
}

export async function getServicesForProvider(providerId) {
  try {
    const raw = await fs.readFile(DATA_PATH, "utf8");
    const arr = JSON.parse(raw);
    return arr.filter((s) => s.provider_id === providerId && s.active);
  } catch {
    return [];
  }
}
