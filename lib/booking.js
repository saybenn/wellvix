// /lib/booking.js

/** Interval helpers */
export function intervalsOverlap(aStart, aEnd, bStart, bEnd) {
  return aStart < bEnd && bStart < aEnd;
}
export function ensureNonOverlapping(existing, startMs, endMs) {
  for (const b of existing) {
    const s = new Date(b.start).getTime();
    const e = new Date(b.end).getTime();
    if (intervalsOverlap(startMs, endMs, s, e)) return false;
  }
  return true;
}

/**
 * isInsideAvailability
 * Weekly availability: availabilityByDay = { "0":[{start,end}], ... "6":[...] }
 * Exceptions (optional): exceptionsByDate = {
 *   "YYYY-MM-DD": { closed: boolean, slots?: [{start,end}] }
 * }
 * Rule:
 *  - If exception exists for date:
 *      - closed=true => false
 *      - slots set => must be inside those slots (override weekly)
 *  - Else use weekly availability for weekday
 */
export function isInsideAvailability(
  availabilityByDay,
  startIso,
  endIso,
  exceptionsByDate = {}
) {
  const start = new Date(startIso);
  const end = new Date(endIso);
  const y = start.getFullYear();
  const m = String(start.getMonth() + 1).padStart(2, "0");
  const d = String(start.getDate()).padStart(2, "0");
  const key = `${y}-${m}-${d}`;

  // If exception exists for this date
  const ex = exceptionsByDate?.[key];
  if (ex) {
    if (ex.closed) return false;
    const slots = Array.isArray(ex.slots) ? ex.slots : [];
    return isInsideSlots(slots, start, end);
  }

  // Otherwise weekly
  const weekday = String(start.getDay());
  const slots = availabilityByDay?.[weekday] || [];
  return isInsideSlots(slots, start, end);
}

function isInsideSlots(slots, startDate, endDate) {
  const toMin = (dt) => dt.getHours() * 60 + dt.getMinutes();
  const reqStart = toMin(startDate);
  const reqEnd = toMin(endDate);
  for (const s of slots) {
    const [sh, sm] = (s.start || "00:00").split(":").map(Number);
    const [eh, em] = (s.end || "23:59").split(":").map(Number);
    const slotStart = sh * 60 + sm;
    const slotEnd = eh * 60 + em;
    if (reqStart >= slotStart && reqEnd <= slotEnd) return true;
  }
  return false;
}
