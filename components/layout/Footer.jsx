import Link from "next/link";

export default function Footer({ footer = {} }) {
  const cols = footer?.columns ?? [];
  const cta = footer?.cta;

  return (
    <footer className="bg-card-800 text-white mt-16">
      <div className="container-x py-12 grid gap-10 md:grid-cols-3">
        {cols.map((col, i) => (
          <div key={i}>
            <h4 className="text-sm font-semibold tracking-wide uppercase text-muted-400">
              {col.title}
            </h4>
            <ul className="mt-3 space-y-2">
              {col.links?.map((l) => (
                <li key={l.href}>
                  <Link
                    className="hover:text-blue-500 transition"
                    href={l.href}
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}

        <div className="md:justify-self-end">
          {cta && (
            <Link
              href={cta.href}
              className="inline-flex items-center rounded-xl bg-green-500 text-white px-4 py-2 hover:opacity-90"
            >
              {cta.label}
            </Link>
          )}
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="container-x py-6 text-xs text-white/70">
          © {new Date().getFullYear()}{" "}
          {/* no service-specific name here; read from JSON if you need it */}
          <span className="sr-only">Wellvix</span>
        </div>
      </div>
    </footer>
  );
}
