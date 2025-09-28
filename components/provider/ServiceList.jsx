import Link from "next/link";

/**
 * ServiceList
 * - Generic grid for services; parent passes items + label texts.
 * - typeLabels: { digital: string, in_person: string }
 */
export default function ServiceList({
  items = [],
  providerSlug,
  viewLabel = "View",
  typeLabels = { digital: "Digital", in_person: "In-person" },
}) {
  if (!items.length) return null;

  return (
    <section className="bg-white">
      <div className="container-x py-8">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((svc) => (
            <article
              key={svc.id}
              className="rounded-2xl border border-muted-400/30 bg-white overflow-hidden"
            >
              {svc.image_url ? (
                <img
                  src={svc.image_url}
                  alt=""
                  className="h-40 w-full object-cover"
                />
              ) : null}
              <div className="p-5">
                <div className="flex items-center gap-2 text-xs">
                  <span className="inline-flex items-center rounded-full border border-muted-400/40 px-2 py-0.5 text-ink-700">
                    {typeLabels[svc.type] ?? svc.type}
                  </span>
                  {typeof svc.duration_minutes === "number" ? (
                    <span className="text-ink-700">
                      {svc.duration_minutes} min
                    </span>
                  ) : null}
                </div>
                <h3 className="mt-2 font-semibold text-ink-900">{svc.title}</h3>
                {typeof svc.price_from === "number" ? (
                  <p className="mt-1 text-sm text-ink-700">
                    From ${(svc.price_from / 100).toFixed(0)}
                  </p>
                ) : null}

                <div className="mt-4">
                  <Link
                    href={`/p/${providerSlug}/s/${svc.slug}`}
                    className="inline-flex items-center rounded-xl bg-blue-600 text-white px-4 py-2 text-sm hover:bg-blue-500 transition"
                    data-cta="service_view"
                    data-type={svc.type}
                  >
                    {viewLabel}
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
