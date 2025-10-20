// /components/booking/ExceptionsEditor.jsx
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

const SlotModal = dynamic(() => import("@/components/booking/SlotModal"), {
  ssr: true,
});

const EMPTY = {};

function fmt12(hhmm) {
  const [H, M] = hhmm.split(":").map((n) => parseInt(n, 10));
  const ampm = H >= 12 ? "PM" : "AM";
  const h12 = ((H + 11) % 12) + 1;
  return `${h12}:${String(M).padStart(2, "0")} ${ampm}`;
}

export default function ExceptionsEditor({
  copy = {},
  providerId,
  onSaved = () => {},
}) {
  const [exceptions, setExceptions] = useState(EMPTY);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [activeDate, setActiveDate] = useState("");
  const [editIndex, setEditIndex] = useState(null);
  const [seedStart, setSeedStart] = useState("09:00");
  const [seedEnd, setSeedEnd] = useState("10:00");

  // hydrate from localStorage (demo)
  useEffect(() => {
    try {
      const key = `availExceptions:${providerId}`;
      const raw =
        typeof window !== "undefined" ? localStorage.getItem(key) : null;
      if (raw) setExceptions({ ...EMPTY, ...JSON.parse(raw) });
    } catch {}
  }, [providerId]);

  function ensure(date) {
    setExceptions((prev) => {
      if (prev[date]) return prev;
      return { ...prev, [date]: { closed: false, note: "", slots: [] } };
    });
  }

  function toggleClosed(date, closed) {
    ensure(date);
    setExceptions((prev) => {
      const cur = prev[date] || { closed: false, note: "", slots: [] };
      return {
        ...prev,
        [date]: { ...cur, closed, slots: closed ? [] : cur.slots },
      };
    });
  }

  function setNote(date, note) {
    ensure(date);
    setExceptions((prev) => {
      const cur = prev[date] || { closed: false, note: "", slots: [] };
      return { ...prev, [date]: { ...cur, note } };
    });
  }

  function openNewSlot(date) {
    ensure(date);
    setActiveDate(date);
    setEditIndex(null);
    setSeedStart("09:00");
    setSeedEnd("10:00");
    setModalOpen(true);
  }

  function openEditSlot(date, idx) {
    const slot = (exceptions[date]?.slots || [])[idx];
    setActiveDate(date);
    setEditIndex(idx);
    setSeedStart(slot?.start || "09:00");
    setSeedEnd(slot?.end || "10:00");
    setModalOpen(true);
  }

  function upsertSlot(date, idx, start, end) {
    setExceptions((prev) => {
      const cur = prev[date] || { closed: false, note: "", slots: [] };
      const arr = [...cur.slots];
      if (idx === null || idx === undefined) arr.push({ start, end });
      else arr[idx] = { start, end };
      arr.sort((a, b) => (a.start < b.start ? -1 : a.start > b.start ? 1 : 0));
      return { ...prev, [date]: { ...cur, closed: false, slots: arr } };
    });
  }

  function removeSlot(date, idx) {
    setExceptions((prev) => {
      const cur = prev[date] || { closed: false, note: "", slots: [] };
      const arr = (cur.slots || []).filter((_, i) => i !== idx);
      return { ...prev, [date]: { ...cur, slots: arr } };
    });
  }

  /** NEW: delete entire exception date (staging) */
  function deleteDate(date) {
    setExceptions((prev) => {
      const next = { ...prev };
      delete next[date];
      return next;
    });
  }

  async function save() {
    try {
      const key = `availExceptions:${providerId}`;
      if (typeof window !== "undefined") {
        localStorage.setItem(key, JSON.stringify(exceptions));
      }
      // TODO(Supabase): POST /api/bookings/exceptions
      // await fetch("/api/bookings/exceptions", { method: "POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ providerId, exceptions }) });
      onSaved();
    } catch {}
  }

  /** NEW: DELETE persisted exception for a date */
  async function deletePersisted(date) {
    try {
      // Demo: mutate localStorage, plus stub API DELETE
      deleteDate(date);
      const key = `availExceptions:${providerId}`;
      if (typeof window !== "undefined") {
        localStorage.setItem(key, JSON.stringify(exceptions));
      }
      // TODO(Supabase): enable once wired
      // await fetch(`/api/bookings/exceptions?providerId=${encodeURIComponent(providerId)}&date=${encodeURIComponent(date)}`, { method: "DELETE" });
      onSaved();
    } catch {}
  }

  return (
    <section className="rounded-2xl border border-[var(--ink-700)]/10 p-4 bg-[var(--white)]">
      <h3 className="text-lg font-bold text-[var(--ink-900)]">
        {copy.title || "Special Availability (Exceptions)"}
      </h3>
      <p className="text-sm text-[var(--ink-700)]">
        {copy.subtitle ||
          "Mark holidays, days off, or set custom hours for a specific date."}
      </p>

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <label className="text-xs text-[var(--ink-700)]">
          {copy.pickDate || "Pick a date"}
          <input
            type="date"
            className="mt-1 w-full rounded-xl bg-[var(--white)] px-3 py-2 text-[var(--ink-900)] border border-[var(--ink-700)]/15"
            onChange={(e) => ensure(e.target.value)}
          />
        </label>

        <label className="text-xs text-[var(--ink-700)]">
          {copy.note || "Note (optional)"}
          <input
            type="text"
            className="mt-1 w-full rounded-xl bg-[var(--white)] px-3 py-2 text-[var(--ink-900)] border border-[var(--ink-700)]/15"
            onChange={(e) => {
              const dates = Object.keys(exceptions).sort();
              const last = dates[dates.length - 1];
              if (last) setNote(last, e.target.value);
            }}
          />
        </label>
      </div>

      <div className="mt-4 space-y-3">
        {Object.keys(exceptions).length === 0 && (
          <p className="text-xs text-[var(--ink-700)]">
            {copy.empty || "No exceptions yet. Pick a date to start."}
          </p>
        )}

        {Object.entries(exceptions)
          .sort(([a], [b]) => (a < b ? -1 : 1))
          .map(([date, info]) => (
            <div
              key={date}
              className="rounded-xl border border-[var(--ink-700)]/10 bg-[var(--card-800)]/30 p-3"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold text-[var(--ink-900)]">
                    {date}
                  </div>
                  {info.note ? (
                    <div className="text-xs text-[var(--ink-700)]">
                      {info.note}
                    </div>
                  ) : null}
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-xs text-[var(--ink-700)] inline-flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={!!info.closed}
                      onChange={(e) => toggleClosed(date, e.target.checked)}
                    />
                    {copy.closedAllDay || "Closed all day"}
                  </label>
                  <button
                    type="button"
                    disabled={info.closed}
                    onClick={() => openNewSlot(date)}
                    className={[
                      "cursor-pointer rounded-xl px-2 py-1 text-xs transition",
                      info.closed
                        ? "bg-[var(--muted-400)]/30 text-[var(--ink-700)] cursor-not-allowed"
                        : "border border-[var(--blue-600)] text-[var(--blue-600)] hover:bg-[var(--blue-600)] hover:text-[var(--white)]",
                    ].join(" ")}
                  >
                    {copy.addCustomHours || "Add custom hours"}
                  </button>
                  {/* NEW: delete staged (and persisted via separate button) */}
                  <button
                    type="button"
                    onClick={() => deleteDate(date)}
                    className="cursor-pointer rounded-xl px-2 py-1 text-xs border border-[var(--ink-700)]/20 hover:bg-[var(--muted-400)]/20"
                    title="Remove from current edits"
                  >
                    Delete (stage)
                  </button>
                  <button
                    type="button"
                    onClick={() => deletePersisted(date)}
                    className="cursor-pointer rounded-xl px-2 py-1 text-xs border border-[var(--blue-800)]/30 hover:bg-[var(--blue-800)]/10"
                    title="Delete from saved data"
                  >
                    Delete (saved)
                  </button>
                </div>
              </div>

              {!info.closed && (info.slots || []).length > 0 && (
                <div className="mt-2 space-y-2">
                  {info.slots.map((s, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between rounded-lg bg-[var(--white)] px-3 py-2"
                    >
                      <button
                        type="button"
                        className="text-sm text-[var(--ink-900)] hover:underline cursor-pointer"
                        onClick={() => openEditSlot(date, idx)}
                      >
                        {fmt12(s.start)} – {fmt12(s.end)}
                      </button>
                      <button
                        type="button"
                        onClick={() => removeSlot(date, idx)}
                        className="cursor-pointer rounded-xl border px-2 py-1 text-xs border-[var(--ink-700)]/20 hover:bg-[var(--muted-400)]/20"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
      </div>

      <div className="mt-4">
        <button
          type="button"
          onClick={save}
          className="cursor-pointer rounded-xl px-3 py-2 bg-[var(--green-500)] text-[var(--white)] font-semibold"
        >
          {copy.save || "Save Exceptions"}
        </button>
      </div>

      <SlotModal
        open={modalOpen}
        initialStart={seedStart}
        initialEnd={seedEnd}
        onClose={() => setModalOpen(false)}
        onSave={(s, e) => {
          upsertSlot(activeDate, editIndex, s, e);
          setModalOpen(false);
        }}
        title={copy.editSlotTitle || "Edit Custom Hours"}
      />
    </section>
  );
}
