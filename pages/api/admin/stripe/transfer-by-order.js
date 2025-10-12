// /pages/api/admin/stripe/transfer-by-order.js
// Fetch transfer info for an order (admin-only). TODO AuthZ.
import { stripe } from "@/lib/stripe";
import { getOrderById, updateOrder } from "@/lib/orders-store";

export default async function handler(req, res) {
  if (req.method !== "GET")
    return res.status(405).json({ error: "Method not allowed" });
  try {
    const { orderId } = req.query || {};
    if (!orderId) return res.status(400).json({ error: "orderId required" });

    const order = await getOrderById(orderId);
    if (!order) return res.status(404).json({ error: "Order not found" });

    let transferId = order.stripeTransferId;
    // Auto-derive transferId from PaymentIntent -> Charge if missing
    if (!transferId && order.stripePaymentIntentId) {
      const pi = await stripe.paymentIntents.retrieve(
        order.stripePaymentIntentId,
        {
          expand: ["charges"],
        }
      );
      const charge = pi?.charges?.data?.[0];
      if (charge?.transfer) {
        transferId = charge.transfer;
        // Persist for future lookups
        await updateOrder(orderId, { stripeTransferId: transferId });
      }
    }
    if (!transferId) return res.status(200).json({ transfer: null });

    const tr = await stripe.transfers.retrieve(transferId);
    res.status(200).json({
      transfer: {
        id: tr.id,
        amount: tr.amount,
        currency: tr.currency,
        destination: tr.destination,
        created: tr.created,
        livemode: tr.livemode,
      },
    });
  } catch (e) {
    console.error("transfer-by-order error", e);
    res.status(500).json({ error: "Internal error" });
  }
}
