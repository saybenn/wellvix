// /pages/api/healthz.js
import envServer from "@/lib/env-server";
import envPublic from "@/lib/env-public";
import { stripe } from "@/lib/stripe";

export default async function handler(req, res) {
  try {
    const keyPrefix = (
      process.env.STRIPE_RESTRICTED_KEY ||
      process.env.STRIPE_SECRET_KEY ||
      ""
    ).slice(0, 5);
    let reachable = false;
    try {
      // This may 403 with RK; that's fine. We'll report "limited" if it does.
      await stripe.webhookEndpoints.list({ limit: 1 });
      reachable = true;
    } catch {
      reachable = false;
    }

    res.status(200).json({
      ok: true,
      env: envPublic?.NEXT_PUBLIC_ENV || envServer?.NODE_ENV || "unknown",
      stripe: keyPrefix ? (reachable ? "ok" : "limited") : "missing",
      keyPrefix,
      missing: {
        NEXT_PUBLIC_APP_URL: !envPublic?.NEXT_PUBLIC_APP_URL,
        NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY:
          !envPublic?.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
        STRIPE_WEBHOOK_SECRET: !envServer?.STRIPE_WEBHOOK_SECRET,
      },
    });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
}
