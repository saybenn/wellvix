// /pages/api/cron/auto-complete.js
// Auto-complete delivered orders after REVIEW_WINDOW_DAYS and release payout.
// Protect with a secret or platform-only auth in production.

import config from "@/lib/config";
import {
  listOrders,
  getOrderById,
  updateOrder,
  setOrderStatus,
} from "@/lib/orders-store";
import { performPayout } from "@/lib/payouts";

export default async function handler(req, res) {
  if (req.method !== "POST" && req.method !== "GET")
    return res.status(405).json({ error: "Method not allowed" });

  try {
    const delivered = await listOrders({
      status: "delivered",
      limit: 500,
      sort: "-deliveredAt",
    });
    const now = Date.now();
    const msWindow = (config.REVIEW_WINDOW_DAYS ?? 7) * 24 * 60 * 60 * 1000;

    const candidates = delivered.filter((o) => {
      const ts = o.deliveredAt ? new Date(o.deliveredAt).getTime() : 0;
      return ts && now - ts >= msWindow;
    });

    const results = [];
    for (const ord of candidates) {
      try {
        const order = await getOrderById(ord.id);
        // Double-check still delivered (idempotent safety)
        if (!order || order.status !== "delivered") continue;

        const { transferId, feeCents, netCents, currency } =
          await performPayout(order);
        const completedAt = new Date().toISOString();

        await updateOrder(order.id, {
          stripeTransferId: transferId,
          applicationFeeCents: feeCents,
          completedAt,
          autoCompleted: true,
        });
        await setOrderStatus(order.id, "completed");

        results.push({
          orderId: order.id,
          ok: true,
          transferId,
          netCents,
          feeCents,
          currency,
        });
      } catch (err) {
        results.push({
          orderId: ord.id,
          ok: false,
          error: err?.message || "unknown",
        });
      }
    }

    return res.status(200).json({ ok: true, count: results.length, results });
  } catch (e) {
    console.error("auto-complete error:", e);
    return res.status(500).json({ error: "Internal error" });
  }
}
