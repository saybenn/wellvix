// /pages/provider/availability.js
import dynamic from "next/dynamic";
import bookingCopy from "@/data/ui/booking.json";
import ExceptionsEditor from "@/components/booking/ExceptionsEditor";

import Toast from "@/components/ui/Toast";
import { useToast } from "@/components/ui/useToast";

// Load availability editor client-only to be extra safe with SSR/localStorage.
const AvailabilityEditor = dynamic(
  () => import("@/components/booking/AvailabilityEditor"),
  { ssr: false }
);

export default function ProviderAvailabilityPage() {
  const providerId = "prov-alpha"; // TODO(Supabase): from session/profile
  const { open, kind, message, show, close } = useToast();

  return (
    <main className="min-h-screen p-6 bg-[var(--bg-950)]">
      <div className="mx-auto max-w-11/12 space-y-6">
        <h1 className="text-2xl font-bold text-[var(--white)]">
          {bookingCopy?.availabilityEditor?.title || "Availability"}
        </h1>
        <p className="text-sm text-[var(--white)]/70">
          {bookingCopy?.availabilityEditor?.subtitle ||
            "Set your weekly open hours."}
        </p>

        <AvailabilityEditor
          copy={bookingCopy.availabilityEditor}
          providerId={providerId}
          onSaved={() =>
            show(
              bookingCopy?.availabilityEditor?.savedToast ||
                "Availability saved.",
              "info"
            )
          }
        />

        <ExceptionsEditor
          copy={bookingCopy.exceptionsEditor}
          providerId={providerId}
          onSaved={() =>
            show(
              bookingCopy?.exceptionsEditor?.savedToast || "Exceptions saved.",
              "info"
            )
          }
        />
      </div>

      <Toast open={open} kind={kind} message={message} onClose={close} />
    </main>
  );
}
