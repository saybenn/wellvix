// /components/booking/CalendarPicker.jsx
/**
 * Minimal month calendar:
 * - disabled days if no availability or fully booked
 * Props:
 *  - availabilityByDay: {'0':[{start,end}],...}
 *  - fullyBookedDates: Set('YYYY-MM-DD')
 *  - value (Date), onChange(Date)
 */
export default function CalendarPicker({
  value,
  onChange,
  availabilityByDay,
  fullyBookedDates,
}) {
  const today = new Date();
  const current = new Date(value || today);
  current.setDate(1);

  const year = current.getFullYear();
  const month = current.getMonth();
  const firstDay = new Date(year, month, 1);
  const startWeekday = firstDay.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells = [];
  for (let i = 0; i < startWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));

  function dayKey(d) {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
      2,
      "0"
    )}-${String(d.getDate()).padStart(2, "0")}`;
  }

  function isDisabled(d) {
    const avail = availabilityByDay?.[String(d.getDay())] || [];
    if (avail.length === 0) return true;
    if (fullyBookedDates?.has(dayKey(d))) return true;
    return false;
  }

  return (
    <div className="rounded-2xl border border-ink-700/10 p-3 bg-white">
      <div className="grid grid-cols-7 text-xs text-ink-700">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((w) => (
          <div key={w} className="p-2">
            {w}
          </div>
        ))}
        {cells.map((d, i) => {
          if (!d) return <div key={i} className="p-2"></div>;
          const disabled = isDisabled(d);
          const isSelected = value && d.toDateString() === value.toDateString();
          return (
            <button
              key={i}
              disabled={disabled}
              onClick={() => onChange?.(d)}
              className={[
                "m-1 rounded-lg p-2 text-sm transition",
                disabled
                  ? "bg-card-800/30 text-ink-700 cursor-not-allowed"
                  : isSelected
                  ? "bg-blue-600 text-white"
                  : "hover:bg-blue-500/10 text-ink-900 cursor-pointer",
              ].join(" ")}
            >
              {d.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
}
