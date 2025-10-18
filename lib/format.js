// /lib/format.js
export function formatMoney(cents, currency = "usd", locale = undefined) {
  if (typeof cents !== "number") return "—";
  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: (currency || "usd").toUpperCase(),
    }).format(cents / 100);
  } catch {
    const cur = (currency || "USD").toUpperCase();
    return `${cur} ${(cents / 100).toFixed(2)}`;
  }
}

export function formatDateTime(isoLike) {
  if (!isoLike) return "—";
  const dt = new Date(isoLike);
  if (isNaN(dt.getTime())) return "—";
  return dt.toLocaleString();
}
