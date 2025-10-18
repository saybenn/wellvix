// /pages/api/stripe/webhook.js
import { stripe } from "@/lib/stripe";
import { setOrderStatus, updateOrder } from "@/lib/orders-store";
import { markEventProcessed, isEventProcessed } from "@/lib/stripe-events";

//ensure raw body
export const config = {
  api: { bodyParser: false },
};

async function rawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (c) => chunks.push(c));
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).send("Method not allowed");

  const sig = req.headers["stripe-signature"];
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) return res.status(500).send("Missing STRIPE_WEBHOOK_SECRET");

  let event;
  try {
    const raw = await rawBody(req);
    event = stripe.webhooks.constructEvent(raw, sig, secret);
  } catch (err) {
    console.error("Webhook verify fail:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    //Idempotency
    const already = await isEventProcessed(event.id);
    if (already) return res.status(200).send("ok-duplicate");
    await markEventProcessed({ id: event.id, type: event.type });

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        const orderId = session?.metadata?.orderId || null;
        const paymentIntentId = session?.payment_intent || null;

        if (!orderId) break;

        // Persist payment refs
        await updateOrder(orderId, {
          stripePaymentIntentId: paymentIntentId || null,
          currency: session.currency || null,
          paidAt: new Date().toISOString(),
        });

        break;
      }

      case "payment_intent.succeeded": {
        const pi = event.data.object;
        const orderId = pi?.metadata?.orderId;
        if (!orderId) break;

        if (orderId) {
          // Get charge to capture transfer id (destination charges create charge with transfer)
          const expanded = await stripe.paymentIntents.retrieve(pi.id, {
            expand: ["charges.data.balance_transaction", "charges"],
          });
          const charge = expanded?.charges?.data?.[0];
          const transferId = charge?.transfer || null;
          await updateOrder(orderId, {
            stripePaymentIntentId: pi.id,
            currency: pi.currency || "usd",
            paidAt: new Date().toISOString(),
            stripeTransferId: transferId,
          });
          break;
        }
      }

      case "payment_intent.payment_failed": {
        const pi = event.data.object;
        const orderId = pi?.metadata?.orderId;
        if (orderId) {
          // Leave status as draft; could set a transient flag if desired
          await updateOrder(orderId, { refundStatus: "none" });
        }
        break;
      }

      case "account.updated": {
        // Monitor provider capability drops; mark stripeReady accordingly (future: Supabase)
        // const acct = event.data.object;
        // const ready = acct.capabilities?.card_payments === "active" && acct.capabilities?.transfers === "active";
        // TODO Supabase: update provider.stripeReady
        break;
      }

      default:
        break;
    }

    res.status(200).send("ok");
  } catch (err) {
    console.error("Webhook handler error:", err);
    res.status(500).send("Webhook handler error");
  }
}

/*
  // TODO Supabase/Prisma:
  // - Replace updateOrder/setOrderStatus with DB update.
  // - Add idempotency guard using stripe event id to avoid duplicates.
*/
