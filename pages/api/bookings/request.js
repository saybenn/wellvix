// /pages/api/bookings/request.js
// POST: { providerId, clientId, serviceId, start, end, notes }
// Returns codes: "outside_availability" | "overlap" | "invalid" | "ok"
// TODO(Supabase): INSERT into Booking with RLS; join service during reads

import { store, nextId } from "./_store";
import { ensureNonOverlapping, isInsideAvailability } from "@/lib/booking";

export default async function handler(req, res) {
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed" });

  const { providerId, clientId, serviceId, start, end, notes } = req.body || {};
  if (!providerId || !clientId || !serviceId || !start || !end) {
    return res.status(400).json({ error: "invalid" });
  }

  const availability = store.availability[providerId] || {
    0: [],
    1: [],
    2: [],
    3: [],
    4: [],
    5: [],
    6: [],
  };
  const inside = isInsideAvailability(availability, start, end);
  if (!inside) {
    return res.status(409).json({ error: "outside_availability" });
  }

  const startMs = new Date(start).getTime();
  const endMs = new Date(end).getTime();
  const conflicting = store.bookings.filter(
    (b) =>
      b.providerId === providerId &&
      (b.status === "confirmed" || b.status === "requested")
  );

  if (!ensureNonOverlapping(conflicting, startMs, endMs)) {
    return res.status(409).json({ error: "overlap" });
  }

  const booking = {
    id: nextId(),
    providerId,
    clientId,
    serviceId,
    status: "requested",
    start,
    end,
    notes: notes || null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  store.bookings.push(booking); // TODO(Supabase): INSERT
  return res.status(201).json({ booking });
}
