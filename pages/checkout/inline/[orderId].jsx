// /pages/checkout/inline/[orderId].js
import { useRouter } from "next/router";
import InlinePaymentForm from "@/components/payments/InlinePaymentForm";

export default function InlineCheckoutPage() {
  const router = useRouter();
  const { orderId } = router.query;

  if (!orderId) return null;

  return (
    <main className="min-h-screen bg-950 text-white px-6 py-10">
      <div className="mx-auto not-even:space-y-6">
        <h1 className="text-2xl text-white font-semibold">Secure Payment</h1>
        <InlinePaymentForm orderId={orderId} />
      </div>
    </main>
  );
}
