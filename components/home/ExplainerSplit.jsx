/**
 * ExplainerSplit
 * - Shows a two-column explanation of the two systems.
 * - All copy is received via props.
 */
export default function ExplainerSplit({
  heading,
  blocks = [
    {
      title: "Digital services",
      desc: "Fixed-scope packages with delivery timelines. Start a brief and pay through checkout.",
    },
    {
      title: "In-person services",
      desc: "Pick availability windows and send a request. Provider accepts and confirms your time.",
    },
  ],
}) {
  return (
    <section className="bg-white">
      <div className="container-x py-12 md:py-16">
        {heading ? (
          <h2 className="text-2xl md:text-3xl font-semibold text-ink-900">
            {heading}
          </h2>
        ) : null}
        <div className="mt-6 grid gap-6 md:grid-cols-2">
          {blocks.map((b, idx) => (
            <div
              key={idx}
              className="rounded-2xl border border-muted-400/30 bg-white p-6"
            >
              <h3 className="text-lg font-semibold text-ink-900">{b.title}</h3>
              <p className="mt-2 text-ink-700">{b.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
