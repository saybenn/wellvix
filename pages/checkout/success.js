// /pages/checkout/success.js
import { useRouter } from "next/router";

export default function CheckoutSuccess() {
  const { query } = useRouter();
  const orderId = query.orderId;

  return (
    <main className="min-h-screen bg-950 text-white px-6 py-10">
      <div className="mx-auto max-w-11/12 rounded-2xl bg-card-800 p-6 shadow">
        <h1 className="text-2xl font-semibold">Thank you! 🎉</h1>
        <p className="mt-2 text-ink-700">
          Your payment was received. We’ve created order{" "}
          <span className="text-white">{orderId || "(loading...)"}</span>.
        </p>
        <div className="mt-4 space-y-2 text-sm text-ink-700">
          <p>
            Status will change to <span className="text-white">paid</span> once
            Stripe confirms (webhook).
          </p>
          <p>Provider will start work after they accept the order.</p>
        </div>
        <div className="mt-6 flex gap-3">
          <a
            href={`/orders/${orderId || ""}`}
            className="rounded-lg bg-blue-600 hover:bg-blue-500 text-white px-4 py-2"
          >
            View order
          </a>
          <a
            href="/admin/dev/orders"
            className="rounded-lg bg-green-500 text-ink-900 px-4 py-2"
          >
            Admin orders (dev)
          </a>
        </div>
      </div>
    </main>
  );
}
