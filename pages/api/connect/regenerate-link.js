// /pages/api/connect/regenerate-link.js
// Admin action to regenerate onboarding link when account is incomplete or needs updates.
// TODO AuthZ: restrict to admins.
import { stripe } from "@/lib/stripe";

export default async function handler(req, res) {
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed" });
  try {
    const { accountId } = req.body || {};
    if (!accountId)
      return res.status(400).json({ error: "accountId required" });

    const appUrl = process.env.NEXT_PUBLIC_APP_URL;
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
    console.error("regenerate-link error", e);
    res.status(500).json({ error: "Internal error" });
  }
}
