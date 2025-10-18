// /components/orders/StatusBadge.js
export default function StatusBadge({ status, labels }) {
  const classes = {
    draft: "badge badge--draft",
    paid: "badge badge--paid",
    accepted: "badge badge--accepted",
    delivered: "badge badge--delivered",
    completed: "badge badge--completed",
    refunded: "badge badge--refunded",
    cancelled: "badge badge--cancelled",
  };
  const fallback = (status || "")
    .replace("_", " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
  const label = labels?.[status] ?? fallback;
  const cls = classes[status] || "badge";
  return <span className={cls}>{label}</span>;
}
