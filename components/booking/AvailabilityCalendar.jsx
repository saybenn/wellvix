// /components/booking/AvailabilityCalendar.jsx
import { useEffect, useMemo, useState } from "react";
import { useToast } from "@/components/ui/useToast";
import Toast from "@/components/ui/Toast";

function fmtDay(d) {
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}
function isoFromDate(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
function fmtTime12(iso) {
  return new Date(iso).toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

/**
 * Props:
 * - copy: labels from /data/ui/catalog.json.booking
 * - provider: { id, displayName }
 * - service: { id, durationMinutes, leadTimeDays, bookingBufferMin }
 */
export default function AvailabilityCalendar({ copy, provider, service }) {
  const [monthStart, setMonthStart] = useState(() => {
    const d = new Date();
    d.setDate(1);
    d.setHours(0, 0, 0, 0);
    return d;
  });
  const [availableDays, setAvailableDays] = useState({}); // y-m-d -> boolean
  const [selectedDate, setSelectedDate] = useState(null); // y-m-d
  const [slots, setSlots] = useState([]); // [{startIso, endIso, startLabel}]
  const [notes, setNotes] = useState("");
  const { open, kind, message, show, close } = useToast();

  async function loadMonth() {
    const y = monthStart.getFullYear();
    const m = monthStart.getMonth() + 1;
    // Ask API which days have availability
    const res = await fetch(
      `/api/providers/${provider.id}/availability?year=${y}&month=${m}`
    );
    const j = await res.json();
    setAvailableDays(j.days || {});
  }

  useEffect(() => {
    loadMonth();
  }, [monthStart]);

  async function loadSlots(dateStr) {
    setSelectedDate(dateStr);
    setSlots([]);
    const res = await fetch(
      `/api/providers/${provider.id}/availability?date=${encodeURIComponent(
        dateStr
      )}&serviceId=${encodeURIComponent(service.id)}`
    );
    const j = await res.json();
    setSlots(j.slots || []);
  }

  async function request(slot) {
    try {
      const res = await fetch("/api/bookings/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          providerId: provider.id,
          clientId: "client-demo-456", // TODO(Supabase): session.user.id
          serviceId: service.id,
          start: slot.startIso,
          end: slot.endIso,
          notes,
        }),
      });
      const j = await res.json();
      if (!res.ok) {
        const code = j.error || "error_generic";
        const map = {
          overlap: copy.error_overlap,
          outside_availability: copy.error_outside,
          error_generic: copy.error_generic,
        };
        show(map[code] || copy.error_generic, "error");
        // refresh slots (maybe someone grabbed it)
        loadSlots(selectedDate);
        return;
      }
      show(copy.success, "success");
      setNotes("");
      // refresh to remove that slot from list
      loadSlots(selectedDate);
    } catch {
      show(copy.error_generic, "error");
    }
  }

  // Month grid
  const days = useMemo(() => {
    const start = new Date(monthStart);
    const firstDow = start.getDay();
    const gridStart = new Date(start);
    gridStart.setDate(start.getDate() - firstDow);
    const arr = [];
    for (let i = 0; i < 42; i++) {
      const d = new Date(gridStart);
      d.setDate(gridStart.getDate() + i);
      const iso = isoFromDate(d);
      const inMonth = d.getMonth() === monthStart.getMonth();
      const isAvail = !!availableDays[iso];
      arr.push({ date: d, iso, inMonth, isAvail });
    }
    return arr;
  }, [monthStart, availableDays]);

  const monthLabel = monthStart.toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="rounded-2xl border border-ink-700/10 bg-white p-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-ink-900">{copy.title}</h3>
          <p className="text-sm text-ink-700">{copy.subtitle}</p>
          <p className="text-xs text-ink-700">{copy.timezone_note}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            className="rounded-lg border border-ink-700/20 px-2 py-1 text-sm hover:bg-card-800/20"
            onClick={() => {
              const d = new Date(monthStart);
              d.setMonth(d.getMonth() - 1);
              setMonthStart(d);
            }}
          >
            ←
          </button>
          <div className="text-sm text-ink-700">{monthLabel}</div>
          <button
            className="rounded-lg border border-ink-700/20 px-2 py-1 text-sm hover:bg-card-800/20"
            onClick={() => {
              const d = new Date(monthStart);
              d.setMonth(d.getMonth() + 1);
              setMonthStart(d);
            }}
          >
            →
          </button>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-7 gap-2">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
          <div key={d} className="text-center text-xs text-ink-700">
            {d}
          </div>
        ))}
        {days.map(({ date, iso, inMonth, isAvail }) => (
          <button
            key={iso}
            onClick={() => (isAvail ? loadSlots(iso) : null)}
            className={[
              "h-20 rounded-lg border text-sm",
              inMonth ? "border-ink-700/10" : "border-ink-700/5 opacity-50",
              isAvail
                ? "bg-white hover:bg-blue-500/10 cursor-pointer"
                : "bg-card-800/30 cursor-not-allowed",
            ].join(" ")}
            title={isAvail ? copy.select_day : copy.unavailable_day}
          >
            <div className="mt-2 font-medium text-ink-900">{fmtDay(date)}</div>
            <div className="mt-1 text-xs text-ink-700">
              {isAvail ? "Available" : "—"}
            </div>
          </button>
        ))}
      </div>

      {/* Time slots */}
      <div className="mt-4">
        <h4 className="text-sm font-semibold text-ink-900">
          {copy.select_time}
        </h4>
        {selectedDate && slots.length === 0 ? (
          <div className="mt-2 rounded-lg bg-card-800/20 p-3 text-sm text-ink-700">
            {copy.unavailable_day}
          </div>
        ) : null}
        <div className="mt-2 flex flex-wrap gap-2">
          {slots.map((s) => (
            <button
              key={s.startIso}
              onClick={() => request(s)}
              className="rounded-lg border border-blue-600 px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-600 hover:text-white cursor-pointer"
              title={`${fmtTime12(s.startIso)} — ${fmtTime12(s.endIso)}`}
            >
              {s.startLabel}
            </button>
          ))}
        </div>

        <div className="mt-3">
          <label className="text-xs text-ink-700">
            {copy.notes_label}
            <textarea
              className="mt-1 w-full rounded-lg border border-ink-700/15 bg-white px-3 py-2 text-ink-900"
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </label>
        </div>
      </div>

      <Toast open={open} kind={kind} message={message} onClose={close} />
    </div>
  );
}
