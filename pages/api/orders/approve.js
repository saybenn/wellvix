// /pages/api/orders/approve.js
// Client accepts delivery. Moves: delivered -> completed
// Creates a Stripe Transfer (escrow release). If transfer fails, surface error and leave status as 'delivered' with error fields.
// TODO AuthZ: ensure requester is the client (Supabase RLS).

import config from "@/lib/config";
import { getOrderById, setOrderStatus, updateOrder } from "@/lib/orders-store";
import { performPayout } from "@/lib/payouts";

export default async function handler(req, res) {
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed" });

  try {
    const { orderId } = req.body || {};
    if (!orderId) return res.status(400).json({ error: "orderId required" });

    const order = await getOrderById(orderId);
    if (!order) return res.status(404).json({ error: "Order not found" });
    if (order.status !== "delivered") {
      return res.status(409).json({
        error: `Order must be 'delivered' (current: ${order.status})`,
      });
    }

    try {
      const { transferId, feeCents, netCents, currency } = await performPayout(
        order
      );
      const completedAt = new Date().toISOString();

      await updateOrder(orderId, {
        stripeTransferId: transferId,
        applicationFeeCents: feeCents,
        completedAt,
        autoCompleted: false,
        approvalErrorCode: null,
        approvalErrorAt: null,
      });
      await setOrderStatus(orderId, "completed");

      return res.status(200).json({
        ok: true,
        orderId,
        transferId,
        netCents,
        feeCents,
        currency,
        completedAt,
        reviewWindowDays: config.REVIEW_WINDOW_DAYS,
      });
    } catch (err) {
      // Do not change status; record error so admin can intervene/retry.
      const code = err?.raw?.code || err?.code || "transfer_failed";
      await updateOrder(orderId, {
        approvalErrorCode: code,
        approvalErrorAt: new Date().toISOString(),
      });
      return res
        .status(409)
        .json({ ok: false, error: err?.message || "Transfer failed", code });
    }
  } catch (e) {
    console.error("approve error:", e);
    return res.status(500).json({ error: "Internal error" });
  }
}
