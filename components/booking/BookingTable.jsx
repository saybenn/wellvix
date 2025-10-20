// /components/booking/BookingTable.jsx
import { useEffect, useState } from "react";

export default function BookingTable({ copy, providerId }) {
  const [rows, setRows] = useState([]);

  const load = async () => {
    const res = await fetch(
      `/api/bookings/list?providerId=${providerId}&status=requested`
    );
    const json = await res.json();
    setRows(json.rows || []);
  };

  useEffect(() => {
    load();
    const t = setInterval(load, 4000);
    return () => clearInterval(t);
  }, []);

  const accept = async (bookingId) => {
    const res = await fetch("/api/bookings/accept", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bookingId, providerId }),
    });
    const json = await res.json();
    if (!res.ok) {
      // TODO: toast json.error mapping
      return;
    }
    // TODO: toast success
    load();
  };

  const fmt = (iso) =>
    new Date(iso).toLocaleString(undefined, {
      hour: "numeric",
      minute: "2-digit",
      month: "short",
      day: "numeric",
      hour12: true,
    });

  const fmtTime = (iso) =>
    new Date(iso).toLocaleTimeString(undefined, {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });

  return (
    <section className="rounded-2xl border border-[var(--ink-700)]/10 p-4 bg-[var(--white)]">
      <h3 className="text-lg font-bold text-[var(--ink-900)]">{copy.title}</h3>

      <div className="mt-3 space-y-2">
        {rows.length === 0 ? (
          <p className="text-sm text-[var(--ink-700)]">{copy.empty}</p>
        ) : (
          rows.map((r) => (
            <div
              key={r.id}
              className="flex items-center justify-between rounded-xl bg-[var(--card-800)]/30 p-3"
            >
              <div>
                <p className="text-sm font-semibold text-[var(--ink-900)]">
                  {fmt(r.start)} — {fmtTime(r.end)}
                </p>
                <p className="text-xs text-[var(--ink-700)]">
                  Client: {r.clientId?.slice(0, 8)}…
                </p>
              </div>
              <button
                onClick={() => accept(r.id)}
                className="rounded-xl px-3 py-2 border border-[var(--blue-600)] text-[var(--blue-600)] hover:bg-[var(--blue-600)] hover:text-[var(--white)] transition text-sm cursor-pointer"
              >
                {copy.accept}
              </button>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
