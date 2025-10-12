// /pages/api/connect/finalize.js
// Checks the account’s status and persists accountId on your Provider row.
// TODO Supabase/Prisma: identify the provider securely (e.g., from session) and save to DB.

// import { stripe } from "@/lib/stripe";
import { stripeConnectAdmin as stripe } from "@/lib/stripe-connect-admin";

// import { saveStripeAccountForProvider,markProviderStripeReady } from "@/lib/providers-db";
// TODO: Supabase/Prisma: update provider row
import { notifyProviderOnboarding } from "@/lib/notify";

export default async function handler(req, res) {
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed" });

  try {
    const { accountId } = req.body || {};
    if (!accountId)
      return res.status(400).json({ error: "accountId required" });

    const account = await stripe.accounts.retrieve(accountId);

    const cardActive = account.capabilities?.card_payments === "active";
    const transfersActive = account.capabilities?.transfers === "active";
    // Simple readiness check; refine as needed:

    const ready = !!(
      cardActive &&
      transfersActive &&
      account.details_submitted
    );

    if (!ready) {
      return res.status(200).json({
        ok: false,
        status: "pending",
        capabilities: account.capabilities,
        currently_due: account.requirements?.currently_due || [],
      });
    }

    // TODO: persist to your Provider row: Provider.stripeAccountId = account.id, stripeReady=true, onboardingCompleteAt=now()
    // await markProviderStripeReady({ providerId: account.metadata.providerId, stripeAccountId: account.id });

    //optional notify
    await notifyProviderOnboarding({ accountId });

    return res.status(200).json({ ok: true, accountId: account.id });
  } catch (e) {
    console.error("finalize error", e);
    res.status(500).json({ error: "Internal error" });
  }
}
