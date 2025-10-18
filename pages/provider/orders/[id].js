// /pages/provider/orders/[id].js
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import ui from "../../../data/ui/provider_orders.json";
import common from "../../../data/ui/common.json";

import Button from "../../../components/ui/Button";
import StatusBadge from "../../../components/orders/StatusBadge";
import Toast from "../../../components/ui/Toast";
import { useToast } from "../../../components/ui/useToast";
import { ORDER } from "../../../lib/status";
import { formatMoney, formatDateTime } from "../../../lib/format";

export default function OrderDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const [order, setOrder] = useState(null);
  const [note, setNote] = useState("");
  const [fileUrl, setFileUrl] = useState("");
  const { open, kind, message, show, close } = useToast();

  async function load() {
    // Dev reuse: list + filter. TODO Supabase: provider-scoped read with RLS.
    const r = await fetch("/api/admin/orders");
    const j = await r.json();
    const o = (j.orders || []).find((x) => x.id === id);
    setOrder(o || null);
  }
  useEffect(() => {
    if (id) load();
  }, [id]);

  async function accept() {
    const res = await fetch("/api/orders/accept", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId: id }),
    });
    if (!res.ok) show(common.toasts.accept_error, "error");
    else show(common.toasts.accept_success, "info");

    load();
  }
  async function deliver() {
    const res = await fetch("/api/orders/deliver", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        orderId: id,
        note,
        files: fileUrl ? [fileUrl] : [],
      }),
    });
    const j = await res.json();
    if (!j.ok) show(common.toasts.deliver_error, "error");
    else show(common.toasts.deliver_success, "info");

    setNote("");
    setFileUrl("");
    load();
  }

  if (!order) {
    return (
      <main className="page-shell">
        <div className="max-w-4xl mx-auto p-6 token-muted">Loading…</div>
      </main>
    );
  }

  const isAccepted = order.status === ORDER.ACCEPTED;
  const isPaid = !!order.paidAt;

  const meta = [
    { k: "Client", v: order.clientId ?? "—" },
    { k: "Amount", v: formatMoney(order.priceCents, order.currency) },
    { k: "Currency", v: (order.currency || "usd").toUpperCase() },
    { k: "Updated", v: formatDateTime(order.updatedAt) },
  ];

  return (
    <main className="page-shell">
      <div className="max-w-11/12 mx-auto p-4 md:p-6 space-y-4">
        <Button
          className="button--ghost button hover:cursor-pointer"
          onClick={() => router.push("/provider/orders")}
        >
          {ui.actions.back}
        </Button>

        <div className="card">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-xl font-bold">{ui.detail.header}</h1>
              <div className="text-sm token-muted">{order.id}</div>
            </div>
            <div className="flex items-center gap-2">
              <StatusBadge status={order.status} labels={ui.status_labels} />
              {isPaid && (
                <span
                  className="inline-flex items-center rounded-xl px-2 py-0.5 text-xs"
                  style={{
                    background: "rgba(34,197,94,.12)",
                    border: "1px solid rgba(34,197,94,.35)",
                  }}
                >
                  Paid — Work Authorized
                </span>
              )}
            </div>{" "}
          </div>

          <div className="grid md:grid-cols-2 gap-6 mt-4">
            <section className="space-y-3">
              <h3 className="font-semibold">{ui.detail.timeline}</h3>
              <ul className="space-y-2 text-sm">
                <li>Created • {formatDateTime(order.createdAt)}</li>
                {order.paidAt && <li>Paid • {formatDateTime(order.paidAt)}</li>}
                {order.acceptedAt && (
                  <li>Accepted • {formatDateTime(order.acceptedAt)}</li>
                )}
                {order.deliveredAt && (
                  <li>Delivered • {formatDateTime(order.deliveredAt)}</li>
                )}
                {order.completedAt && (
                  <li>Completed • {formatDateTime(order.completedAt)}</li>
                )}
                {typeof order.revisionCount === "number" && (
                  <li>Revisions • {order.revisionCount}</li>
                )}
                {order.deliveryNote && (
                  <li>
                    {ui.detail.delivery_note} • {order.deliveryNote}
                  </li>
                )}
                {Array.isArray(order.deliveryFiles) &&
                  order.deliveryFiles.length > 0 && (
                    <li>
                      {ui.detail.delivery_files} •{" "}
                      {order.deliveryFiles.join(", ")}
                    </li>
                  )}
              </ul>
            </section>

            <section className="space-y-3">
              <h3 className="font-semibold">{ui.detail.meta}</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                {meta.map((m) => (
                  <div key={m.k}>
                    <div className="token-muted">{m.k}</div>
                    <div>{m.v}</div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <div className="mt-6 border-t border-white/10 pt-4 flex flex-col gap-3">
            {order.status === ORDER.AWAITING_PROVIDER && (
              <Button onClick={accept}>{ui.actions.accept}</Button>
            )}

            {isAccepted && !isPaid && (
              <Button
                variant="ghost"
                disabled
                title="Waiting for client payment"
              >
                Await Payment
              </Button>
            )}

            {isAccepted && isPaid && (
              <div className="flex flex-col md:flex-row gap-2 md:items-center">
                <input
                  className="input md:max-w-md"
                  placeholder="Delivery URL (zip/drive/loom…)"
                  value={fileUrl}
                  onChange={(e) => setFileUrl(e.target.value)}
                />
                <input
                  className="input md:flex-1"
                  placeholder="Short delivery note…"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
                <Button onClick={deliver} disabled={!fileUrl}>
                  {ui.actions.deliver}
                </Button>
              </div>
            )}

            {(order.status === ORDER.DELIVERED ||
              order.status === ORDER.COMPLETED) && (
              <Button variant="ghost" disabled>
                {ui.actions.await_client}
              </Button>
            )}
          </div>
        </div>
      </div>
      <Toast open={open} kind={kind} message={message} onClose={close} />
    </main>
  );
}
