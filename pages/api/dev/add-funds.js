// /pages/api/dev/add-funds.js
// DEV-ONLY: instantly adds funds to your PLATFORM test balance by creating
// and confirming a CARD-ONLY PaymentIntent (no redirects).
// DO NOT deploy this to production.
// TODO: remove or hard-gate with admin auth when moving to staging/prod.

import { stripe } from "@/lib/stripe"; // RK/SK payments client

export default async function handler(req, res) {
  if (process.env.NODE_ENV === "production") {
    return res.status(403).json({ error: "Not allowed in production" });
  }
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed" });

  try {
    const { amountCents = 25000, currency = "usd" } = req.body || {};
    const amt = Number(amountCents);
    if (!Number.isFinite(amt) || amt <= 0) {
      return res
        .status(400)
        .json({ error: "amountCents must be a positive integer" });
    }

    // Card-only, no redirects. Do NOT set automatic_payment_methods together with payment_method_types.
    const pi = await stripe.paymentIntents.create(
      {
        amount: amt,
        currency,
        payment_method_types: ["card"], // explicit card-only
        payment_method: "pm_card_visa", // instant test card
        confirm: true,
        description: `Dev add funds: $${(amt / 100).toFixed(2)}`,
        metadata: { dev_add_funds: "true" },
      },
      { idempotencyKey: `dev_add_funds_${amt}_${Date.now()}` }
    );

    return res.status(200).json({
      ok: true,
      paymentIntentId: pi.id,
      amountCents: amt,
      currency,
      status: pi.status,
    });
  } catch (e) {
    console.error("dev/add-funds error", e);
    const message = e?.raw?.message || e.message || "Internal error";
    return res.status(500).json({ error: "Internal error", detail: message });
  }
}
