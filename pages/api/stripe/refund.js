// /pages/api/stripe/refund.js
// Admin-only: create partial/full refund. Updates refundStatus; relies on Stripe webhooks for final reconciliations.
// TODO AuthZ: restrict to admin; log reason/actor.
import { stripe } from "@/lib/stripe";
import { getOrderById, updateOrder } from "@/lib/orders-store";

export default async function handler(req, res) {
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed" });
  try {
    const { orderId, amountCents } = req.body || {};
    if (!orderId) return res.status(400).json({ error: "orderId required" });

    const order = await getOrderById(orderId);
    if (!order || !order.stripePaymentIntentId)
      return res.status(404).json({ error: "Order or payment not found" });

    // Retrieve the charge from the PI
    const pi = await stripe.paymentIntents.retrieve(
      order.stripePaymentIntentId,
      { expand: ["charges"] }
    );
    const chargeId = pi?.charges?.data?.[0]?.id;
    if (!chargeId) return res.status(400).json({ error: "Charge not found" });

    const refund = await stripe.refunds.create({
      charge: chargeId,
      amount: amountCents || undefined, // optional for full refund
      metadata: { orderId: order.id },
    });

    await updateOrder(orderId, {
      refundStatus: amountCents ? "partial" : "refunded",
    });
    res.status(200).json({ ok: true, refundId: refund.id });
  } catch (e) {
    console.error("refund error", e);
    res.status(500).json({ error: "Internal error" });
  }
}
