// /components/booking/TimeField12.jsx
import { useMemo } from "react";

/** Build 15-minute HH:mm list */
function buildTimes() {
  const out = [];
  for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 60; m += 15) {
      out.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
    }
  }
  return out;
}
function fmt12(hhmm) {
  if (!hhmm) return "";
  const [H, M] = hhmm.split(":").map((n) => parseInt(n, 10));
  const ampm = H >= 12 ? "PM" : "AM";
  const h12 = ((H + 11) % 12) + 1;
  return `${h12}:${String(M).padStart(2, "0")} ${ampm}`;
}

/**
 * TimeField12
 * Props:
 * - label: string
 * - value: "HH:mm"
 * - onChange: (hhmm) => void
 * - disabled?: boolean
 * - className?: string
 */
export default function TimeField12({
  label,
  value = "09:00",
  onChange,
  disabled = false,
  className = "",
}) {
  const times = useMemo(() => buildTimes(), []);
  return (
    <label className={`text-xs text-[var(--ink-700)] ${className}`}>
      {label}
      <div className="mt-1 rounded-xl border border-[var(--ink-700)]/15 bg-[var(--white)] px-2 py-1">
        <select
          value={value}
          disabled={disabled}
          onChange={(e) => onChange && onChange(e.target.value)}
          className="w-full cursor-pointer bg-transparent py-1 text-[var(--ink-900)] focus:outline-none"
        >
          {times.map((t) => (
            <option key={t} value={t}>
              {fmt12(t)}
            </option>
          ))}
        </select>
      </div>
    </label>
  );
}
