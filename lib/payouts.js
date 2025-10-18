// /lib/payouts.js
import env from "@/lib/env-server";
import { stripeConnectAdmin as stripe } from "@/lib/stripe-connect-admin";
import { getProviderById } from "@/lib/providers-store";

export function computeFeeCents(amountCents, percent) {
  const amt = Number(amountCents || 0);
  const p = Number(percent || 0);
  return Math.round((amt * p) / 100);
}
export function computeNetCents(amountCents, feeCents) {
  const amt = Number(amountCents || 0);
  const fee = Number(feeCents || 0);
  return Math.max(amt - fee, 0);
}

/**
 * Create a Stripe Transfer for an order (escrow release).
 * Returns { transferId, feeCents, netCents, currency }
 */
export async function performPayout(order) {
  const amount = Number(order.priceCents || 0);
  if (amount <= 0) throw new Error("Invalid priceCents");

  const provider = await getProviderById(order.providerId);
  if (!provider?.stripeAccountId)
    throw new Error("Provider missing stripeAccountId");

  const feeCents =
    typeof order.applicationFeeCents === "number"
      ? order.applicationFeeCents
      : computeFeeCents(amount, env.WELLVIX_PLATFORM_FEE_PERCENT);

  const netCents = computeNetCents(amount, feeCents);
  const currency = (
    order.currency ||
    provider.defaultCurrency ||
    "usd"
  ).toLowerCase();

  const transfer = await stripe.transfers.create({
    amount: netCents,
    currency,
    destination: provider.stripeAccountId,
    transfer_group: `order_${order.id}`,
    metadata: { orderId: order.id, phase: "release" },
  });

  return { transferId: transfer.id, feeCents, netCents, currency };
}
