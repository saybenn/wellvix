import { store } from "./_store";

/**
 * GET: /api/bookings/availability?providerId=...
 * POST: body { providerId, availability }
 *
 * TODO(Supabase):
 * - Upsert rows in ProviderAvailability.
 * - RLS: only provider can write their availability.
 */
export default async function handler(req, res) {
  const { method } = req;
  if (method === "GET") {
    const { providerId } = req.query;
    if (!providerId)
      return res.status(400).json({ error: "providerId required" });
    return res.json({ availability: store.availability[providerId] || {} });
  }
  if (method === "POST") {
    const { providerId, availability } = req.body || {};
    if (!providerId || !availability)
      return res.status(400).json({ error: "missing_fields" });
    store.availability[providerId] = availability; // demo only
    return res.json({ ok: true });
  }
  return res.status(405).json({ error: "Method not allowed" });
}
