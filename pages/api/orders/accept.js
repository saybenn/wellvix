// /pages/api/orders/accept.js
// Provider accepts job: awaiting_provider -> accepted
// TODO AuthZ: ensure requester owns the order's providerId (Supabase RLS).
import { getOrderById, setOrderStatus, updateOrder } from "@/lib/orders-store";

export default async function handler(req, res) {
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed" });

  try {
    const { orderId, eta } = req.body || {};
    if (!orderId) return res.status(400).json({ error: "orderId required" });

    const order = await getOrderById(orderId);
    if (!order) return res.status(404).json({ error: "Order not found" });

    if (order.status !== "awaiting_provider") {
      return res.status(409).json({
        error: `Order must be 'awaiting_provider' (current: ${order.status})`,
      });
    }

    const now = new Date().toISOString();
    await updateOrder(orderId, { acceptedAt: now, eta: eta || null });
    await setOrderStatus(orderId, "accepted");

    return res.status(200).json({ ok: true, acceptedAt: now });
  } catch (e) {
    console.error("accept error", e);
    return res.status(500).json({ error: "Internal error" });
  }
}
