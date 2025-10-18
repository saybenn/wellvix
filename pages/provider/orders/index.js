// /pages/provider/orders/index.js
import { useEffect, useMemo, useState } from "react";
import ui from "../../../data/ui/provider_orders.json";
import common from "../../../data/ui/common.json";
import OrderTable from "../../../components/orders/OrderTable";
import Button from "../../../components/ui/Button";
import Toast from "../../../components/ui/Toast";
import { useToast } from "../../../components/ui/useToast";
import { formatMoney } from "../../../lib/format";
import { ORDER } from "../../../lib/status";

export default function ProviderOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState("all");
  const [deliveryModal, setDeliveryModal] = useState({
    open: false,
    orderId: null,
    note: "",
    fileUrl: "",
  });
  const { open, kind, message, show, close } = useToast();

  // TODO (Supabase Auth/RLS): fetch only orders for the logged-in provider.
  async function load() {
    const r = await fetch("/api/admin/orders"); // dev reuse
    const j = await r.json();
    const arr = Array.isArray(j.orders) ? j.orders : [];
    setOrders(arr);
  }
  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const data =
      filter === "all" ? orders : orders.filter((o) => o.status === filter);
    // format money client-side for display (optional mapping pass)
    return data.map((o) => ({
      ...o,
      _amount: formatMoney(o.priceCents, o.currency),
    }));
  }, [orders, filter]);

  async function onAction(orderId, action) {
    if (action === "deliver") {
      setDeliveryModal({ open: true, orderId, note: "", fileUrl: "" });
      return;
    }
    if (action === "accept") {
      // optimistic UI
      setOrders((prev) =>
        prev.map((o) =>
          o.id === orderId
            ? {
                ...o,
                status: ORDER.accepted,
                acceptedAt: new Date().toISOString(),
              }
            : o
        )
      );
      const res = await fetch("/api/orders/accept", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId }),
      });
      if (!res.ok) {
        // rollback
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, status: ORDER.PAID } : o))
        );
        show(common.toasts.accept_error, "error");
      } else {
        show(common.toasts.accept_success, "info");
        load();
      }
    }
  }

  async function saveDelivery() {
    const { orderId, note, fileUrl } = deliveryModal;
    // optimistic UI
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? {
              ...o,
              status: ORDER.DELIVERED,
              deliveryNote: note,
              deliveryFiles: fileUrl ? [fileUrl] : [],
            }
          : o
      )
    );

    const res = await fetch("/api/orders/deliver", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId, note, files: fileUrl ? [fileUrl] : [] }),
    });
    const j = await res.json();

    if (!j.ok) {
      // rollback to accepted
      setOrders((prev) =>
        prev.map((o) =>
          o.id === orderId ? { ...o, status: ORDER.accepted } : o
        )
      );
      show(common.toasts.deliver_error, "error");
    } else {
      show(common.toasts.deliver_success, "info");
      setDeliveryModal({ open: false, orderId: null, note: "", fileUrl: "" });
      load();
    }
  }

  return (
    <main className="page-shell">
      <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-4">
        <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold">{ui.title}</h1>
            <p className="token-muted">{ui.subtitle}</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            {Object.entries(ui.filters).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={`button ${filter === key ? "" : "button--ghost"}`}
              >
                {label}
              </button>
            ))}
          </div>
        </header>

        {/* NOTE: OrderTable still formats amount from _amount if present */}
        <OrderTable ui={ui} orders={filtered} onAction={onAction} />
      </div>

      {/* Delivery Modal */}
      {deliveryModal.open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="card max-w-1/2 w-full">
            <h3 className="text-xl font-semibold mb-3">{ui.actions.deliver}</h3>
            <div className="space-y-3">
              <label className="block text-sm">{ui.detail.notes}</label>
              <textarea
                className="textarea"
                rows={4}
                placeholder="What did you deliver? Any notes for the client."
                value={deliveryModal.note}
                onChange={(e) =>
                  setDeliveryModal({ ...deliveryModal, note: e.target.value })
                }
              />
              <label className="block text-sm">{ui.detail.fileUrl}</label>
              <input
                className="input"
                placeholder="https://..."
                value={deliveryModal.fileUrl}
                onChange={(e) =>
                  setDeliveryModal({
                    ...deliveryModal,
                    fileUrl: e.target.value,
                  })
                }
              />
              <div className="flex gap-2 justify-end">
                <Button
                  className="button button--ghost hover:cursor-pointer"
                  variant="ghost"
                  onClick={() =>
                    setDeliveryModal({
                      open: false,
                      orderId: null,
                      note: "",
                      fileUrl: "",
                    })
                  }
                >
                  {ui.actions.cancel}
                </Button>
                <Button
                  className="button  hover:cursor-pointer"
                  disabled={!deliveryModal.note}
                  onClick={saveDelivery}
                >
                  {ui.actions.saveDelivery}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Toast open={open} kind={kind} message={message} onClose={close} />
    </main>
  );
}
