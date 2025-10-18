// /components/ui/Toast.jsx
import { useEffect } from "react";

export default function Toast({
  open,
  kind = "info",
  message,
  onClose,
  duration = 4000,
}) {
  useEffect(() => {
    if (!open) return;
    const id = setTimeout(() => onClose?.(), duration);
    return () => clearTimeout(id);
  }, [open, duration, onClose]);

  if (!open) return null;

  const bg = kind === "error" ? "rgba(239,68,68,.12)" : "rgba(34,197,94,.12)";
  const border =
    kind === "error" ? "rgba(239,68,68,.35)" : "rgba(34,197,94,.35)";
  const color = "var(--white)";

  return (
    <div
      role="status"
      className="fixed left-1/2 -translate-x-1/2 top-6 z-50"
      aria-live="polite"
    >
      <div
        className="rounded-xl px-4 py-3 text-sm shadow"
        style={{
          background: bg,
          color,
          border: `1px solid ${border}`,
          backdropFilter: "blur(8px)",
        }}
      >
        {message}
      </div>
    </div>
  );
}
