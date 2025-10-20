// /components/booking/BookingRequestForm.jsx
import { useState } from "react";

/**
 * BookingRequestForm
 * Props:
 * - copy: labels object
 * - providerId: string
 * - defaultClientId: string (demo; TODO Supabase session)
 * - serviceId: string (to tie booking to a service)
 * - onResult?: (ok: boolean, code?: string) => void
 */

export default function BookingRequestForm({
  copy,
  providerId,
  defaultClientId,
  serviceId,
  onResult = () => {},
}) {
  const [date, setDate] = useState("");
  const [start, setStart] = useState("09:00 AM");
  const [end, setEnd] = useState("10:00 AM");
  const [notes, setNotes] = useState("");

  function toIso(dateStr, timeLabel) {
    // timeLabel example: "09:15 AM"
    const [time, ap] = timeLabel.split(" ");
    let [h, m] = time.split(":").map(Number);
    if (ap === "PM" && h !== 12) h += 12;
    if (ap === "AM" && h === 12) h = 0;
    const hh = String(h).padStart(2, "0");
    const mm = String(m).padStart(2, "0");
    return new Date(`${dateStr}T${hh}:${mm}:00`).toISOString();
  }

  async function submit() {
    try {
      const startIso = toIso(date, start);
      const endIso = toIso(date, end);
      const res = await fetch("/api/bookings/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          providerId,
          clientId: defaultClientId,
          serviceId,
          start: startIso,
          end: endIso,
          notes,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        onResult(false, json.error);
        return;
      }
      onResult(true);
      setNotes("");
    } catch (e) {
      onResult(false, "error");
    }
  }

  // simple 15-minute step selectors (AM/PM)
  const times = [];
  for (let h = 6; h <= 20; h++) {
    for (let m = 0; m < 60; m += 15) {
      const hour12 = ((h + 11) % 12) + 1;
      const ap = h < 12 ? "AM" : "PM";
      const label = `${String(hour12).padStart(2, "0")}:${String(m).padStart(
        2,
        "0"
      )} ${ap}`;
      times.push(label);
    }
  }

  return (
    <section>
      <div className="grid gap-3 md:grid-cols-2">
        <label className="text-xs text-ink-700">
          {copy.date}
          <input
            type="date"
            className="mt-1 w-full rounded-xl bg-white px-3 py-2 text-ink-900"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </label>
        <label className="text-xs text-ink-700">
          {copy.start}
          <select
            className="mt-1 w-full rounded-xl bg-white px-3 py-2 text-ink-900"
            value={start}
            onChange={(e) => setStart(e.target.value)}
          >
            {times.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </label>
        <label className="text-xs text-ink-700">
          {copy.end}
          <select
            className="mt-1 w-full rounded-xl bg-white px-3 py-2 text-ink-900"
            value={end}
            onChange={(e) => setEnd(e.target.value)}
          >
            {times.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </label>
        <label className="text-xs text-ink-700 md:col-span-2">
          {copy.notes}
          <textarea
            className="mt-1 w-full rounded-xl bg-white px-3 py-2 text-ink-900"
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </label>
      </div>

      <div className="mt-4">
        <button
          onClick={submit}
          className="rounded-xl px-3 py-2 bg-blue-600 text-white font-semibold hover:bg-blue-500"
        >
          {copy.submit}
        </button>
      </div>
    </section>
  );
}
