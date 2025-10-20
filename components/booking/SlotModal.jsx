// /components/booking/SlotModal.jsx
import { useEffect, useMemo, useRef, useState } from "react";

/** Utilities */
const STEP_MIN = 15;
function buildTimes(step = STEP_MIN) {
  const items = [];
  for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 60; m += step) {
      const hh = String(h).padStart(2, "0");
      const mm = String(m).padStart(2, "0");
      items.push(`${hh}:${mm}`); // canonical
    }
  }
  return items;
}
function cmp(a, b) {
  if (a === b) return 0;
  return a < b ? -1 : 1;
}
function fmt12(hhmm) {
  const [H, M] = hhmm.split(":").map((n) => parseInt(n, 10));
  const ampm = H >= 12 ? "PM" : "AM";
  const h12 = ((H + 11) % 12) + 1;
  return `${h12}:${String(M).padStart(2, "0")} ${ampm}`;
}

export default function SlotModal({
  open,
  onClose,
  onSave,
  initialStart = "09:00",
  initialEnd = "10:00",
  title = "Edit Time Slot",
}) {
  const times = useMemo(() => buildTimes(), []);
  const [start, setStart] = useState(initialStart);
  const [end, setEnd] = useState(initialEnd);
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    if (!open) return;
    setStart(initialStart);
    setEnd(initialEnd);
    setTouched(false);
  }, [open, initialStart, initialEnd]);

  const invalid = useMemo(() => cmp(start, end) >= 0, [start, end]);

  // Auto-scroll
  const startRef = useRef(null);
  const endRef = useRef(null);
  useEffect(() => {
    if (!open) return;
    const sIndex = times.indexOf(start);
    const eIndex = times.indexOf(end);
    if (startRef.current && sIndex >= 0) {
      const child = startRef.current.children[sIndex];
      if (child) child.scrollIntoView({ block: "center" });
    }
    if (endRef.current && eIndex >= 0) {
      const child = endRef.current.children[eIndex];
      if (child) child.scrollIntoView({ block: "center" });
    }
  }, [open, start, end, times]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--ink-900)]/40"
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-1/2 rounded-2xl bg-[var(--white)] p-4 shadow-xl">
        <h4 className="text-base font-semibold text-[var(--ink-900)]">
          {title}
        </h4>

        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          {/* Start */}
          <div className="rounded-xl border border-[var(--ink-700)]/10">
            <div className="px-3 py-2 text-xs font-medium text-[var(--ink-700)]">
              Start
            </div>
            <div
              ref={startRef}
              className="max-h-64 overflow-auto border-t border-[var(--ink-700)]/10"
            >
              {times.map((t) => {
                const active = t === start;
                return (
                  <button
                    type="button"
                    key={`s-${t}`}
                    onClick={() => {
                      setStart(t);
                      setTouched(true);
                      if (cmp(t, end) >= 0) {
                        const idx = times.indexOf(t);
                        const next = times[idx + 1] || "23:59";
                        setEnd(next);
                      }
                    }}
                    className={[
                      "w-full text-left px-3 py-2 text-sm transition cursor-pointer",
                      active
                        ? "bg-[var(--blue-500)]/10 text-[var(--blue-600)]"
                        : "hover:bg-[var(--card-800)]/30 text-[var(--ink-900)]",
                    ].join(" ")}
                  >
                    {fmt12(t)}
                  </button>
                );
              })}
            </div>
          </div>

          {/* End */}
          <div className="rounded-xl border border-[var(--ink-700)]/10">
            <div className="px-3 py-2 text-xs font-medium text-[var(--ink-700)]">
              End
            </div>
            <div
              ref={endRef}
              className="max-h-64 overflow-auto border-t border-[var(--ink-700)]/10"
            >
              {times.map((t) => {
                const disabled = cmp(t, start) <= 0;
                const active = t === end;
                return (
                  <button
                    type="button"
                    key={`e-${t}`}
                    disabled={disabled}
                    onClick={() => {
                      setEnd(t);
                      setTouched(true);
                    }}
                    className={[
                      "w-full text-left px-3 py-2 text-sm transition",
                      disabled
                        ? "text-[var(--muted-400)] cursor-not-allowed"
                        : "cursor-pointer hover:bg-[var(--card-800)]/30 text-[var(--ink-900)]",
                      active
                        ? "bg-[var(--blue-500)]/10 text-[var(--blue-600)]"
                        : "",
                    ].join(" ")}
                  >
                    {fmt12(t)}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {invalid && touched && (
          <div className="mt-2 rounded-lg bg-[var(--blue-800)]/10 px-3 py-2 text-sm text-[var(--ink-900)]">
            End time must be after start time.
          </div>
        )}

        <div className="mt-4 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl px-3 py-2 text-[var(--ink-900)] hover:bg-[var(--card-800)]/30 transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={invalid}
            onClick={() => onSave(start, end)}
            className={[
              "rounded-xl px-3 py-2 font-semibold text-[var(--white)] transition",
              invalid
                ? "bg-[var(--muted-400)] cursor-not-allowed"
                : "bg-[var(--green-500)] hover:opacity-90",
            ].join(" ")}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
