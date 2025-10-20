// /pages/api/orders/brief.js
// Dev endpoint to attach digital brief: ETA, notes, and file URLs.
// TODO(Supabase Storage): upload files and write OrderFile rows.

import { getOrderById, updateOrder } from "@/lib/orders-store";

export default async function handler(req, res) {
  if (req.method !== "POST")
    return res.status(405).json({
      ok: false,
      error: { code: "method_not_allowed", message: "Method not allowed" },
    });

  const { orderId, etaIso, notes, files } = req.body || {};
  if (!orderId)
    return res.status(400).json({
      ok: false,
      error: { code: "missing_order", message: "orderId required" },
    });

  const order = await getOrderById(orderId);
  if (!order)
    return res.status(404).json({
      ok: false,
      error: { code: "not_found", message: "Order not found" },
    });

  const patch = {
    eta: etaIso || order.eta || null,
    brief: { ...(order.brief || {}), notes: notes || "" },
    deliveryFiles: Array.isArray(files) ? files : null,
  };

  const updated = await updateOrder(orderId, patch);
  return res.json({ ok: true, data: { order: updated } });
}
