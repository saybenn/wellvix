// /pages/providers/index.js
import { useMemo, useState } from "react";
import providers from "@/data/providers.json";
import services from "@/data/provider_services.json";
import copy from "@/data/ui/catalog.json";
import Link from "next/link";

export default function ProvidersRegistry() {
  const [q, setQ] = useState("");

  const rows = useMemo(() => {
    const term = q.trim().toLowerCase();
    const svcCount = services.reduce((acc, s) => {
      acc[s.provider_id] = (acc[s.provider_id] || 0) + (s.isActive ? 1 : 0);
      return acc;
    }, {});
    return providers
      .filter((p) => p.isApproved)
      .filter((p) => {
        if (!term) return true;
        const hay = [p.displayName, p.tagline, ...(p.tags || [])]
          .join(" ")
          .toLowerCase();
        const svcHay = services
          .filter((s) => s.provider_id === p.id && s.isActive)
          .map((s) => `${s.title} ${s.type}`)
          .join(" ")
          .toLowerCase();
        return hay.includes(term) || svcHay.includes(term);
      })
      .map((p) => ({ ...p, serviceCount: svcCount[p.id] || 0 }));
  }, [q]);

  return (
    <main className="min-h-screen bg-950 text-white px-6 py-10">
      <div className="mx-auto max-w-11/12 space-y-4">
        <h1 className="text-2xl font-semibold">{copy.registry.title}</h1>

        <div className="rounded-xl bg-card-800/50 p-3">
          <input
            className="w-full rounded-lg bg-white px-3 py-2 text-ink-900"
            placeholder={copy.registry.search_placeholder}
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>

        {rows.length === 0 ? (
          <div className="rounded-xl bg-card-800 p-4 text-ink-700">
            {copy.registry.results_none}
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {rows.map((p) => (
              <Link
                href={`/providers/${p.slug}`}
                key={p.id}
                className="rounded-xl bg-card-800 p-4 ring-1 ring-ink-700/10 hover:ring-blue-500/40 transition"
              >
                <div className="text-lg font-semibold text-white">
                  {p.displayName}
                </div>
                <div className="text-sm text-ink-700">{p.tagline}</div>
                <div className="mt-2 text-xs text-ink-700">
                  {p.city}, {p.state} • {p.serviceCount} services
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
