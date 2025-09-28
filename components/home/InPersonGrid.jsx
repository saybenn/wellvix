/**
 * InPersonGrid
 * - Simple grid of in-person services to drive booking discovery.
 */
export default function InPersonGrid({
  heading = "In-person highlights",
  items = [],
  onView = () => {},
}) {
  return (
    <section className="bg-white">
      <div className="container-x py-12">
        <h2 className="text-2xl md:text-3xl font-semibold text-ink-900">
          {heading}
        </h2>
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((it) => (
            <article
              key={it.id}
              className="rounded-2xl border border-muted-400/30 bg-white p-5"
            >
              <div className="flex items-center gap-2 text-xs">
                <span className="inline-flex items-center rounded-full border border-muted-400/40 px-2 py-0.5 text-ink-700">
                  In-person
                </span>
              </div>
              <h3 className="mt-2 font-semibold text-ink-900">{it.title}</h3>
              {it.subtitle ? (
                <p className="text-sm text-ink-700 mt-1">{it.subtitle}</p>
              ) : null}
              {typeof it.duration_minutes === "number" ? (
                <p className="mt-3 text-sm text-ink-700">
                  {it.duration_minutes} min
                </p>
              ) : null}
              <div className="mt-4">
                <button
                  className="inline-flex items-center rounded-xl border border-muted-400/40 text-ink-900 px-4 py-2 text-sm hover:border-blue-600 transition"
                  onClick={() => onView(it)}
                  data-cta="inperson_item"
                >
                  View
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
