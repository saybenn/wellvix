import { useRouter } from "next/router";
import providers from "../../../../data/providers.json";
import services from "../../../../data/provider_services.json";
import Link from "next/link";
import { SEO, getMeta, websiteJsonLd } from "../../../../lib/seo";
import { site as siteStatic } from "../../../../lib/siteConfig";

/**
 * Service Detail page
 * - Finds provider by [provider] slug and service by [service] slug (scoped to the provider).
 * - Renders title, priceFrom, type badge, description, what-you-get, FAQ.
 * - NOTE (Supabase): Replace JSON imports with server-side fetch:
 *     const prov = await supabase.from('providers').select('id,slug,display_name').eq('slug', providerSlug).single()
 *     const svc = await supabase.from('provider_services').select('*').eq('provider_id', prov.id).eq('slug', serviceSlug).single()
 */
export default function ServiceDetailPage() {
  const router = useRouter();
  const { provider: providerSlug, service: serviceSlug } = router.query;

  const provider = providers.find((p) => p.slug === providerSlug);
  const service = services.find(
    (s) => s.slug === serviceSlug && s.provider_id === provider?.id
  );

  const title =
    service && provider
      ? `${service.title} — ${provider.display_name}`
      : siteStatic?.meta?.title;

  const description = service?.description ?? siteStatic?.meta?.description;

  const jsonLd =
    service && provider
      ? [
          {
            "@context": "https://schema.org",
            "@type": "Service",
            name: service.title,
            provider: {
              "@type": "Organization",
              name: provider.display_name,
              url: `${siteStatic?.meta?.url}/p/${provider.slug}`,
            },
            offers: {
              "@type": "Offer",
              price:
                typeof service.price_from === "number"
                  ? (service.price_from / 100).toFixed(2)
                  : undefined,
              priceCurrency: "USD",
              url: `${siteStatic?.meta?.url}/p/${provider.slug}/s/${service.slug}`,
            },
          },
          websiteJsonLd({ name: siteStatic.brand, url: siteStatic?.meta?.url }),
        ]
      : [];

  if (!provider || !service) {
    return (
      <main className="container-x py-16">
        <p className="text-ink-700">Not found.</p>
      </main>
    );
  }

  return (
    <>
      <SEO
        meta={getMeta({ title, description, url: siteStatic?.meta?.url })}
        jsonLd={jsonLd}
      />

      <section className="bg-white">
        <div className="container-x py-10 grid gap-8 lg:grid-cols-3">
          {/* Left: content */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 text-xs">
              <span className="inline-flex items-center rounded-full border border-muted-400/40 px-2 py-0.5 text-ink-700">
                {service.type === "digital" ? "Digital" : "In-person"}
              </span>
              {typeof service.duration_minutes === "number" ? (
                <span className="text-ink-700">
                  {service.duration_minutes} min
                </span>
              ) : null}
            </div>

            <h1 className="mt-2 text-3xl md:text-4xl font-semibold text-ink-900">
              {service.title}
            </h1>

            {service.description ? (
              <p className="mt-2 text-ink-700 leading-relaxed">
                {service.description}
              </p>
            ) : null}

            {/* What you get */}
            {Array.isArray(service.what_you_get) &&
            service.what_you_get.length ? (
              <div className="mt-6">
                <h2 className="text-xl font-semibold text-ink-900">
                  What you get
                </h2>
                <ul className="mt-2 list-disc pl-5 space-y-1 text-ink-700">
                  {service.what_you_get.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </div>
            ) : null}

            {/* FAQ */}
            {Array.isArray(service.faq) && service.faq.length ? (
              <div className="mt-8">
                <h2 className="text-xl font-semibold text-ink-900">FAQ</h2>
                <div className="mt-2 space-y-3">
                  {service.faq.map((qa, i) => (
                    <details
                      key={i}
                      className="rounded-2xl border border-muted-400/30 bg-white p-4 open:shadow-sm"
                    >
                      <summary className="cursor-pointer list-none text-ink-900 font-medium">
                        {qa.q}
                      </summary>
                      <p className="mt-2 text-ink-700">{qa.a}</p>
                    </details>
                  ))}
                </div>
              </div>
            ) : null}
          </div>

          {/* Right: actions */}
          <aside className="lg:col-span-1">
            <div className="rounded-2xl border border-muted-400/30 bg-white p-5 sticky top-24">
              {typeof service.price_from === "number" ? (
                <p className="text-2xl font-semibold text-ink-900">
                  ${(service.price_from / 100).toFixed(0)}
                  <span className="text-sm text-ink-700 ml-1">from</span>
                </p>
              ) : null}

              <div className="mt-4 space-y-2">
                {service.type === "digital" ? (
                  <Link
                    href={`/p/${provider.slug}/checkout/${service.slug}`}
                    className="block text-center rounded-xl bg-blue-600 text-white px-4 py-2 hover:bg-blue-500 transition"
                    data-cta="start_brief"
                  >
                    Start brief
                  </Link>
                ) : (
                  <Link
                    href={`/p/${provider.slug}/s/${service.slug}#availability`}
                    className="block text-center rounded-xl bg-blue-600 text-white px-4 py-2 hover:bg-blue-500 transition"
                    data-cta="request_booking"
                  >
                    Request booking
                  </Link>
                )}

                <Link
                  href={`/p/${provider.slug}`}
                  className="block text-center rounded-xl border border-muted-400/40 text-ink-900 px-4 py-2 hover:border-blue-600 transition"
                >
                  View provider
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </section>

      {/* Placeholder anchor for availability widget (to be implemented on this page later) */}
      <div id="availability" className="container-x py-8"></div>
    </>
  );
}
