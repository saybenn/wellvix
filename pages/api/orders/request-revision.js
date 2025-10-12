// /pages/api/orders/request-revision.js
// Client asks for changes: delivered -> in_progress, track a revision counter.
// TODO AuthZ (Supabase): ensure requester is the order's client or admin.
import { getOrderById, setOrderStatus, updateOrder } from "@/lib/orders-store";

export default async function handler(req, res) {
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed" });

  try {
    const { orderId, note } = req.body || {};
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
      revisionNote: note || null,
      // Optionally keep a log: revisionHistory: [...(order.revisionHistory||[]), { at: new Date().toISOString(), note }]
    });
    await setOrderStatus(orderId, "in_progress");

    // TODO: Notifications
    // - Email provider with revision notes; include link back to order thread

    return res.status(200).json({ ok: true, revisionCount });
  } catch (e) {
    console.error("request-revision error", e);
    return res.status(500).json({ error: "Internal error" });
  }
}
