// /pages/providers/[slug]/index.js
import { useRouter } from "next/router";
import providers from "@/data/providers.json";
import services from "@/data/provider_services.json";
import copy from "@/data/ui/catalog.json";
import Link from "next/link";

export default function ProviderProfile() {
  const { query } = useRouter();
  const provider = providers.find((p) => p.slug === query.slug);

  if (!provider) {
    return (
      <main className="min-h-screen bg-950 text-white px-6 py-10">
        <div className="mx-auto max-w-4xl">Loading…</div>
      </main>
    );
  }

  const active = services.filter(
    (s) => s.provider_id === provider.id && s.isActive
  );

  return (
    <main className="min-h-screen bg-950 text-white px-6 py-10">
      <div className="mx-auto max-w-4xl space-y-6">
        <header>
          <h1 className="text-2xl font-semibold">{provider.displayName}</h1>
          <p className="text-ink-700">{provider.tagline}</p>
          <p className="text-sm text-ink-700">
            {copy.profile.location}: {provider.city}, {provider.state}
          </p>
        </header>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">{copy.profile.services}</h2>
          <div className="grid gap-3 md:grid-cols-2">
            {active.map((s) => (
              <div
                key={s.id}
                className="rounded-xl bg-card-800 p-4 ring-1 ring-ink-700/10"
              >
                <div className="text-white font-medium">{s.title}</div>
                <div className="text-xs text-ink-700">
                  {copy.service.type_labels[s.type]}
                </div>
                <div className="mt-1 text-sm">
                  {copy.service.from} ${(s.priceFrom / 100).toFixed(2)}
                </div>
                <Link
                  href={`/services/${provider.slug}/${s.slug}`}
                  className="mt-3 inline-flex rounded-lg bg-blue-600 px-3 py-2 text-white text-sm"
                >
                  {copy.profile.view_service}
                </Link>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
