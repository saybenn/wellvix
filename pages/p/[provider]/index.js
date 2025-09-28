import { useRouter } from "next/router";
import providers from "../../../data/providers.json";
import services from "../../../data/provider_services.json";
import ProfileHeader from "../../../components/provider/ProfileHeader";
import ServiceList from "../../../components/provider/ServiceList";
import ProviderAbout from "../../../components/provider/ProviderAbout";
import ProviderReviews from "../../../components/provider/ProviderReviews";
import { SEO, getMeta } from "../../../lib/seo";
import { site as siteStatic } from "../../../lib/siteConfig";

/**
 * Provider Profile page
 * - Reads provider by slug, filters active services for this provider.
 * - Tabs: About | Reviews (simple client-side toggle)
 * - NOTE (Supabase): Replace JSON imports with server-side fetch:
 *     import { createClient } from '@supabase/supabase-js'
 *     const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
 *     const { data: provider } = await supabase.from('providers').select('*').eq('slug', slug).single()
 *     const { data: svcs } = await supabase.from('provider_services').select('*').eq('provider_id', provider.id).eq('is_active', true)
 */
import { useState, useMemo } from "react";

export default function ProviderPage() {
  const router = useRouter();
  const { provider: providerSlug } = router.query;

  const provider = useMemo(
    () => providers.find((p) => p.slug === providerSlug),
    [providerSlug]
  );
  const providerServices = useMemo(() => {
    if (!provider) return [];
    return services.filter((s) => s.provider_id === provider.id && s.active);
  }, [provider]);

  const [tab, setTab] = useState("about"); // 'about' | 'reviews'

  const title = provider
    ? `${provider.display_name} — ${siteStatic.brand}`
    : siteStatic?.meta?.title;
  const description = provider?.tagline ?? siteStatic?.meta?.description;

  return (
    <>
      <SEO meta={getMeta({ title, description, url: siteStatic?.meta?.url })} />

      <ProfileHeader provider={provider} />

      {/* Tabs */}
      <section className="bg-white">
        <div className="container-x pt-6">
          <div className="flex items-center gap-2">
            <button
              className={[
                "rounded-full px-3 py-1.5 text-sm transition",
                tab === "about"
                  ? "bg-blue-600 text-white"
                  : "text-ink-700 hover:bg-blue-500/10",
              ].join(" ")}
              onClick={() => setTab("about")}
            >
              About
            </button>
            <button
              className={[
                "rounded-full px-3 py-1.5 text-sm transition",
                tab === "reviews"
                  ? "bg-blue-600 text-white"
                  : "text-ink-700 hover:bg-blue-500/10",
              ].join(" ")}
              onClick={() => setTab("reviews")}
            >
              Reviews
            </button>
          </div>

          <div className="mt-6">
            {tab === "about" ? (
              <ProviderAbout about={provider?.about} />
            ) : (
              <ProviderReviews reviews={provider?.reviews} />
            )}
          </div>
        </div>
      </section>

      {/* Services grid */}
      <ServiceList
        items={providerServices}
        providerSlug={providerSlug}
        viewLabel="View"
        typeLabels={{ digital: "Digital", in_person: "In-person" }}
      />
    </>
  );
}
