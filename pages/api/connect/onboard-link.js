// /pages/api/connect/onboard-link.js
// returns a one-time URL to Stripe’s hosted onboarding.
// import { stripe } from "@/lib/stripe";
import { stripeConnectAdmin as stripe } from "@/lib/stripe-connect-admin";

export default async function handler(req, res) {
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed" });

  try {
    const { accountId } = req.body || {};
    if (!accountId)
      return res.status(400).json({ error: "accountId required" });

    const appUrl = process.env.NEXT_PUBLIC_APP_URL;
    if (!appUrl)
      return res.status(500).json({ error: "Missing NEXT_PUBLIC_APP_URL" });

    const link = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${appUrl}/connect/refresh?accountId=${encodeURIComponent(
        accountId
      )}`,
      return_url: `${appUrl}/connect/return?accountId=${encodeURIComponent(
        accountId
      )}`,
      type: "account_onboarding",
    });

    res.status(200).json({ url: link.url });
  } catch (e) {
    console.error("onboard-link error", e);
    res.status(500).json({ error: "Internal error" });
  }
}
