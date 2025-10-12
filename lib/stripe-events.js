// /lib/stripe-events.js
// Dev JSON idempotency store; replace with DB table ProcessedStripeEvent
import fs from "fs/promises";
import path from "path";
const DATA_PATH = path.join(process.cwd(), "data", "stripe-events.json");

async function readFileSafe() {
  try {
    const t = await fs.readFile(DATA_PATH, "utf8");
    return JSON.parse(t);
  } catch {
    return [];
  }
}

export async function isEventProcessed(eventId) {
  const arr = await readFileSafe();
  return arr.some((e) => e.eventId === eventId);
}

export async function markEventProcessed({ id, type }) {
  const arr = await readFileSafe();
  arr.push({ eventId: id, type, receivedAt: new Date().toISOString() });
  await fs.writeFile(DATA_PATH, JSON.stringify(arr, null, 2), "utf8");
}

/*
  // TODO Supabase/Prisma:
  // INSERT INTO "ProcessedStripeEvent"(eventId, type) ON CONFLICT DO NOTHING;
*/
