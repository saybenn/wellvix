// /pages/api/connect/create-account.js
// Creates a Connect Express account for a provider and returns the account id.
// TODO AuthZ: ensure caller owns the provider profile.

// import { stripe } from "@/lib/stripe";
import { stripeConnectAdmin as stripe } from "@/lib/stripe-connect-admin";
import { getProviderById } from "@/lib/providers-store"; // dev JSON
// TODO Supabase/Prisma: swap to DB

export default async function handler(req, res) {
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed" });

  try {
    const { providerId, email } = req.body || {};
    if (!providerId)
      return res.status(400).json({ error: "providerId required" });

    const provider = await getProviderById(providerId);
    if (!provider) return res.status(404).json({ error: "Provider not found" });

    // Create Express account with capabilities needed for destination charges
    const account = await stripe.accounts.create({
      type: "express",
      email: email || undefined,
      capabilities: {
        transfers: { requested: true },
        card_payments: { requested: true },
      },
      business_type: "individual", // or "company" depending on your onboarding form
      metadata: { providerId },
      settings: {
        payouts: { schedule: { interval: "daily" } }, // tweak as desired
      },
    });

    // Return acct id; you'll persist it after onboarding completes (or now).
    res.status(200).json({ accountId: account.id });
  } catch (e) {
    console.error("create-account error", e);
    res.status(500).json({ error: "Internal error" });
  }
}
