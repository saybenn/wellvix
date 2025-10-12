// /pages/api/orders/approve.js
// Reviewer (client/admin) approves the delivered work:
// delivered -> completed AND PAY PROVIDER via Stripe Transfer.
// Uses SK admin client to keep RK minimal.
//
// TODO AuthZ (Supabase): ensure requester is the order's client or an admin.
import env from "@/lib/env-server";
import { stripeConnectAdmin as stripe } from "@/lib/stripe-connect-admin";
import { getOrderById, setOrderStatus, updateOrder } from "@/lib/orders-store";
import { getProviderById } from "@/lib/providers-store";

function computeNet(amountCents, feeCents) {
  const amt = Number(amountCents || 0);
  const fee = Number(feeCents || 0);
  return Math.max(amt - fee, 0);
}

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

    const provider = await getProviderById(order.providerId);
    if (!provider?.stripeAccountId)
      return res
        .status(400)
        .json({ error: "Provider missing stripeAccountId" });

    const amount = Number(order.priceCents || 0);
    if (amount <= 0)
      return res.status(400).json({ error: "Invalid priceCents" });

    const feeCents =
      typeof order.applicationFeeCents === "number"
        ? order.applicationFeeCents
        : Math.round((amount * Number(env.WELLVIX_PLATFORM_FEE_PERCENT)) / 100);

    const net = computeNet(amount, feeCents);
    const currency = (
      order.currency ||
      provider.defaultCurrency ||
      "usd"
    ).toLowerCase();

    let transferId = order.stripeTransferId || null;
    if (!transferId) {
      try {
        const transfer = await stripe.transfers.create({
          amount: net,
          currency,
          destination: provider.stripeAccountId,
          transfer_group: `order_${order.id}`,
          metadata: { orderId: order.id, phase: "approve" },
        });
        transferId = transfer.id;
      } catch (err) {
        const code = err?.raw?.code || err?.code;
        const message = err?.raw?.message || err?.message || "Transfer failed";
        return res.status(409).json({ ok: false, error: message, code });
      }
    }

    const completedAt = new Date().toISOString();
    await updateOrder(orderId, {
      stripeTransferId: transferId,
      applicationFeeCents: feeCents,
      completedAt,
      approvedAt: completedAt,
    });
    await setOrderStatus(orderId, "completed");

    // TODO: Notifications
    // - Email/SMS: notify provider "Approved & Paid", notify client "Receipt/Confirmation"

    return res.status(200).json({
      ok: true,
      orderId,
      transferId,
      netCents: net,
      feeCents,
      currency,
      completedAt,
    });
  } catch (e) {
    console.error("approve error", e);
    return res.status(500).json({ error: "Internal error" });
  }
}
