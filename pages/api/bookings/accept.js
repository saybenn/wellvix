// /pages/api/bookings/accept.js
import { store } from "./_store";
import { ensureNonOverlapping } from "@/lib/booking";
import { createOrder } from "@/lib/orders-store"; // dev JSON -> writes to data/orders.json
import { getServiceById } from "@/lib/services-store";

/**
 * POST /api/bookings/accept
 * body: { bookingId, providerId }
 *
 * - Validates owner + status + overlap
 * - Creates an Order using the booking's providerServiceId pricing (awaiting_provider)
 * - Links booking.orderId
 */
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      ok: false,
      error: { code: "method_not_allowed", message: "Method not allowed" },
    });
  }
  const { bookingId, providerId } = req.body || {};
  if (!bookingId || !providerId) {
    return res.status(400).json({
      ok: false,
      error: {
        code: "missing_fields",
        message: "bookingId, providerId required",
      },
    });
  }
  const idx = store.bookings.findIndex((b) => b.id === bookingId);
  if (idx === -1)
    return res.status(404).json({
      ok: false,
      error: { code: "not_found", message: "Booking not found" },
    });

  const booking = store.bookings[idx];
  if (booking.providerId !== providerId)
    return res.status(403).json({
      ok: false,
      error: { code: "forbidden", message: "Not your booking" },
    });
  if (booking.status !== "requested")
    return res.status(409).json({
      ok: false,
      error: { code: "invalid_status", message: "Must be requested" },
    });

  // Race re-check with confirmed
  const bufferMin = store.bufferMinByProvider[providerId] || 0;
  const startMs = new Date(booking.start).getTime();
  const endMs = new Date(booking.end).getTime();
  const confirmed = store.bookings.filter(
    (b) =>
      b.providerId === providerId &&
      b.status === "confirmed" &&
      b.id !== booking.id
  );
  if (!ensureNonOverlapping(confirmed, startMs, endMs, bufferMin)) {
    return res.status(409).json({
      ok: false,
      error: {
        code: "overlap_or_buffer",
        message: "Time conflicts with another booking or violates buffer",
      },
    });
  }

  const svc = await getServiceById(booking.providerServiceId);
  if (!svc || !svc.active) {
    return res.status(400).json({
      ok: false,
      error: {
        code: "invalid_service",
        message: "Service inactive or missing",
      },
    });
  }

  // Create Order from service pricing (awaiting_provider)
  // NOTE: priceFrom is cents in dataset; fallback to 0
  const priceCents = Number(svc.price_from ?? svc.priceFrom ?? 0);
  const draftOrder = await createOrder({
    providerId,
    providerServiceId: booking.providerServiceId,
    status: "awaiting_provider",
    priceCents,
    currency: "usd", // TODO(Supabase): use provider.defaultCurrency or service currency
    brief: {
      kind: "in_person",
      start: booking.start,
      end: booking.end,
      notes: booking.notes,
    },
  });

  // Link booking to order and confirm
  const updated = {
    ...booking,
    status: "confirmed",
    orderId: draftOrder.id,
    updatedAt: new Date().toISOString(),
  };
  store.bookings[idx] = updated;

  return res.json({ ok: true, data: { booking: updated, order: draftOrder } });
}
