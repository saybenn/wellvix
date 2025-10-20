// /pages/admin/events.js
import { useEffect, useState } from "react";
import { formatDateTime } from "../../lib/format";

export default function AdminEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    try {
      // Dev: read local file via a tiny API or reuse admin orders API to serve it
      // For simplicity, piggyback on a dev route: we’ll inline fetch from the public file (Next can't serve from /data by default).
      const r = await fetch("/api/admin/events"); // create route below
      const j = await r.json();
      setEvents(j.events || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    load();
  }, []);

  return (
    <main className="page-shell">
      <div className="max-w-11/12 mx-auto p-6">
        <h1 className="text-2xl font-semibold mb-4">Order Events (dev)</h1>
        {loading ? (
          <div className="card token-muted">Loading…</div>
        ) : events.length === 0 ? (
          <div className="card token-muted">No events found.</div>
        ) : (
          <div className="grid gap-3">
            {events.map((e) => (
              <div key={e.id} className="card">
                <div className="text-sm token-muted">
                  {formatDateTime(e.createdAt)}
                </div>
                <div className="font-medium">{e.name}</div>
                <div className="text-sm">Order: {e.orderId}</div>
                <div className="text-sm">Actor: {e.actor}</div>
                <div className="text-sm">
                  From → To: {e.fromStatus || "—"} → {e.toStatus || "—"}
                </div>
                {e.reason && <div className="text-sm">Reason: {e.reason}</div>}
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
