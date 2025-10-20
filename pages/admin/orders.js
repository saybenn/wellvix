// /pages/admin/orders.js
// Admin Orders (dev) with toasts + formatters + token palette.
// NOTE: This page still reads from /api/admin/orders (dev JSON store).
// TODO Supabase: replace data source with provider/client scoped queries + RLS.

import { useEffect, useState } from "react";
import ui from "../../data/ui/admin_orders.json";
import { formatMoney, formatDateTime } from "../../lib/format"; // TODO: ensure these exist
import Toast from "../../components/ui/Toast"; // TODO: ensure Toast exists
import { useToast } from "../../components/ui/useToast"; // TODO: ensure useToast exists

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { open, kind, message, show, close } = useToast();

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

  async function markAccepted(orderId) {
    try {
      const res = await fetch("/api/orders/accept", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId }),
      });
      if (!res.ok) throw new Error("accept failed");
      show(ui.toasts.accept_success, "info");
      load();
    } catch {
      show(ui.toasts.accept_error, "error");
    }
  }

  async function markDelivered(order) {
    try {
      const res = await fetch("/api/orders/deliver", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: order.id,
          note: "Initial delivery",
          files: [],
        }),
      });
      const j = await res.json();
      if (!j.ok) throw new Error(j.error || "deliver failed");
      show(ui.toasts.deliver_success, "info");
      load();
    } catch {
      show(ui.toasts.deliver_error, "error");
    }
  }

  async function approve(orderId) {
    try {
      const r = await fetch("/api/orders/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId }),
      });
      const j = await r.json();
      if (!j.ok) throw new Error(j.error || "approve failed");
      show(ui.toasts.approve_success, "success");
      load();
    } catch {
      show(ui.toasts.approve_error, "error");
    }
  }

  async function requestRevision(orderId) {
    try {
      const note = prompt("Revision note for provider:");
      const r = await fetch("/api/orders/request-revision", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, note }),
      });
      const j = await r.json();
      if (!j.ok) throw new Error(j.error || "request failed");
      show(ui.toasts.revision_success, "info");
      load();
    } catch {
      show(ui.toasts.revision_error, "error");
    }
  }

  return (
    <main className="min-h-screen bg-950 text-white px-6 py-10">
      <div className="mx-auto max-w-11/12">
        <h1 className="text-2xl font-semibold mb-6">{ui.title}</h1>

        {loading ? (
          <div className="rounded-xl bg-card-800 p-6 text-ink-700">
            {ui.loading}
          </div>
        ) : orders.length === 0 ? (
          <div className="rounded-xl bg-card-800 p-6 text-ink-700">
            {ui.empty}
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
                    <span className="text-white/80">{ui.columns.amount}:</span>{" "}
                    {formatMoney(o.priceCents, o.currency)}
                  </div>
                  <div>
                    <span className="text-white/80">{ui.columns.pi}:</span>{" "}
                    {o.stripePaymentIntentId || "—"}
                  </div>
                  <div>
                    <span className="text-white/80">
                      {ui.columns.transfer}:
                    </span>{" "}
                    {o.stripeTransferId || "—"}
                  </div>
                  <div>
                    <span className="text-white/80">{ui.columns.fee}:</span>{" "}
                    {typeof o.applicationFeeCents === "number"
                      ? formatMoney(o.applicationFeeCents, o.currency)
                      : "—"}
                  </div>
                  <div>
                    <span className="text-white/80">{ui.columns.paid}:</span>{" "}
                    {o.paidAt ? formatDateTime(o.paidAt) : "—"}
                  </div>
                  <div>
                    <span className="text-white/80">
                      {ui.columns.accepted}:
                    </span>{" "}
                    {o.acceptedAt ? formatDateTime(o.acceptedAt) : "—"}
                  </div>
                  <div>
                    <span className="text-white/80">
                      {ui.columns.delivered}:
                    </span>{" "}
                    {o.deliveredAt ? formatDateTime(o.deliveredAt) : "—"}
                  </div>
                  <div>
                    <span className="text-white/80">
                      {ui.columns.completed}:
                    </span>{" "}
                    {o.completedAt ? formatDateTime(o.completedAt) : "—"}
                  </div>
                  <div>
                    <span className="text-white/80">
                      {ui.columns.revisions}:
                    </span>{" "}
                    {o.revisionCount || 0}
                  </div>
                  <div className="col-span-2">
                    <span className="text-white/80">
                      {ui.columns.delivery_note}:
                    </span>{" "}
                    {o.deliveryNote || "—"}
                  </div>
                </div>

                {/* Paid chip (paidAt flag) */}
                {o.paidAt && (
                  <div className="mt-2">
                    <span
                      className="inline-flex items-center rounded-xl px-2 py-0.5 text-xs"
                      style={{
                        background: "rgba(34,197,94,.12)",
                        border: "1px solid rgba(34,197,94,.35)",
                      }}
                    >
                      {ui.chips.paid}
                    </span>
                  </div>
                )}

                <div className="mt-3 flex flex-wrap gap-2">
                  <a
                    className="inline-flex items-center rounded-lg bg-blue-600 hover:bg-blue-500 text-white px-3 py-2 text-sm"
                    href={`/checkout/inline/${o.id}`}
                  >
                    {ui.actions.open_checkout}
                  </a>

                  {/* Provider actions */}
                  <button
                    className="inline-flex items-center rounded-lg bg-green-500 text-ink-900 px-3 py-2 text-sm disabled:opacity-40"
                    onClick={() => markAccepted(o.id)}
                    disabled={o.status !== "awaiting_provider"}
                    title={
                      o.status !== "awaiting_provider"
                        ? ui.hints.only_when_awaiting_provider
                        : ""
                    }
                  >
                    {ui.actions.mark_accepted}
                  </button>

                  <button
                    className="inline-flex items-center rounded-lg bg-blue-800 text-white px-3 py-2 text-sm disabled:opacity-40"
                    onClick={() => markDelivered(o)}
                    disabled={!(o.status === "accepted" && !!o.paidAt)}
                    title={
                      o.status !== "accepted"
                        ? ui.hints.only_after_accepted
                        : !o.paidAt
                        ? ui.hints.client_must_pay_first
                        : ""
                    }
                  >
                    {ui.actions.mark_delivered}
                  </button>

                  {/* Client/Admin actions */}
                  <button
                    className="inline-flex items-center rounded-lg bg-blue-600 text-white px-3 py-2 text-sm disabled:opacity-40"
                    onClick={() => approve(o.id)}
                    disabled={o.status !== "delivered"}
                    title={
                      o.status !== "delivered"
                        ? ui.hints.only_after_delivered
                        : ""
                    }
                  >
                    {ui.actions.approve_pay}
                  </button>

                  <button
                    className="inline-flex items-center rounded-lg bg-muted-400 text-ink-900 px-3 py-2 text-sm disabled:opacity-40"
                    onClick={() => requestRevision(o.id)}
                    disabled={o.status !== "delivered"}
                    title={
                      o.status !== "delivered"
                        ? ui.hints.only_after_delivered
                        : ""
                    }
                  >
                    {ui.actions.request_revision}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Toast open={open} kind={kind} message={message} onClose={close} />
    </main>
  );
}

function StatusBadge({ status }) {
  const map = {
    draft: "bg-muted-400 text-ink-900",
    awaiting_provider: "bg-blue-600 text-white",
    accepted: "bg-green-500 text-ink-900",
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
