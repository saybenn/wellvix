// /pages/api/orders/request-revision.js
// Client requests changes. Moves: delivered -> accepted
// Increments revisionCount to track cycles.
// TODO AuthZ: ensure requester is the client on this order (Supabase RLS).

import { getOrderById, setOrderStatus, updateOrder } from "@/lib/orders-store";

export default async function handler(req, res) {
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed" });

  try {
    const { orderId, reason } = req.body || {};
    if (!orderId) return res.status(400).json({ error: "orderId required" });

    const order = await getOrderById(orderId);
    if (!order) return res.status(404).json({ error: "Order not found" });
    if (order.status !== "delivered") {
      return res.status(409).json({
        error: `Order must be 'delivered' (current: ${order.status})`,
      });
    }

    const revisionCount = Number(order.revisionCount || 0) + 1;
    await updateOrder(orderId, {
      revisionCount,
      revisionReason: reason || "",
      // Optional: clear deliveredAt if you want; keeping it can show the history
    });
    await setOrderStatus(orderId, "accepted");
    return res.status(200).json({ ok: true, revisionCount });
  } catch (e) {
    console.error("request-revision error:", e);
    return res.status(500).json({ error: "Internal error" });
  }
}
