// /pages/admin/dev/orders.js
import { useEffect, useState } from "react";

export default function AdminOrdersDev() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    try {
      const r = await fetch("/api/admin/orders");
      const j = await r.json();
      setOrders(j.orders || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    const id = setInterval(load, 4000);
    return () => clearInterval(id);
  }, []);

  return (
    <main className="min-h-screen bg-950 text-white px-6 py-10">
      <div className="mx-auto max-w-5xl">
        <h1 className="text-2xl font-semibold mb-6">Orders (dev)</h1>

        {loading ? (
          <div className="rounded-xl bg-card-800 p-6 text-ink-700">
            Loading…
          </div>
        ) : orders.length === 0 ? (
          <div className="rounded-xl bg-card-800 p-6 text-ink-700">
            No orders
          </div>
        ) : (
          <div className="grid gap-4">
            {orders.map((o) => (
              <div
                key={o.id}
                className="rounded-xl bg-card-800 p-4 ring-1 ring-ink-700/10"
              >
                <div className="flex items-center justify-between">
                  <div className="text-lg font-medium">#{o.id}</div>
                  <StatusBadge status={o.status} />
                </div>

                <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-2 text-sm text-ink-700">
                  <div>
                    <span className="text-white/80">Amount:</span> $
                    {(o.priceCents / 100).toFixed(2)}{" "}
                    {o.currency?.toUpperCase() || "USD"}
                  </div>
                  <div>
                    <span className="text-white/80">PI:</span>{" "}
                    {o.stripePaymentIntentId || "—"}
                  </div>
                  <div>
                    <span className="text-white/80">Transfer:</span>{" "}
                    {o.stripeTransferId || "—"}
                  </div>
                  <div>
                    <span className="text-white/80">Fee:</span>{" "}
                    {typeof o.applicationFeeCents === "number"
                      ? `$${(o.applicationFeeCents / 100).toFixed(2)}`
                      : "—"}
                  </div>
                  <div>
                    <span className="text-white/80">Paid:</span>{" "}
                    {o.paidAt ? new Date(o.paidAt).toLocaleString() : "—"}
                  </div>
                  <div>
                    <span className="text-white/80">Accepted:</span>{" "}
                    {o.acceptedAt
                      ? new Date(o.acceptedAt).toLocaleString()
                      : "—"}
                  </div>
                  <div>
                    <span className="text-white/80">Delivered:</span>{" "}
                    {o.deliveredAt
                      ? new Date(o.deliveredAt).toLocaleString()
                      : "—"}
                  </div>
                  <div>
                    <span className="text-white/80">Completed:</span>{" "}
                    {o.completedAt
                      ? new Date(o.completedAt).toLocaleString()
                      : "—"}
                  </div>
                  <div>
                    <span className="text-white/80">Revisions:</span>{" "}
                    {o.revisionCount || 0}
                  </div>
                  <div className="col-span-2">
                    <span className="text-white/80">Delivery note:</span>{" "}
                    {o.deliveryNote || "—"}
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  <a
                    className="inline-flex items-center rounded-lg bg-blue-600 hover:bg-blue-500 text-white px-3 py-2 text-sm"
                    href={`/checkout/inline/${o.id}`}
                  >
                    Open Checkout
                  </a>

                  {/* Provider actions */}
                  <button
                    className="inline-flex items-center rounded-lg bg-green-500 text-ink-900 px-3 py-2 text-sm disabled:opacity-40"
                    onClick={async () => {
                      await fetch("/api/orders/accept", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ orderId: o.id }),
                      });
                      load();
                    }}
                    disabled={o.status !== "paid"}
                    title={o.status !== "paid" ? "Only after paid" : ""}
                  >
                    Mark In-Progress
                  </button>

                  <button
                    className="inline-flex items-center rounded-lg bg-blue-800 text-white px-3 py-2 text-sm disabled:opacity-40"
                    onClick={async () => {
                      const r = await fetch("/api/orders/deliver", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          orderId: o.id,
                          message: "Initial delivery",
                        }),
                      });
                      const j = await r.json();
                      if (!j.ok) alert(j.error || "Delivery failed");
                      load();
                    }}
                    disabled={o.status !== "in_progress"}
                    title={
                      o.status !== "in_progress" ? "Only after in_progress" : ""
                    }
                  >
                    Mark Delivered
                  </button>

                  {/* Client/Admin actions */}
                  <button
                    className="inline-flex items-center rounded-lg bg-blue-600 text-white px-3 py-2 text-sm disabled:opacity-40"
                    onClick={async () => {
                      const r = await fetch("/api/orders/approve", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ orderId: o.id }),
                      });
                      const j = await r.json();
                      if (!j.ok) alert(j.error || "Approval failed");
                      load();
                    }}
                    disabled={o.status !== "delivered"}
                    title={
                      o.status !== "delivered" ? "Only after delivered" : ""
                    }
                  >
                    Approve & Pay Provider
                  </button>

                  <button
                    className="inline-flex items-center rounded-lg bg-muted-400 text-ink-900 px-3 py-2 text-sm disabled:opacity-40"
                    onClick={async () => {
                      const note = prompt("Revision note for provider:");
                      const r = await fetch("/api/orders/request-revision", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ orderId: o.id, note }),
                      });
                      const j = await r.json();
                      if (!j.ok) alert(j.error || "Request failed");
                      load();
                    }}
                    disabled={o.status !== "delivered"}
                    title={
                      o.status !== "delivered" ? "Only after delivered" : ""
                    }
                  >
                    Request Revision
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

function StatusBadge({ status }) {
  const map = {
    draft: "bg-muted-400 text-ink-900",
    paid: "bg-blue-600 text-white",
    in_progress: "bg-green-500 text-ink-900",
    delivered: "bg-blue-500 text-white",
    completed: "bg-blue-800 text-white",
    refunded: "bg-ink-700 text-white",
    cancelled: "bg-ink-700 text-white",
  };
  return (
    <span
      className={`inline-flex items-center rounded-xl px-3 py-1 text-xs font-medium ${
        map[status] || "bg-ink-700 text-white"
      }`}
    >
      {status}
    </span>
  );
}
