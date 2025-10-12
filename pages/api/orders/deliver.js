// /pages/api/orders/deliver.js
// Provider signals work is ready for review: in_progress -> delivered (no payout).
// TODO AuthZ (Supabase): ensure requester owns the order's providerId.
import { getOrderById, setOrderStatus, updateOrder } from "@/lib/orders-store";

// NOTE: files will be stored in Supabase Storage later. For now we accept URLs.
export default async function handler(req, res) {
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed" });

  try {
    const { orderId, message, files } = req.body || {};
    if (!orderId) return res.status(400).json({ error: "orderId required" });

    const order = await getOrderById(orderId);
    if (!order) return res.status(404).json({ error: "Order not found" });
    if (order.status !== "in_progress") {
      return res.status(409).json({
        error: `Order must be 'in_progress' (current: ${order.status})`,
      });
    }

    const deliveredAt = new Date().toISOString();
    await updateOrder(orderId, {
      deliveredAt,
      deliveryNote: message || null,
      deliveryFiles: Array.isArray(files) ? files : null, // TODO: Supabase Storage upload + link OrderFile rows
    });
    await setOrderStatus(orderId, "delivered");

    // TODO: Notifications
    // - Resend email to client/admin with review CTA
    // - Twilio SMS (optional) to client for quick attention

    return res.status(200).json({ ok: true, deliveredAt });
  } catch (e) {
    console.error("deliver error", e);
    return res.status(500).json({ error: "Internal error" });
  }
}
