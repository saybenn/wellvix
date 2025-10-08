import { useState } from "react";

/**
 * FeaturedTabs
 * - Provide tabs (e.g., Design, Wellness, Business)
 * - Items are passed in via props (already filtered upstream).
 */
export default function FeaturedTabs({
  heading = "Featured",
  tabs = [], // [{ id, label, items: [{id,title,subtitle,price_from,type,image_url}] }]
  onCta = () => {},
}) {
  const [active, setActive] = useState(tabs[0]?.id);
  const current = tabs.find((t) => t.id === active) ?? { items: [] };

  return (
    <section className="bg-white">
      <div className="container-x py-12">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl md:text-3xl font-semibold text-ink-900">
            {heading}
          </h2>
          <div className="flex gap-2">
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => setActive(t.id)}
                className={[
                  "rounded-full px-3 py-1.5 text-sm transition",
                  t.id === active
                    ? "bg-blue-600 text-white"
                    : "text-ink-700 hover:bg-blue-500/10",
                ].join(" ")}
                data-tab={t.id}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {current.items.map((it) => (
            <article
              key={it.id}
              className="rounded-2xl border border-muted-400/30 bg-white overflow-hidden"
            >
              {it.image_url ? (
                <img
                  src={it.image_url}
                  alt=""
                  className="h-40 w-full object-cover"
                />
              ) : null}
              <div className="p-5">
                <div className="flex items-center gap-2 text-xs">
                  <span className="inline-flex items-center rounded-full border border-muted-400/40 px-2 py-0.5 text-ink-700">
                    {it.type === "digital" ? "Digital" : "In-person"}
                  </span>
                </div>
                <h3 className="mt-2 font-semibold text-ink-900">{it.title}</h3>
                {it.subtitle ? (
                  <p className="text-sm text-ink-700 mt-1">{it.subtitle}</p>
                ) : null}
                {typeof it.price_from === "number" ? (
                  <p className="mt-3 text-sm">
                    <span className="text-ink-700">From </span>
                    <span className="font-semibold text-ink-900">
                      ${(it.price_from / 100).toFixed(0)}
                    </span>
                  </p>
                ) : null}
                <div className="mt-4">
                  <button
                    className="inline-flex items-center rounded-xl bg-blue-600 text-white px-4 py-2 text-sm hover:bg-blue-500 transition"
                    onClick={() => onCta(it)}
                    data-cta="featured_item"
                    data-type={it.type}
                  >
                    View
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
