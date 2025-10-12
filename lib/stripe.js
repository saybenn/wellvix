// /lib/stripe.js
import Stripe from "stripe";
import env from "./env-server";

/**
 * Use a Restricted Key (RK) with least-privilege if provided.
 * Fallback to full Secret Key (SK) for local/dev.
 *
 * Required permissions for RK:
 * - payment_intents: write
 * - payment_intents: read
 * - customers: read (optional if you attach customers)
 * - prices/products: read (optional)
 * - refunds: write (future)
 * - SetupIntents: write (future if saving cards)
 * For Connect:
 * - capability to create PaymentIntents with transfer_data/application_fee_amount.
 */
const key = (env.STRIPE_RESTRICTED_KEY || env.STRIPE_SECRET_KEY || "").trim();
if (!key) throw new Error("Missing STRIPE_RESTRICTED_KEY or STRIPE_SECRET_KEY");

export const stripe = new Stripe(key, { apiVersion: "2024-06-20" });

// Simple mode guard to avoid accidental live actions in dev
if (process.env.NODE_ENV !== "production" && key.startsWith("sk_live")) {
  console.warn(
    "⚠️ Using LIVE secret key in non-production env. This is dangerous."
  );
}
