// /pages/api/bookings/_store.js

/** Naive in-memory store for demo (resets on server restart). */
export const store = {
  bookings: [], // { id, providerId, clientId, status, start, end, notes, createdAt, updatedAt }
  availability: {
    // providerId -> weekly slots
    "prov-alpha": {
      0: [],
      1: [{ start: "09:00", end: "17:00" }],
      2: [{ start: "09:00", end: "17:00" }],
      3: [
        { start: "09:00", end: "12:00" },
        { start: "13:00", end: "17:00" },
      ],
      4: [{ start: "10:00", end: "16:00" }],
      5: [],
      6: [],
    },
  },
  exceptions: {
    // providerId -> { "YYYY-MM-DD": { closed: bool, note?: string, slots?: [] } }
    "prov-alpha": {
      // example: Thanksgiving closed
      // "2025-11-27": { closed: true, note: "Thanksgiving" }
    },
  },
};

let idSeq = 1;
export function nextId() {
  idSeq += 1;
  return String(idSeq);
}
