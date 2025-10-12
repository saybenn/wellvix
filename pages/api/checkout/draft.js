// Mock "draft order" creation. Think: shopping cart entry before payment.
// Security note: This example is intentionally minimal for dev. Lock it down for prod.

import crypto from "crypto";

// TODO(Supabase): import { createClient } from "@supabase/supabase-js";
// const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const { providerId, customerId, product, brief } = req.body || {};

    // Basic validation (server-side)
    if (!providerId)
      return res.status(400).json({ error: "providerId required" });
    if (!product || typeof product.price !== "number")
      return res
        .status(400)
        .json({ error: "product with numeric price required" });
    if (!brief || !brief.project_title || !brief.goals || !brief.deliverables) {
      return res
        .status(400)
        .json({ error: "brief incomplete (title, goals, deliverables)" });
    }

    // Compute amount (mock). In reality you'd derive from tier config.
    const amount = Math.max(0, Number(product.price || 0));
    const currency = (product.currency || "usd").toLowerCase();

    // Generate a draft id
    const draftId = "draft_" + crypto.randomBytes(6).toString("hex");

    const draftOrder = {
      id: draftId,
      status: "draft",
      providerId,
      customerId: customerId || null,
      product: {
        id: product.id || null,
        tierId: product.tierId || null,
        title: product.title || "Tier",
        price: amount,
        currency,
      },
      brief,
      totals: {
        amount,
        currency,
      },
      createdAt: new Date().toISOString(),
    };

    // TODO(Supabase): Persist draft in DB
    // const { error } = await supabase
    //   .from("orders")
    //   .insert({
    //     id: draftOrder.id,
    //     status: "draft",
    //     provider_id: draftOrder.providerId,
    //     customer_id: draftOrder.customerId,
    //     product_id: draftOrder.product.id,
    //     tier_id: draftOrder.product.tierId,
    //     currency: draftOrder.totals.currency,
    //     amount: draftOrder.totals.amount,
    //     brief: draftOrder.brief,
    //     created_at: draftOrder.createdAt
    //   });
    // if (error) {
    //   console.error("Supabase insert error:", error);
    //   return res.status(500).json({ error: "Failed to persist draft" });
    // }

    // TODO(Email/SMS): Send a "draft created" notification via Resend/Twilio (optional)

    return res.status(201).json(draftOrder);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
