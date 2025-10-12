// /lib/orders-store.js
// DEV JSON STORE for Orders — safe to use in local/dev. Swap to Supabase in prod.
// Uses atomic writes to prevent partial files.
// TODO: Supabase — replace read/write helpers with DB queries guarded by RLS.

import fs from "fs/promises";
import path from "path";

const DATA_PATH = path.join(process.cwd(), "data", "orders.json");

/** ---------- low-level io helpers ---------- **/
async function readOrdersFile() {
  try {
    const raw = await fs.readFile(DATA_PATH, "utf8");
    const data = JSON.parse(raw);
    if (!Array.isArray(data)) return [];
    return data;
  } catch (e) {
    if (e.code === "ENOENT") return []; // no file yet
    console.error("orders-store read error:", e);
    return [];
  }
}

async function writeOrdersFile(orders) {
  // Atomic write: write to tmp then rename
  const tmpPath = DATA_PATH + ".tmp";
  const json = JSON.stringify(orders, null, 2);
  await fs.mkdir(path.dirname(DATA_PATH), { recursive: true });
  await fs.writeFile(tmpPath, json, "utf8");
  await fs.rename(tmpPath, DATA_PATH);
}

/** Merge shallow patch into object */
function mergePatch(obj, patch) {
  const out = { ...obj };
  for (const k of Object.keys(patch || {})) {
    out[k] = patch[k];
  }
  return out;
}

/** Normalize date fields to ISO if Date was passed */
function toISO(x) {
  if (!x) return x;
  if (x instanceof Date) return x.toISOString();
  return x;
}

/** ---------- public api ---------- **/

/**
 * List orders with optional filters and sorting.
 * @param {Object} opts
 * @param {string=} opts.status        e.g., "draft" | "paid" | "in_progress" | ...
 * @param {string=} opts.providerId
 * @param {string=} opts.clientId
 * @param {number=} opts.limit         default 100
 * @param {string=} opts.sort          "-createdAt" (default), "createdAt", "-updatedAt", "price"
 */
export async function listOrders(opts = {}) {
  const {
    status,
    providerId,
    clientId,
    limit = 100,
    sort = "-createdAt",
  } = opts;

  const all = await readOrdersFile();

  // Filter
  let out = all;
  if (status) out = out.filter((o) => o.status === status);
  if (providerId) out = out.filter((o) => o.providerId === providerId);
  if (clientId) out = out.filter((o) => o.clientId === clientId);

  // Sort
  out = [...out];
  const dir = sort.startsWith("-") ? -1 : 1;
  const key = sort.replace(/^-/, "") || "createdAt";
  out.sort((a, b) => {
    const av = a?.[key];
    const bv = b?.[key];
    // dates or strings
    if (typeof av === "string" && typeof bv === "string") {
      return av.localeCompare(bv) * dir;
    }
    // numbers
    if (typeof av === "number" && typeof bv === "number") {
      return (av - bv) * dir;
    }
    // fallback: createdAt
    const ad = a?.createdAt || "";
    const bd = b?.createdAt || "";
    return ad.localeCompare(bd) * dir;
  });

  // Limit
  return out.slice(0, Math.max(0, limit));
}

/**
 * Get a single order by id.
 * @param {string} id
 */
export async function getOrderById(id) {
  if (!id) return null;
  const all = await readOrdersFile();
  return all.find((o) => o.id === id) || null;
}

/**
 * Update an order by id (shallow patch). Sets updatedAt automatically.
 * Returns updated order.
 * @param {string} id
 * @param {Object} patch
 */
export async function updateOrder(id, patch = {}) {
  const all = await readOrdersFile();
  const idx = all.findIndex((o) => o.id === id);
  if (idx === -1) throw new Error("Order not found");

  const current = all[idx] || {};
  const stamped = {
    ...mergePatch(current, patch),
    // normalize timestamps if Date objects were passed
    updatedAt: new Date().toISOString(),
    paidAt: toISO(patch.paidAt) ?? current.paidAt,
    acceptedAt: toISO(patch.acceptedAt) ?? current.acceptedAt,
    completedAt: toISO(patch.completedAt) ?? current.completedAt,
    eta: toISO(patch.eta) ?? current.eta,
  };

  all[idx] = stamped;
  await writeOrdersFile(all);
  return stamped;
}

/**
 * Set order status (also bumps updatedAt).
 * @param {string} id
 * @param {"draft"|"paid"|"in_progress"|"delivered"|"completed"|"refunded"|"cancelled"} status
 */
export async function setOrderStatus(id, status) {
  return updateOrder(id, { status });
}

/**
 * (Optional) Create a new order — handy for manual dev seeding.
 * Ensures minimal fields and timestamps are set.
 */
export async function createOrder(input) {
  const all = await readOrdersFile();
  const now = new Date().toISOString();
  const id = input?.id || `ord_${Math.random().toString(36).slice(2, 10)}`;

  const order = {
    id,
    clientId: input?.clientId ?? null,
    providerId: input?.providerId,
    providerServiceId: input?.providerServiceId ?? null,
    status: input?.status ?? "draft",
    brief: input?.brief ?? null,
    priceCents: input?.priceCents ?? 0,
    currency: (input?.currency || "usd").toLowerCase(),
    applicationFeeCents: input?.applicationFeeCents ?? null,
    stripePaymentIntentId: input?.stripePaymentIntentId ?? null,
    stripeTransferId: input?.stripeTransferId ?? null,
    refundStatus: input?.refundStatus ?? "none",
    paidAt: toISO(input?.paidAt) ?? null,
    acceptedAt: toISO(input?.acceptedAt) ?? null,
    completedAt: toISO(input?.completedAt) ?? null,
    eta: toISO(input?.eta) ?? null,
    createdAt: input?.createdAt ?? now,
    updatedAt: now,
    // Pass-through: allows custom fields like lineItems
    ...input,
  };

  // Ensure no duplicates
  const exists = all.find((o) => o.id === id);
  if (exists) throw new Error(`Order with id ${id} already exists`);

  all.push(order);
  await writeOrdersFile(all);
  return order;
}

/** ---------- Supabase migration notes (TODO) ----------
 * - Replace readOrdersFile/writeOrdersFile with Supabase queries:
 *   - listOrders: SELECT * FROM public."Order" WHERE ... ORDER BY createdAt DESC LIMIT $limit
 *   - getOrderById: SELECT * FROM public."Order" WHERE id = $1
 *   - updateOrder: UPDATE public."Order" SET ... , "updatedAt" = now() WHERE id = $1
 *   - setOrderStatus: UPDATE public."Order" SET status = $2, "updatedAt" = now() WHERE id = $1
 * - Enforce RLS so only the order owner/provider can read/write appropriate rows.
 * - Keep the same function signatures so your API routes do not change.
 * ----------------------------------------------------- */
