// /pages/provider/orders/[id].js
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";
import ui from "../../../data/ui/provider_orders.json";
import common from "../../../data/ui/common.json";

import Button from "../../../components/ui/Button";
import StatusBadge from "../../../components/orders/StatusBadge";
import Toast from "../../../components/ui/Toast";
import { useToast } from "../../../components/ui/useToast";
import { ORDER } from "../../../lib/status";
import { formatMoney, formatDateTime } from "../../../lib/format";

/**
 * v2.0 Provider Order Detail
 * - Adds real file upload (dev) via /api/uploads/base64 (returns /uploads/... URLs).
 * - Keeps "paste URL" delivery option for quick links.
 * - "Accept" now allows setting an ETA (optional), sent to /api/orders/accept.
 * - Safer rendering of deliveryFiles whether strings or {url,name,size}.
 * - Uses your Button/Toast/useToast/StatusBadge and reads copy from JSON.
 *
 * TODO(Supabase):
 * - Replace /api/admin/orders read with provider-scoped GET (RLS).
 * - Replace /api/uploads/base64 with Supabase Storage; create OrderFile rows.
 */

export default function OrderDetailPage() {
  const router = useRouter();
  const { id } = router.query;

  const [order, setOrder] = useState(null);
  const [note, setNote] = useState("");
  const [fileUrl, setFileUrl] = useState("");
  const [localFiles, setLocalFiles] = useState([]); // File[]
  const [uploading, setUploading] = useState(false);

  // ETA modal
  const [etaOpen, setEtaOpen] = useState(false);
  const [etaDate, setEtaDate] = useState("");
  const [etaTime, setEtaTime] = useState("17:00");

  const { open, kind, message, show, close } = useToast();

  async function load() {
    // Dev reuse: list + filter. TODO(Supabase): provider-scoped read with RLS.
    const r = await fetch("/api/admin/orders");
    const j = await r.json();
    const o = (j.orders || []).find((x) => x.id === id);
    setOrder(o || null);
  }

  useEffect(() => {
    if (id) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const isAccepted = order?.status === ORDER.ACCEPTED;
  const isPaid = !!order?.paidAt;

  const canAccept = order?.status === ORDER.AWAITING_PROVIDER;
  const canDeliver = isAccepted && isPaid;

  const meta = useMemo(() => {
    if (!order) return [];
    return [
      { k: "Client", v: order.clientId ?? "—" },
      { k: "Amount", v: formatMoney(order.priceCents, order.currency) },
      { k: "Currency", v: (order.currency || "usd").toUpperCase() },
      { k: "Updated", v: formatDateTime(order.updatedAt) },
    ];
  }, [order]);

  function toDeliveryList(val) {
    // Normalize deliveryFiles to [{url,name?}] for display
    if (!val) return [];
    if (Array.isArray(val)) {
      return val.map((item) =>
        typeof item === "string" ? { url: item } : item
      );
    }
    return [];
  }

  async function accept(withEta) {
    try {
      let etaIso = null;
      if (withEta) {
        if (!etaDate) {
          show("Please choose a date for ETA.", "error");
          return;
        }
        // Construct local ISO from date + time
        const iso = new Date(`${etaDate}T${etaTime || "17:00"}:00`);
        etaIso = iso.toISOString();
      }

      const res = await fetch("/api/orders/accept", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: id, eta: etaIso }),
      });

      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        show(j?.error || common.toasts.accept_error, "error");
      } else {
        show(common.toasts.accept_success, "info");
        setEtaOpen(false);
        setEtaDate("");
        setEtaTime("17:00");
      }

      load();
    } catch (e) {
      show(common.toasts.accept_error, "error");
    }
  }

  async function handleUpload() {
    if (!localFiles.length) return [];
    try {
      setUploading(true);
      // Convert files to base64
      const payload = [];
      for (const f of localFiles) {
        const base64 = await fileToBase64(f);
        payload.push({ filename: f.name, contentBase64: base64 });
      }
      const r = await fetch("/api/uploads/base64", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ files: payload }),
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j?.error || "upload_failed");
      return j.files || []; // [{url,name,size}]
    } finally {
      setUploading(false);
    }
  }

  async function deliver() {
    try {
      let uploaded = [];
      if (localFiles.length) {
        uploaded = await handleUpload();
      }

      // Merge a manually pasted URL if present
      const manual = fileUrl.trim()
        ? [{ url: fileUrl.trim(), name: inferName(fileUrl.trim()) }]
        : [];

      const files = [...uploaded, ...manual];

      const res = await fetch("/api/orders/deliver", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: id,
          note,
          files, // supports array of {url,name,size}
        }),
      });
      const j = await res.json();
      if (!res.ok || !j.ok) {
        show(j?.error || common.toasts.deliver_error, "error");
      } else {
        show(common.toasts.deliver_success, "info");
        setNote("");
        setFileUrl("");
        setLocalFiles([]);
      }

      load();
    } catch (e) {
      show(common.toasts.deliver_error, "error");
    }
  }

  if (!order) {
    return (
      <main className="page-shell">
        <div className="mx-auto max-w-4xl p-6 token-muted">Loading…</div>
      </main>
    );
  }

  const deliveredList = toDeliveryList(order.deliveryFiles);

  return (
    <main className="page-shell">
      <div className="mx-auto max-w-[1100px] p-4 md:p-6 space-y-4">
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
              <div className="token-muted text-sm">{order.id}</div>
            </div>

            <div className="flex items-center gap-2">
              <StatusBadge status={order.status} labels={ui.status_labels} />
              {isPaid && (
                <span
                  className="inline-flex items-center rounded-xl px-2 py-0.5 text-xs"
                  style={{
                    background: "rgba(34,197,94,.12)", // green-500/12
                    border: "1px solid rgba(34,197,94,.35)",
                    color: "var(--ink-900)",
                  }}
                >
                  Paid — Work Authorized
                </span>
              )}
            </div>
          </div>

          {/* Top meta */}
          <div className="mt-4 grid gap-6 md:grid-cols-2">
            <section className="space-y-3">
              <h3 className="font-semibold">{ui.detail.timeline}</h3>
              <ul className="space-y-2 text-sm">
                <li>Created • {formatDateTime(order.createdAt)}</li>
                {order.paidAt && <li>Paid • {formatDateTime(order.paidAt)}</li>}
                {order.acceptedAt && (
                  <li>Accepted • {formatDateTime(order.acceptedAt)}</li>
                )}
                {order.eta && <li>ETA • {formatDateTime(order.eta)}</li>}
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
                {deliveredList.length > 0 && (
                  <li className="flex flex-wrap gap-2">
                    <span>{ui.detail.delivery_files} •</span>
                    <span className="space-x-2">
                      {deliveredList.map((f, i) => (
                        <a
                          key={i}
                          href={f.url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-blue-600 hover:underline"
                          title={f.name || f.url}
                        >
                          {f.name || shortUrl(f.url)}
                        </a>
                      ))}
                    </span>
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

          {/* Actions */}
          <div className="mt-6 border-t border-white/10 pt-4 flex flex-col gap-3">
            {canAccept && (
              <div className="flex flex-wrap items-center gap-2">
                <Button onClick={() => accept(false)}>
                  {ui.actions.accept}
                </Button>
                <Button variant="ghost" onClick={() => setEtaOpen(true)}>
                  {ui.detail?.set_eta_button || "Accept + set ETA"}
                </Button>
              </div>
            )}

            {isAccepted && !isPaid && (
              <Button
                variant="ghost"
                disabled
                title="Waiting for client payment"
              >
                {ui.actions.await_payment || "Await Payment"}
              </Button>
            )}

            {canDeliver && (
              <>
                <div className="flex flex-col gap-2 md:flex-row md:items-center">
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
                </div>

                <div className="flex flex-col gap-2 md:flex-row md:items-center">
                  <input
                    type="file"
                    multiple
                    onChange={(e) =>
                      setLocalFiles(Array.from(e.target.files || []))
                    }
                    className="input md:max-w-lg"
                  />
                  <Button onClick={deliver} disabled={uploading}>
                    {uploading
                      ? ui.actions.uploading || "Uploading…"
                      : ui.actions.deliver}
                  </Button>
                </div>
                <p className="text-xs token-muted">
                  {/* TODO(Supabase): Direct upload to Supabase Storage + OrderFile rows */}
                  In dev, files are stored under <code>/public/uploads</code>.
                </p>
              </>
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

      {/* ETA Modal */}
      {etaOpen && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-ink-900/40">
          <div className="w-full max-w-md rounded-2xl bg-white p-4 shadow-xl">
            <h4 className="text-base font-semibold text-ink-900">
              {ui.detail?.set_eta_title || "Set ETA (optional)"}
            </h4>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <label className="text-xs text-ink-700">
                {ui.detail?.eta_date_label || "Date"}
                <input
                  type="date"
                  className="mt-1 w-full rounded-xl border border-ink-700/15 bg-white px-3 py-2 text-ink-900"
                  value={etaDate}
                  onChange={(e) => setEtaDate(e.target.value)}
                />
              </label>
              <label className="text-xs text-ink-700">
                {ui.detail?.eta_time_label || "Time"}
                <input
                  type="time"
                  className="mt-1 w-full rounded-xl border border-ink-700/15 bg-white px-3 py-2 text-ink-900"
                  value={etaTime}
                  onChange={(e) => setEtaTime(e.target.value)}
                />
              </label>
            </div>

            <div className="mt-4 flex items-center justify-end gap-2">
              <Button variant="ghost" onClick={() => setEtaOpen(false)}>
                {ui.actions.cancel || "Cancel"}
              </Button>
              <Button onClick={() => accept(true)}>
                {ui.detail?.eta_save_button || "Accept with ETA"}
              </Button>
            </div>
          </div>
        </div>
      )}

      <Toast open={open} kind={kind} message={message} onClose={close} />
    </main>
  );
}

/** Helpers **/
function inferName(url) {
  try {
    const u = new URL(url, "http://x");
    const last = u.pathname.split("/").filter(Boolean).pop();
    return last || url;
  } catch {
    return url;
  }
}

async function fileToBase64(file) {
  const buf = await file.arrayBuffer();
  // window.btoa on large strings can choke; Buffer is fine in Next (browser polyfilled)
  return `data:${file.type || "application/octet-stream"};base64,${Buffer.from(
    buf
  ).toString("base64")}`;
}

function shortUrl(url) {
  if (url.length <= 42) return url;
  return url.slice(0, 20) + "…" + url.slice(-18);
}
