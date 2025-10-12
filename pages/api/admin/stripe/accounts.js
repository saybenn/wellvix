// /pages/api/admin/stripe/accounts.js
// List connected accounts (admin-only). TODO AuthZ.
import { stripeConnectAdmin as stripe } from "@/lib/stripe-connect-admin";

export default async function handler(req, res) {
  if (req.method !== "GET")
    return res.status(405).json({ error: "Method not allowed" });
  try {
    const accs = await stripe.accounts.list({ limit: 25 });
    res.status(200).json({
      accounts: accs.data.map((a) => ({
        id: a.id,
        email: a.email,
        business_type: a.business_type,
        capabilities: a.capabilities,
        details_submitted: a.details_submitted,
        payouts_enabled: a.business_type,
      })),
      has_more: accs.has_more,
    });
  } catch (e) {
    console.error("admin accounts error:", e);
    res.status(500).json({ error: "Internal error" });
  }
}
