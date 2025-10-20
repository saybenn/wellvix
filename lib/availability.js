// /lib/availability.js
// Merge weekly availability + date exceptions + existing bookings
// and produce valid 15-min AM/PM slots (we still store "HH:mm").

import fs from "fs";
import path from "path";

const root = process.cwd();
function readJSON(p) {
  return JSON.parse(fs.readFileSync(path.join(root, "data", p), "utf8"));
}

export function getWeekly(providerId) {
  const weekly = readJSON("availability.json");
  return (
    weekly[providerId] || { 0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: [] }
  );
}
export function getExceptions(providerId) {
  const exceptions = readJSON("exceptions.json");
  return exceptions[providerId] || {};
}
export function getBookings(providerId) {
  const all = readJSON("bookings.json");
  return all.filter(
    (b) =>
      b.providerId === providerId &&
      (b.status === "requested" || b.status === "confirmed")
  );
}

/** Build 15-min increments between "HH:mm" */
function range15(startHHMM, endHHMM) {
  const out = [];
  const [sH, sM] = startHHMM.split(":").map(Number);
  const [eH, eM] = endHHMM.split(":").map(Number);
  const start = sH * 60 + sM;
  const end = eH * 60 + eM;
  for (let m = start; m + 15 <= end; m += 15) {
    const H = Math.floor(m / 60);
    const M = m % 60;
    const hh = String(H).padStart(2, "0");
    const mm = String(M).padStart(2, "0");
    out.push(`${hh}:${mm}`);
  }
  return out;
}
function fmt12(hhmm) {
  const [H, M] = hhmm.split(":").map(Number);
  const ampm = H >= 12 ? "PM" : "AM";
  const h12 = ((H + 11) % 12) + 1;
  return `${h12}:${String(M).padStart(2, "0")} ${ampm}`;
}
function isoAtLocal(dateStr, hhmm) {
  const [H, M] = hhmm.split(":").map(Number);
  const d = new Date(`${dateStr}T00:00:00`);
  d.setHours(H, M, 0, 0);
  return d.toISOString();
}

/** Return true if the date has any availability after exceptions */
export function isDayAvailable(providerId, dateStr) {
  const weekly = getWeekly(providerId);
  const exc = getExceptions(providerId)[dateStr];
  const dow = new Date(`${dateStr}T00:00:00`).getDay();

  if (exc?.closed) return false;
  const custom = exc?.slots || [];
  if (custom.length > 0) return true;

  const base = weekly[String(dow)] || [];
  return base.length > 0;
}

/** Compute valid bookable slots (already exclude conflicts) */
export function getSlotsForDay(providerId, dateStr, service) {
  const weekly = getWeekly(providerId);
  const excMap = getExceptions(providerId);
  const bookings = getBookings(providerId);
  const dow = new Date(`${dateStr}T00:00:00`).getDay();

  const leadDays = Number(service?.leadTimeDays || 0);
  const now = new Date();
  const earliest = new Date();
  earliest.setDate(now.getDate() + leadDays);
  const selected = new Date(`${dateStr}T00:00:00`);
  if (selected < new Date(earliest.toDateString())) return [];

  // base windows
  let windows = weekly[String(dow)] || [];
  // exceptions override
  const exc = excMap[dateStr];
  if (exc) {
    if (exc.closed) return [];
    if ((exc.slots || []).length > 0) windows = exc.slots;
  }
  if (windows.length === 0) return [];

  // expand to 15-min increments, then remove overlaps with existing bookings
  const duration = Number(service?.durationMinutes || 0);
  const buffer = Number(service?.bookingBufferMin || 15);
  const step = 15;

  // build candidate start times
  const candidateStarts = windows.flatMap((w) => range15(w.start, w.end));

  // build a helper to detect overlap (booking blocks include duration+buffer)
  function overlap(aStartMs, aEndMs, bStartMs, bEndMs) {
    return aStartMs < bEndMs && bStartMs < aEndMs;
  }

  // produce slot objects with both HH:mm and display
  const slots = [];
  for (const startHHMM of candidateStarts) {
    // a slot is valid only if it has room for duration
    const [h, m] = startHHMM.split(":").map(Number);
    const startMin = h * 60 + m;
    const endMin = startMin + (duration || step); // if no duration, treat as 15-min hold
    const lastWindowEnd = windows.some((w) => {
      const [eH, eM] = w.end.split(":").map(Number);
      return endMin <= eH * 60 + eM;
    });
    if (!lastWindowEnd) continue;

    const startIso = isoAtLocal(dateStr, startHHMM);
    const endHHMM = `${String(Math.floor(endMin / 60)).padStart(
      2,
      "0"
    )}:${String(endMin % 60).padStart(2, "0")}`;
    const endIso = isoAtLocal(dateStr, endHHMM);

    const sMs = new Date(startIso).getTime();
    const eMs = new Date(endIso).getTime();
    const withBufEndMs = eMs + buffer * 60 * 1000;

    // conflict against existing bookings (requested or confirmed)
    const conflict = bookings.some((b) => {
      const bs = new Date(b.start).getTime();
      const be = new Date(b.end).getTime();
      return overlap(sMs, withBufEndMs, bs, be);
    });
    if (conflict) continue;

    slots.push({
      startHHMM,
      startLabel: fmt12(startHHMM),
      startIso,
      endIso,
    });
  }

  return slots;
}
