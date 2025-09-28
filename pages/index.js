import { site as siteStatic } from "../lib/siteConfig";
import { SEO, getMeta, organizationJsonLd, websiteJsonLd } from "../lib/seo";

export default function Home() {
  const meta = getMeta({
    title: siteStatic?.meta?.title,
    description: siteStatic?.meta?.description,
    url: siteStatic?.meta?.url,
  });

  const jsonLd = [
    organizationJsonLd({
      name: siteStatic.brand,
      url: siteStatic?.meta?.url,
      logo: siteStatic?.logo?.src,
    }),
    websiteJsonLd({
      name: siteStatic.brand,
      url: siteStatic?.meta?.url,
    }),
  ];

  return (
    <>
      <SEO meta={meta} jsonLd={jsonLd} />

      <section className="bg-bg-950 text-white">
        <div className="container-x py-24">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold">
            {siteStatic.tagline}
          </h1>
          <p className="mt-4 text-white/70 max-w-2xl">
            Provider-centric marketplace foundation. Booking windows for
            in-person work, Stripe Checkout for digital tiers. Admin approval,
            Provider dashboard, SEO + JSON-LD, GA4.
          </p>
          <div className="mt-8 flex gap-3">
            <a
              href="/signup"
              className="inline-flex items-center rounded-xl bg-blue-600 text-white px-5 py-2.5 hover:bg-blue-500"
            >
              Get started
            </a>
            <a
              href="/providers"
              className="inline-flex items-center rounded-xl border border-white/20 text-white px-5 py-2.5 hover:border-white/40"
            >
              Browse providers
            </a>
          </div>
        </div>
      </section>

      <section>
        <div className="container-x py-16 grid gap-6 md:grid-cols-3">
          {[
            {
              t: "Provider-first",
              d: "Users book a specific provider. Availability windows gate in-person requests.",
            },
            {
              t: "Digital tiers",
              d: "Stripe Checkout for fixed-scope offerings and add-ons.",
            },
            {
              t: "Ship to Supabase",
              d: "Start with /data/*.json; migrate reads/writes with minimal surface change.",
            },
          ].map((card) => (
            <div
              key={card.t}
              className="rounded-2xl border border-muted-400/30 p-6 bg-white"
            >
              <h3 className="font-semibold text-ink-900">{card.t}</h3>
              <p className="mt-2 text-ink-700">{card.d}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

