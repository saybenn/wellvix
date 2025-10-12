// Uses full Secret Key to manage Connect accounts & account links.
// Do NOT use this client for payments. Keep it server-only.
import Stripe from "stripe";
import env from "./env-server";

const sk = env.STRIPE_SECRET_KEY;
if (!sk) {
  throw new Error("Missing STRIPE_SECRET_KEY for connect admin");
}

export const stripeConnectAdmin = new Stripe(sk, {
  apiVersion: "2024-06-20",
});
