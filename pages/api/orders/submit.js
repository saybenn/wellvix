// /pages/api/orders/submit.js
// Client submits an order for provider review: draft -> awaiting_provider
// TODO AuthZ: ensure requester is the order's client (Supabase RLS).
import { getOrderById, setOrderStatus, updateOrder } from "@/lib/orders-store";

export default async function handler(req, res) {
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed" });
  try {
    const { orderId, brief } = req.body || {};
    if (!orderId) return res.status(400).json({ error: "orderId required" });

    const order = await getOrderById(orderId);
    if (!order) return res.status(404).json({ error: "Order not found" });
    if (order.status !== "draft") {
      return res
        .status(409)
        .json({ error: `Order must be 'draft' (current: ${order.status})` });
    }

    await updateOrder(orderId, { brief: brief ?? order.brief });
    await setOrderStatus(orderId, "awaiting_provider");
    return res.status(200).json({ ok: true });
  } catch (e) {
    console.error("submit error", e);
    return res.status(500).json({ error: "Internal error" });
  }
}
