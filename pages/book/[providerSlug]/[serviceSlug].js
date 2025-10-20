// /pages/book/[providerSlug]/[serviceSlug].js
import { useRouter } from "next/router";
import providers from "@/data/providers.json";
import services from "@/data/provider_services.json";
import ui from "@/data/ui/catalog.json";
import AvailabilityCalendar from "@/components/booking/AvailabilityCalendar";
import DigitalBriefForm from "@/components/forms/DigitalBriefForm";

export default function BookServicePage() {
  const { query } = useRouter();
  const provider = providers.find((p) => p.slug === query.providerSlug);
  const service = services.find(
    (s) => s.slug === query.serviceSlug && s.provider_id === provider?.id
  );

  if (!provider || !service) {
    return (
      <main className="min-h-screen bg-950 text-white px-6 py-10">
        <div className="mx-auto max-w-11/12">Loading…</div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-950 text-white px-6 py-10">
      <div className="mx-auto max-w-11/12 space-y-6">
        <header className="space-y-1">
          <div className="text-xl font-semibold text-ink-900">
            {provider.displayName}
          </div>
          <h1 className="text-2xl font-bold text-ink-700">{service.title}</h1>
        </header>

        {service.type === "in_person" ? (
          <AvailabilityCalendar
            copy={ui.booking}
            provider={provider}
            service={service}
          />
        ) : (
          <DigitalBriefForm
            copy={{
              title: ui.digital.title,
              intro: ui.digital.intro,
              submitLabel: ui.digital.submit,
              successTitle: "Saved",
              successBody: "Draft created.",
              errorTitle: "Error",
              errorBody: "Please try again.",
            }}
            fields={[
              {
                id: "summary",
                label: "Summary",
                placeholder: "Short description…",
                type: "text",
                required: true,
              },
              {
                id: "details",
                label: "Details",
                placeholder: "What are we delivering?",
                type: "textarea",
                required: true,
              },
              {
                id: "etaDays",
                label: ui.digital.eta_label,
                type: "number",
                min: 1,
                required: true,
              },
              {
                id: "refUrl",
                label: ui.digital.file_label,
                type: "url",
                required: false,
              },
            ]}
            provider={{ id: provider.id, displayName: provider.displayName }}
            product={{
              id: service.id,
              title: service.title,
              price: (service.priceFrom || 0) / 100,
              currency: "usd",
            }}
            customer={{ id: "client-demo-456" }}
          />
        )}
      </div>
    </main>
  );
}
