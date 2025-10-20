// /pages/api/bookings/exceptions.js
import { store } from "./_store";

/**
 * GET  /api/bookings/exceptions?providerId=...
 * POST /api/bookings/exceptions  { providerId, exceptions }
 * DELETE /api/bookings/exceptions?providerId=...&date=YYYY-MM-DD
 */
export default async function handler(req, res) {
  const { method } = req;

  if (method === "GET") {
    const { providerId } = req.query;
    if (!providerId)
      return res.status(400).json({ error: "providerId required" });
    return res.json({ exceptions: store.exceptions[providerId] || {} });
  }

  if (method === "POST") {
    const { providerId, exceptions } = req.body || {};
    if (!providerId || !exceptions)
      return res.status(400).json({ error: "Missing fields" });
    store.exceptions[providerId] = exceptions;
    return res.json({ ok: true });
  }

  if (method === "DELETE") {
    const { providerId, date } = req.query;
    if (!providerId || !date)
      return res.status(400).json({ error: "providerId and date required" });
    const map = store.exceptions[providerId] || {};
    if (map[date]) delete map[date];
    store.exceptions[providerId] = map;
    return res.json({ ok: true });
  }

  return res.status(405).json({ error: "Method not allowed" });
}
