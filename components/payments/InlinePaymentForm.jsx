// /components/payments/InlinePaymentForm.jsx
import { useEffect, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import copy from "@/data/copy.json";

// Load publishable key from env (exposed)
const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
);

/**
 * Wrapper that fetches clientSecret for the order and mounts the Payment Element.
 * Tailwind tokens used: bg-950, card-800, ink-700, blue-600, blue-500, white, muted-400, green-500.
 */
export default function InlinePaymentForm({ orderId, appearance = {} }) {
  const [clientSecret, setClientSecret] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const resp = await fetch("/api/stripe/create-payment-intent", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderId }),
        });
        const data = await resp.json();
        if (!resp.ok) throw new Error(data.error || "Unable to init payment");
        if (isMounted) setClientSecret(data.clientSecret);
      } catch (e) {
        setError(e.message);
      }
    })();
    return () => (isMounted = false);
  }, [orderId]);

  // Appearance config (keep subtle; matches your token palette)
  const baseAppearance = {
    theme: "stripe",
    variables: {
      colorPrimary: "#2563EB", // blue-600
      colorBackground: "#0B0B0F", // bg-950
      colorText: "#EDEDED", // white-ish
      colorDanger: "#EF4444",
      fontFamily: "Inter, system-ui, sans-serif",
      borderRadius: "10px",
    },
    rules: {
      ".Input": { backgroundColor: "#1C1F24" }, // card-800
      ".Label": { color: "#9AA0A6" }, // ink-700-ish
    },
  };

  if (error) {
    return (
      <div className="rounded-lg bg-card-800 p-4 text-ink-700">{error}</div>
    );
  }

  if (!clientSecret) {
    return (
      <div className="rounded-lg bg-card-800 p-4 text-ink-700">
        Loading payment…
      </div>
    );
  }

  return (
    <Elements
      stripe={stripePromise}
      options={{
        clientSecret,
        appearance: { ...baseAppearance, ...appearance },
      }}
    >
      <Form orderId={orderId} />
    </Elements>
  );
}

function Form({ orderId }) {
  const stripe = useStripe();
  const elements = useElements();
  const [submitting, setSubmitting] = useState(false);
  const t = copy.buttons;

  async function onSubmit(e) {
    e.preventDefault();
    if (!stripe || !elements) return;

    setSubmitting(true);
    // Confirm in place; prefer no redirect
    const { error } = await stripe.confirmPayment({
      elements,
      redirect: "if_required", // stay on-site unless bank requires a redirect
      // If you want a return_url fallback for SCA:
      // confirmParams: { return_url: `${window.location.origin}/checkout/success?orderId=${orderId}` },
    });

    if (error) {
      console.error(error);
      setSubmitting(false);
      alert(error.message || "Payment failed. please try another card.");
    } else {
      // Payment may already be succeeded (no redirect). Webhook will set status=paid.
      window.location.href = `/checkout/success?orderId=${encodeURIComponent(
        orderId
      )}`;
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="rounded-xl bg-card-800 p-6 shadow ring-1 ring-ink-700/10"
    >
      <PaymentElement />
      <button
        type="submit"
        disabled={!stripe || submitting}
        className={`mt-4 w-full rounded-lg px-4 py-3 font-medium
          ${
            submitting
              ? "bg-muted-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-500"
          }
          text-white transition`}
      >
        {submitting ? t.loading : t.checkout}
      </button>
      <p className="mt-2 text-sm text-ink-700">
        Your card is processed securely on this page. No redirects.
      </p>
    </form>
  );
}
