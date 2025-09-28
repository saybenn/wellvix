import { useState } from "react";
import Link from "next/link";

/**
 * Generic header that consumes nav + brand from props or site data.
 * No service-specific strings. Colors use Tailwind tokens.
 */
export default function Header({ brand = {}, nav = [] }) {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur border-b border-muted-400/30">
      <div className="container-x flex items-center justify-between h-16">
        <div className="flex items-center gap-3">
          <img
            src={brand?.logo?.src ?? "/logo.svg"}
            alt={brand?.logo?.alt ?? "Logo"}
            className="h-6 w-auto"
          />
          <span className="sr-only">{brand?.logo?.alt ?? "Wellvix"}</span>
        </div>

        <nav className="hidden md:flex items-center gap-6">
          {nav?.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-ink-700 hover:text-blue-600 transition"
            >
              {item.label}
            </Link>
          ))}
          <Link
            href="/signup"
            className="inline-flex items-center rounded-xl bg-blue-600 text-white px-4 py-2 text-sm hover:bg-blue-500 transition"
          >
            Get started
          </Link>
        </nav>

        <button
          className="md:hidden inline-flex h-9 w-9 items-center justify-center rounded-lg border border-muted-400/50 text-ink-900"
          aria-label="Toggle menu"
          onClick={() => setOpen((v) => !v)}
        >
          <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
            {open ? (
              <path
                d="M18 6L6 18M6 6l12 12"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            ) : (
              <path d="M3 6h18M3 12h18M3 18h18" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile sheet */}
      {open && (
        <div className="md:hidden border-t border-muted-400/30 bg-white">
          <div className="container-x py-3 space-y-2">
            {nav?.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block px-2 py-2 rounded-lg text-ink-900 hover:bg-blue-500/10 hover:text-blue-600"
                onClick={() => setOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/signup"
              className="block px-2 py-2 rounded-lg bg-blue-600 text-white text-center hover:bg-blue-500"
              onClick={() => setOpen(false)}
            >
              Get started
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
