import { site as siteStatic } from "../lib/siteConfig";
import { SEO, getMeta, websiteJsonLd } from "../lib/seo";
import Hero from "../components/home/Hero";
import ExplainerSplit from "../components/home/ExplainerSplit";
import FeaturedTabs from "../components/home/FeaturedTabs";
import InPersonGrid from "../components/home/InPersonGrid";
import FAQSwitch from "../components/home/FAQSwitch";

import categories from "../data/categories.json";
import services from "../data/services.json";

/**
 * Home
 * - Reads data from /data/*.json; swap to Supabase later by replacing imports with fetchers.
 * - No service-specific strings baked into components; copy comes from data or props here.
 */
export default function Home() {
  const meta = getMeta({
    title: siteStatic?.meta?.title,
    description: siteStatic?.meta?.description,
    url: siteStatic?.meta?.url,
  });

  const jsonLd = [
    websiteJsonLd({
      name: siteStatic.brand,
      url: siteStatic?.meta?.url,
    }),
  ];

  // Featured tabs derived from categories + services
  const makeTab = (cat) => ({
    id: cat.id,
    label: cat.name,
    items: services.filter((s) => s.category_id === cat.id && s.featured),
  });

  const tabs = categories.map(makeTab);

  const inPersonItems = services
    .filter((s) => s.type === "in_person")
    .slice(0, 6);

  const faqData = {
    customers: [
      {
        q: "How are payments handled for packages?",
        a: "Digital packages use a secure checkout. In-person requests do not require payment in the initial request.",
      },
      {
        q: "Can I choose a specific provider?",
        a: "Yes. You select a provider first, then choose one of their services.",
      },
    ],
    freelancers: [
      {
        q: "How do I get listed?",
        a: "Complete your profile and at least one active service, then submit for approval.",
      },
      {
        q: "Can I set my own schedule?",
        a: "Yes. Add weekly availability windows and update them anytime.",
      },
    ],
  };

  return (
    <>
      <SEO meta={meta} jsonLd={jsonLd} />

      <Hero
        title={siteStatic?.tagline}
        subhead="Provider-first flows. Pick a provider, choose a service, and proceed with either a digital brief or an in-person request."
        onSearch={({ q, mode }) => {
          // v0: simple redirect with params. Later: /search?q=&type=
          if (typeof window !== "undefined") {
            const params = new URLSearchParams();
            if (q) params.set("q", q);
            if (mode) params.set("type", mode);
            window.location.href = `/search?${params.toString()}`;
          }
        }}
      />

      <ExplainerSplit heading="Two systems, one place" />

      <FeaturedTabs
        heading="Featured"
        tabs={tabs}
        onCta={(item) => {
          // In real app, route to provider/service detail.
          // Here we just no-op or log. Replace with Next router when detail pages exist.
          if (typeof window !== "undefined") {
            console.log("Featured view", item);
          }
        }}
      />

      <InPersonGrid
        heading="In-person highlights"
        items={inPersonItems}
        onView={(it) => {
          if (typeof window !== "undefined") {
            console.log("In-person view", it);
          }
        }}
      />

      <FAQSwitch heading="Questions" tabs={faqData} />
    </>
  );
}

