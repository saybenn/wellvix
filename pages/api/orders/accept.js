// /pages/api/orders/accept.js
// Transition 'paid' -> 'in_progress' when provider accepts/starts.
// NOTE: No transfer is created here (we pay on completion).
// TODO AuthZ: verify the requester owns the order's providerId (Supabase RLS).
import { getOrderById, setOrderStatus, updateOrder } from "@/lib/orders-store";

export default async function handler(req, res) {
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed" });
  try {
    const { orderId, eta } = req.body || {};
    if (!orderId) return res.status(400).json({ error: "orderId required" });

    // TODO Supabase: fetch order by id scoped to provider/session
    const order = await getOrderById(orderId);
    if (!order) return res.status(404).json({ error: "Order not found" });

    if (order.status !== "paid") {
      return res
        .status(409)
        .json({ error: `Order must be 'paid' (current: ${order.status})` });
    }

    const now = new Date().toISOString();
    // Optional ETA supplied by provider
    await updateOrder(orderId, { acceptedAt: now, eta: eta || null });
    await setOrderStatus(orderId, "in_progress");

    return res.status(200).json({ ok: true, acceptedAt: now });
  } catch (e) {
    console.error("accept error", e);
    return res.status(500).json({ error: "Internal error" });
  }
}
