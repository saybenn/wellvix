import { useState } from "react";

/**
 * SearchBar
 * - Emits onSubmit(query)
 * - In v0 it's local-only; swap to Supabase or server search later.
 */
export default function SearchBar({
  placeholder = "Find a provider or service…",
  onSubmit = () => {},
  defaultValue = "",
}) {
  const [q, setQ] = useState(defaultValue);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(q);
      }}
      className="w-full"
      role="search"
      aria-label="Global Search"
    >
      <div className="flex items-center gap-2 rounded-2xl bg-white border border-muted-400/40 shadow-[0_6px_24px_rgba(0,0,0,.08)] px-3 py-2">
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          className="text-ink-700"
          aria-hidden="true"
        >
          <path
            fill="currentColor"
            d="M15.5 14h-.79l-.28-.27a6.5 6.5 0 1 0-.71.71l.27.28v.79l5 5 1.49-1.49-5-5Zm-6 0A4.5 4.5 0 1 1 14 9.5 4.5 4.5 0 0 1 9.5 14Z"
          />
        </svg>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={placeholder}
          className="w-full bg-transparent outline-none text-ink-900 placeholder:text-ink-700/60"
          aria-label={placeholder}
        />
        <button
          type="submit"
          className="inline-flex items-center rounded-xl bg-blue-600 text-white px-4 py-2 text-sm hover:bg-blue-500 transition"
          data-cta="search"
        >
          Search
        </button>
      </div>
    </form>
  );
}
