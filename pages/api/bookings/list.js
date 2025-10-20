// /pages/api/bookings/list.js
import { store } from "./_store";

export default function handler(req, res) {
  if (req.method !== "GET")
    return res.status(405).json({
      ok: false,
      error: { code: "method_not_allowed", message: "Method not allowed" },
    });
  const { providerId, status } = req.query;
  if (!providerId)
    return res.status(400).json({
      ok: false,
      error: { code: "provider_required", message: "providerId required" },
    });

  let rows = store.bookings.filter((b) => b.providerId === providerId);
  if (status) rows = rows.filter((b) => b.status === status);

  return res.json({ ok: true, data: { rows } });
}
