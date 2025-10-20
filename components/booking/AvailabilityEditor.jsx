// /components/booking/AvailabilityEditor.jsx
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

const SlotModal = dynamic(() => import("@/components/booking/SlotModal"), {
  ssr: true,
});

const EMPTY = { 0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: [] };

function fmt12(hhmm) {
  const [H, M] = hhmm.split(":").map((n) => parseInt(n, 10));
  const ampm = H >= 12 ? "PM" : "AM";
  const h12 = ((H + 11) % 12) + 1;
  return `${h12}:${String(M).padStart(2, "0")} ${ampm}`;
}

/**
 * Hydration-safe weekly availability with 15-min modal.
 * TODO(Supabase): swap localStorage for /api/bookings/availability
 */
export default function AvailabilityEditor({
  copy = {},
  providerId,
  onSaved = () => {},
}) {
  const weekday = copy.weekday || [
    "Sun",
    "Mon",
    "Tue",
    "Wed",
    "Thu",
    "Fri",
    "Sat",
  ];
  const [availability, setAvailability] = useState(EMPTY);

  // modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingDay, setEditingDay] = useState(null);
  const [editingIndex, setEditingIndex] = useState(null);
  const [seedStart, setSeedStart] = useState("09:00");
  const [seedEnd, setSeedEnd] = useState("10:00");

  // hydrate after mount
  useEffect(() => {
    try {
      const key = `avail:${providerId}`;
      const raw =
        typeof window !== "undefined" ? localStorage.getItem(key) : null;
      if (raw) setAvailability({ ...EMPTY, ...JSON.parse(raw) });
    } catch {}
  }, [providerId]);

  function openNewSlot(day) {
    setEditingDay(day);
    setEditingIndex(null);
    setSeedStart("09:00");
    setSeedEnd("10:00");
    setModalOpen(true);
  }
  function openEditSlot(day, idx) {
    const slot = (availability[String(day)] || [])[idx];
    setEditingDay(day);
    setEditingIndex(idx);
    setSeedStart(slot?.start || "09:00");
    setSeedEnd(slot?.end || "10:00");
    setModalOpen(true);
  }
  function removeSlot(day, idx) {
    setAvailability((prev) => {
      const d = String(day);
      const next = { ...prev };
      next[d] = (next[d] || []).filter((_, i) => i !== idx);
      return next;
    });
  }
  async function saveAll() {
    try {
      const key = `avail:${providerId}`;
      if (typeof window !== "undefined")
        localStorage.setItem(key, JSON.stringify(availability));
      // TODO(Supabase): POST /api/bookings/availability
      onSaved();
    } catch {}
  }
  function upsertSlot(day, idx, start, end) {
    setAvailability((prev) => {
      const d = String(day);
      const arr = [...(prev[d] || [])];
      if (idx === null || idx === undefined) arr.push({ start, end });
      else arr[idx] = { start, end };
      arr.sort((a, b) => (a.start < b.start ? -1 : a.start > b.start ? 1 : 0));
      return { ...prev, [d]: arr };
    });
  }

  const Day = ({ d }) => {
    const slots = availability[String(d)] || [];
    return (
      <div className="rounded-2xl border border-[var(--ink-700)]/10 p-3 bg-[var(--card-800)]/40">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-semibold text-[var(--ink-900)]">
            {weekday[d]}
          </h4>
          <button
            type="button"
            onClick={() => openNewSlot(d)}
            className="cursor-pointer text-xs rounded-xl border px-2 py-1 border-[var(--blue-600)] text-[var(--blue-600)] hover:bg-[var(--blue-600)] hover:text-[var(--white)] transition"
          >
            {copy.addSlot || "Add Slot"}
          </button>
        </div>

        <div className="mt-3 space-y-2">
          {slots.length === 0 && (
            <p className="text-xs text-[var(--ink-700)]">
              {copy.emptyDay || "No slots for this day."}
            </p>
          )}
          {slots.map((s, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between rounded-xl bg-[var(--white)] px-3 py-2 shadow-sm"
            >
              <button
                type="button"
                className="cursor-pointer text-sm text-[var(--ink-900)] hover:underline"
                onClick={() => openEditSlot(d, idx)}
                title="Edit slot"
              >
                {fmt12(s.start)} – {fmt12(s.end)}
              </button>
              <button
                type="button"
                onClick={() => removeSlot(d, idx)}
                className="cursor-pointer rounded-xl border px-2 py-1 text-xs border-[var(--ink-700)]/20 hover:bg-[var(--muted-400)]/20"
                title="Remove slot"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <section className="rounded-2xl border border-[var(--ink-700)]/10 p-4 bg-[var(--white)]">
      <h3 className="text-lg font-bold text-[var(--ink-900)]">
        {copy.title || "Availability"}
      </h3>
      <p className="text-sm text-[var(--ink-700)]">
        {copy.subtitle || "Set your weekly open hours."}
      </p>

      <div className="mt-4 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 7 }).map((_, d) => (
          <Day key={d} d={d} />
        ))}
      </div>

      <div className="mt-4">
        <button
          type="button"
          onClick={saveAll}
          className="cursor-pointer rounded-xl px-3 py-2 bg-[var(--green-500)] text-[var(--white)] font-semibold"
        >
          {copy.save || "Save Availability"}
        </button>
      </div>

      <SlotModal
        open={modalOpen}
        initialStart={seedStart}
        initialEnd={seedEnd}
        onClose={() => setModalOpen(false)}
        onSave={(s, e) => {
          upsertSlot(editingDay, editingIndex, s, e);
          setModalOpen(false);
        }}
        title={copy.editSlotTitle || "Edit Time Slot"}
      />
    </section>
  );
}
