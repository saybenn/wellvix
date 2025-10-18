// /components/orders/OrderTable.js
import Link from "next/link";
import StatusBadge from "./StatusBadge";
import Button from "../ui/Button";
import { formatMoney } from "../../lib/format";
import { ORDER } from "../../lib/status";

export default function OrderTable({ ui, orders, onAction }) {
  return (
    <div className="card">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h2 className="text-lg font-semibold">{ui.title}</h2>
          <p className="text-sm token-muted">{ui.subtitle}</p>
        </div>
      </div>

      <div className="overflow-auto">
        <table className="table">
          <thead>
            <tr className="text-left text-sm token-muted">
              <th>{ui.columns.order}</th>
              <th>{ui.columns.client}</th>
              <th>{ui.columns.amount}</th>
              <th>{ui.columns.status}</th>
              <th>{ui.columns.updated}</th>
              <th className="text-right">{ui.columns.actions}</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => {
              const isAccepted = o.status === ORDER.ACCEPTED;
              const isPaid = !!o.paidAt;

              return (
                <tr key={o.id}>
                  <td className="whitespace-nowrap">
                    <div className="font-medium">{o.title ?? "(No title)"}</div>
                    <div className="text-xs token-muted">{o.id}</div>
                  </td>
                  <td className="whitespace-nowrap">
                    {o.clientId?.slice(0, 8) ?? "—"}
                  </td>

                  <td className="whitespace-nowrap">
                    {o._amount || formatMoney(o.priceCents, o.currency)}
                  </td>

                  <td className="whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <StatusBadge
                        status={o.status}
                        labels={ui.status_labels}
                      />
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
                    </div>
                  </td>
                  <td className="whitespace-nowrap text-sm">
                    {new Date(o.updatedAt).toLocaleString()}
                  </td>
                  <td className="whitespace-nowrap">
                    <div className="flex items-center gap-2 justify-end">
                      <Link
                        href={`/provider/orders/${o.id}`}
                        className="button button--ghost"
                      >
                        {ui.actions.view}
                      </Link>

                      {o.status === ORDER.AWAITING_PROVIDER && (
                        <Button onClick={() => onAction(o.id, "accept")}>
                          {ui.actions.accept}
                        </Button>
                      )}

                      {isAccepted && isPaid && (
                        <Button onClick={() => onAction(o.id, "deliver")}>
                          {ui.actions.deliver}
                        </Button>
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

                      {(o.status === ORDER.DELIVERED ||
                        o.status === ORDER.COMPLETED ||
                        o.status === ORDER.CANCELLED ||
                        o.status === ORDER.REFUNDED) && (
                        <Button variant="ghost" disabled>
                          {ui.actions.await_client}
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
            {orders.length === 0 && (
              <tr>
                <td colSpan={6} className="py-8 text-center">
                  <div className="text-lg">{ui.empty.title}</div>
                  <div className="token-muted">{ui.empty.subtitle}</div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
