import BookingRequestForm from "@/components/booking/BookingRequestForm";
import bookingCopy from "@/data/ui/booking.json";
import Toast from "@/components/ui/Toast";
import { useToast } from "@/components/ui/useToast";

export default function BookDemoPage() {
  const providerId = "prov-blend";
  const clientId = "client-demo-456";
  const t = useToast();

  return (
    <main className="p-6 bg-950 min-h-screen">
      <div className="mx-auto max-w-11/12 space-y-6">
        <h1 className="text-2xl font-bold text-white">Book a Session</h1>
        <BookingRequestForm
          copy={bookingCopy.bookingRequestForm}
          providerId={providerId}
          defaultClientId={clientId}
        />
      </div>
      <Toast
        open={t.open}
        kind={t.kind}
        message={t.message}
        onClose={t.close}
      />
    </main>
  );
}
