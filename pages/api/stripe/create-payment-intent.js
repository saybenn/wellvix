// Key changes: remove transfer_data + application_fee_amount
// Add transfer_group (handy for reconciliation)
import env from "@/lib/env-server";
import { stripe } from "@/lib/stripe";
import { getOrderById, updateOrder } from "@/lib/orders-store";
import { getProviderById } from "@/lib/providers-store";
import { rateLimit } from "@/lib/rate-limit";

export default async function handler(req, res) {
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed" });

  const rl = await rateLimit(req, { limit: 5, windowMs: 60_000 });
  if (!rl.ok)
    return res
      .status(429)
      .json({ error: "Too many attempts. Please wait a minute." });

  try {
    const { orderId } = req.body || {};
    if (!orderId) return res.status(400).json({ error: "orderId required" });

    const order = await getOrderById(orderId);
    if (!order) return res.status(404).json({ error: "Order not found" });
    if (order.status !== "accepted")
      return res.status(409).json({
        error: `Payment allowed only after provider acceptance (current: ${order.status})`,
      });

    const provider = await getProviderById(order.providerId);
    if (!provider) return res.status(400).json({ error: "Provider not found" });

    if (!provider?.stripeAccountId)
      return res
        .status(400)
        .json({ error: "Provider missing stripeAccountId" });

    const amount = order.priceCents ?? 0;
    if (amount <= 0)
      return res.status(400).json({ error: "Invalid priceCents" });

    const currency = (
      order.currency ||
      provider.defaultCurrency ||
      "usd"
    ).toLowerCase();

    const params = {
      amount,
      currency,
      automatic_payment_methods: { enabled: true },
      metadata: { orderId: order.id, providerId: order.providerId },
      transfer_group: `order_${order.id}`, // used later when creating Transfer
    };

    const paymentIntent = order.stripePaymentIntentId
      ? await stripe.paymentIntents.retrieve(order.stripePaymentIntentId)
      : await stripe.paymentIntents.create(params, {
          idempotencyKey: `pi_${order.id}`,
        });

    if (!order.stripePaymentIntentId) {
      await updateOrder(order.id, {
        stripePaymentIntentId: paymentIntent.id,
        currency,
        // store planned fee for accounting, but DO NOT transfer now
        applicationFeeCents: Math.round(
          (amount * Number(env.WELLVIX_PLATFORM_FEE_PERCENT)) / 100
        ),
      });
    }

    res.status(200).json({ clientSecret: paymentIntent.client_secret });
  } catch (e) {
    console.error("create-payment-intent error", e);
    res.status(500).json({ error: "Internal error" });
  }
}
