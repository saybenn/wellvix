import BookingTable from "@/components/booking/BookingTable";
import bookingCopy from "@/data/ui/booking.json";
import Toast from "@/components/ui/Toast";
import { useToast } from "@/components/ui/useToast";

export default function ProviderBookingsPage() {
  const providerId = "provider-demo-123";
  const t = useToast();

  return (
    <main className="p-6 bg-950 min-h-screen">
      <div className="mx-auto max-w-4xl space-y-6">
        <h1 className="text-2xl font-bold text-white">Bookings</h1>
        <BookingTable copy={bookingCopy.bookingTable} providerId={providerId} />
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
