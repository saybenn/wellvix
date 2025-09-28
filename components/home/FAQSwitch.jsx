import { useState } from "react";

function QA({ q, a }) {
  return (
    <details className="rounded-2xl border border-muted-400/30 bg-white p-4 open:shadow-sm">
      <summary className="cursor-pointer list-none text-ink-900 font-medium">
        {q}
      </summary>
      <p className="mt-2 text-ink-700">{a}</p>
    </details>
  );
}

/**
 * FAQSwitch
 * - Two tabs: customers | freelancers (providers)
 * - Items fed via props; content stays generic.
 */
export default function FAQSwitch({
  heading = "Questions",
  tabs = {
    customers: [],
    freelancers: [],
  },
}) {
  const [who, setWho] = useState("customers");
  const list = tabs[who] ?? [];

  return (
    <section className="bg-white">
      <div className="container-x py-12">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl md:text-3xl font-semibold text-ink-900">
            {heading}
          </h2>
          <div className="flex gap-2">
            <button
              className={[
                "rounded-full px-3 py-1.5 text-sm transition",
                who === "customers"
                  ? "bg-blue-600 text-white"
                  : "text-ink-700 hover:bg-blue-500/10",
              ].join(" ")}
              onClick={() => setWho("customers")}
            >
              Customers
            </button>
            <button
              className={[
                "rounded-full px-3 py-1.5 text-sm transition",
                who === "freelancers"
                  ? "bg-blue-600 text-white"
                  : "text-ink-700 hover:bg-blue-500/10",
              ].join(" ")}
              onClick={() => setWho("freelancers")}
            >
              Freelancers
            </button>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {list.map((item, i) => (
            <QA key={i} q={item.q} a={item.a} />
          ))}
        </div>
      </div>
    </section>
  );
}
