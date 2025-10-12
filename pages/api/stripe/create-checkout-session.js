// /pages/api/stripe/create-checkout-session.js
import { stripe } from "@/lib/stripe";
import { getOrderById, updateOrder } from "@/lib/orders-store";
import { getProviderById } from "@/lib/providers-store";

export default async function handler(req, res) {
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed" });

  try {
    const { orderId } = req.body || {};
    if (!orderId) return res.status(400).json({ error: "orderId required" });

    const order = await getOrderById(orderId);
    if (!order) return res.status(404).json({ error: "Order not found" });
    if (order.status !== "draft")
      return res.status(409).json({ error: `Order is ${order.status}` });

    const provider = await getProviderById(order.providerId);
    if (!provider) return res.status(400).json({ error: "Provider not found" });

    if (!provider.stripeAccountId) {
      return res
        .status(400)
        .json({ error: "Provider missing stripeAccountId (Connect). " });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL;
    if (!appUrl)
      return res.status(500).json({ error: `Missing ${NEXT_PUBLIC_APP_URL}` });

    const currency = (order.currency || "usd").toLowerCase();
    const subtotal = order.priceCents ?? 0;
    if (subtotal <= 0)
      return res.status(400).json({ error: "Invalid priceCents" });

    // Platform fee: simple example 10%
    const platformFeePercent = Number(
      process.env.WELLVIX_PLATFORM_FEE_PERCENT || 10
    );
    const application_fee_amount = Math.round(
      (subtotal * platformFeePercent) / 100
    );

    const line_items = (
      order.lineItems || [
        {
          name: "Service",
          description: "",
          unitAmount: subtotal,
          quantity: 1,
        },
      ]
    ).map((li) => ({
      quantity: li.quantity,
      price_data: {
        currency,
        unit_amount: li.unitAmount,
        product_data: {
          name: li.name,
          description: li.description || "",
          metadata: { orderId: order.id },
        },
      },
    }));

    const session = await stripe.checkout.sessions.create(
      {
        mode: "payment",
        payment_intent_data: {
          application_fee_amount,
          transfer_data: { destination: provider.stripeAccountId },
          metadata: { orderId: order.id },
        },
        customer_email: null, // TODO Supabase: inject client's email
        line_items,
        success_url: `${appUrl}/checkout/success?orderId=${encodeURIComponent(
          order.id
        )}`,
        cancel_url: `${appUrl}/checkout/cancel?orderId=${encodeURIComponent(
          order.id
        )}`,
        metadata: { orderId: order.id },
        allow_promotion_codes: true,
      },
      { idempotencyKey: `checkout_${order.id}` }
    );

    // Save checkout id (dev store)
    await updateOrder(order.id, { stripeCheckoutId: session.id });

    return res.status(200).json({ id: session.id, url: session.url });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Internal error" });
  }
}

/*
  // TODO Supabase/Prisma:
  // - Use Prisma client or Supabase JS to read Order + Provider, and to update stripeCheckoutId on Order.
*/
