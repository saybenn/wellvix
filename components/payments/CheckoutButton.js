// /components/payments/CheckoutButton.jsx
import { useState } from "react";
import copy from "@/data/copy.json";

export default function CheckoutButton({
  orderId,
  className = "",
  onError = () => {},
}) {
  const [loading, setLoading] = useState(false);

  async function startCheckout() {
    try {
      setLoading(true);
      const res = await fetch("/api/stripe/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create session");
      window.location.href = data.url;
    } catch (e) {
      console.error(e);
      onError(e);
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={startCheckout}
      disabled={loading}
      className={`w-full rounded-lg px-4 py-3 font-medium
        ${
          loading
            ? "bg-muted-400 cursor-not-allowed"
            : "bg-blue-600 hover:bg-blue-500"
        }
        text-white shadow-sm ring-1 ring-ink-700/10 transition ${className}`}
      aria-busy={loading}
      data-cta="checkout"
    >
      {loading ? copy.buttons.loading : copy.buttons.checkout}
    </button>
  );
}
