// /pages/api/orders/deliver.js
// Provider marks work delivered. Moves: accepted -> delivered.
// Saves a note and optional file URLs.
// TODO AuthZ: ensure requester is the provider on this order (Supabase RLS later).

import { getOrderById, setOrderStatus, updateOrder } from "@/lib/orders-store";
// ^ Dev JSON store. TODO Supabase: replace with DB queries.

export default async function handler(req, res) {
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed" });

  try {
    const { orderId, note, message, files } = req.body || {};
    if (!orderId) return res.status(400).json({ error: "orderId required" });

    const order = await getOrderById(orderId);
    if (!order) return res.status(404).json({ error: "Order not found" });

    const isAccepted = order.status === "accepted";
    const isPaid = !!order.paidAt;

    if (!(isAccepted && isPaid)) {
      return res.status(409).json({
        error:
          `Delivery allowed only after acceptance and payment ` +
          `(current: status=${order.status}, paid=${Boolean(order.paidAt)})`,
      });
    }

    const deliveredAt = new Date().toISOString();
    await updateOrder(orderId, {
      deliveryNote: note || null,
      deliveryFiles: Array.isArray(files) ? files : [],
      deliveredAt,
    });
    await setOrderStatus(orderId, "delivered");
    // TODO: Notifications
    // - Resend email to client/admin with review CTA
    // - Twilio SMS (optional) to client for quick attention
    return res.status(200).json({ ok: true, deliveredAt });
  } catch (e) {
    console.error("deliver error:", e);
    return res.status(500).json({ error: "Internal error" });
  }
}
