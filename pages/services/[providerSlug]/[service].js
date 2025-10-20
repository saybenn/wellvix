// /pages/services/[provider]/[service].js
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";
import pageCopy from "@/data/ui/service_page.json";
import providersCopy from "@/data/providers.json"; // only for fallback labels if needed
import {
  findProviderBySlug,
  findServiceByProviderAndSlug,
} from "@/lib/finders";
import DigitalBriefForm from "@/components/orders/DigitalBriefForm"; // your existing component (v2)
import BookingRequestForm from "@/components/booking/BookingRequestForm"; // from Day 7
import { useToast } from "@/components/ui/useToast";
import Toast from "@/components/ui/Toast";
import { formatMoney } from "@/lib/format";

export default function ServiceProductPage() {
  const router = useRouter();
  const { provider: providerSlug, service: serviceSlug } = router.query;
  const [provider, setProvider] = useState(null);
  const [svc, setSvc] = useState(null);

  const { open, kind, message, show, close } = useToast();

  useEffect(() => {
    if (!providerSlug || !serviceSlug) return;
    // Dev JSON load on the server (Next pages). We'll fetch on client here to keep code simple.
    try {
      const p = findProviderBySlug(providerSlug);
      setProvider(p || null);
      if (p) {
        const s = findServiceByProviderAndSlug(p.id, serviceSlug);
        setSvc(s || null);
      }
    } catch (e) {
      console.error(e);
    }
  }, [providerSlug, serviceSlug]);

  const priceLabel = useMemo(() => {
    if (!svc) return "";
    return formatMoney(svc.priceFrom || 0, "usd");
  }, [svc]);

  if (!provider || !svc) {
    return (
      <main className="min-h-screen bg-950 text-white px-6 py-10">
        <div className="mx-auto max-w-5xl">
          <button
            className="text-blue-500 hover:underline"
            onClick={() => router.push(`/providers/${providerSlug || ""}`)}
          >
            {pageCopy.breadcrumb.back}
          </button>
          <div className="mt-6 rounded-xl bg-card-800 p-4 text-ink-700">
            Loading…
          </div>
        </div>
      </main>
    );
  }

  const isDigital = svc.type === "digital";
  const isInPerson = svc.type === "in_person";

  return (
    <main className="min-h-screen bg-950 text-white px-6 py-10">
      <div className="mx-auto max-w-5xl space-y-6">
        <button
          className="text-blue-500 hover:underline"
          onClick={() => router.push(`/providers/${provider.slug}`)}
        >
          {pageCopy.breadcrumb.back}
        </button>

        {/* Header */}
        <header className="rounded-2xl border border-ink-700/10 bg-white p-5 text-ink-900">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold">{svc.title}</h1>
              <p className="text-ink-700">{provider.displayName}</p>
            </div>
            <div className="text-right">
              <div className="text-sm text-ink-700">{pageCopy.header.from}</div>
              <div className="text-xl font-semibold text-ink-900">
                {priceLabel}
              </div>
              {isInPerson && (
                <div className="text-xs text-ink-700">
                  {pageCopy.header.per_session}
                </div>
              )}
            </div>
          </div>

          {svc.description ? (
            <p className="mt-3 text-ink-700">{svc.description}</p>
          ) : null}

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center rounded-xl bg-blue-500 px-2 py-0.5 text-xs text-white">
              {svc.type}
            </span>
            {svc.durationMinutes ? (
              <span className="inline-flex items-center rounded-xl bg-blue-600 px-2 py-0.5 text-xs text-white">
                {pageCopy.meta.duration}: {svc.durationMinutes} min
              </span>
            ) : null}
            {svc.leadTimeDays ? (
              <span className="inline-flex items-center rounded-xl bg-blue-800 px-2 py-0.5 text-xs text-white">
                {pageCopy.meta.lead_time}: {svc.leadTimeDays}d
              </span>
            ) : null}
          </div>
        </header>

        {/* Action panel */}
        <section className="grid gap-6 md:grid-cols-3">
          <div className="md:col-span-2">
            {isDigital && (
              <div className="rounded-2xl border border-ink-700/10 bg-white p-5">
                <h2 className="text-lg font-bold text-ink-900">
                  {pageCopy.panels.digital.heading}
                </h2>
                <p className="text-sm text-ink-700">
                  {pageCopy.panels.digital.subheading}
                </p>

                <div className="mt-4">
                  <DigitalBriefForm
                    copy={{
                      title: "",
                      intro: "",
                      submitLabel: "Save Draft",
                      successTitle: pageCopy.toasts.draft_ok,
                      successBody: "",
                      errorTitle: "Error",
                      errorBody: pageCopy.toasts.draft_err,
                    }}
                    fields={[
                      {
                        id: "summary",
                        label: "Project summary",
                        placeholder: "What do you need?",
                        type: "textarea",
                        required: true,
                      },
                      {
                        id: "links",
                        label: "Links",
                        placeholder: "References (optional)",
                        type: "text",
                        required: false,
                      },
                      {
                        id: "etaDays",
                        label: "Desired ETA (days)",
                        placeholder: "e.g., 7",
                        type: "number",
                        min: 1,
                        required: false,
                      },
                    ]}
                    provider={{
                      id: provider.id,
                      displayName: provider.displayName,
                    }}
                    product={{
                      id: svc.id,
                      title: svc.title,
                      price: (svc.priceFrom || 0) / 100,
                      currency: "usd",
                    }}
                    customer={{ id: "client-demo-456" }} // TODO(Supabase): from session
                    onDraftCreated={(draft) => {
                      // Optional navigation or toast here (DigitalBriefForm already sets its notice).
                    }}
                  />
                </div>
              </div>
            )}

            {isInPerson && (
              <div className="rounded-2xl border border-ink-700/10 bg-white p-5">
                <h2 className="text-lg font-bold text-ink-900">
                  {pageCopy.panels.in_person.heading}
                </h2>
                <p className="text-sm text-ink-700">
                  {pageCopy.panels.in_person.subheading}
                </p>

                <div className="mt-4">
                  <BookingRequestForm
                    copy={{
                      title: "",
                      subtitle: "",
                      date: "Date",
                      start: "Start",
                      end: "End",
                      notes: "Notes (optional)",
                      submit: "Request Booking",
                      requestedToast: pageCopy.toasts.book_ok,
                    }}
                    providerId={provider.id}
                    defaultClientId={"client-demo-456"} // TODO(Supabase): session
                    serviceId={svc.id}
                    onResult={(ok, code) => {
                      if (!ok) {
                        if (code === "outside_availability")
                          show(pageCopy.toasts.outside_avail, "error");
                        else if (code === "overlap")
                          show(pageCopy.toasts.overlap, "error");
                        else show(pageCopy.toasts.book_err, "error");
                      } else {
                        show(pageCopy.toasts.book_ok, "success");
                      }
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Meta / includes */}
          <aside className="rounded-2xl border border-ink-700/10 bg-white p-5">
            <h3 className="text-sm font-semibold text-ink-900">
              {pageCopy.meta.includes}
            </h3>
            <ul className="mt-2 list-disc pl-5 text-sm text-ink-700">
              {(svc.includes || []).map((k) => (
                <li key={k}>{k}</li>
              ))}
            </ul>
          </aside>
        </section>
      </div>

      <Toast open={open} kind={kind} message={message} onClose={close} />
    </main>
  );
}
