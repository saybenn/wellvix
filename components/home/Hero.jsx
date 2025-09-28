import { useState, useMemo } from "react";
import SegmentedToggle from "./SegmentedToggle";
import SearchBar from "./SearchBar";

/**
 * Hero
 * - Controls the "mode" (digital | in_person) and bubbles search up.
 * - Copy is passed in via props to keep components service-agnostic.
 */
export default function Hero({
  title,
  subhead,
  onSearch = () => {},
  defaultMode = "digital",
  segments,
}) {
  const [mode, setMode] = useState(defaultMode);

  const segs = useMemo(
    () =>
      segments ?? [
        { id: "digital", label: "Digital" },
        { id: "in_person", label: "In-person" },
      ],
    [segments]
  );

  return (
    <section className="relative bg-bg-950 text-white">
      <div className="container-x py-16 md:py-24">
        <div className="flex flex-col gap-6 w-max">
          {title ? (
            <h1 className="text-4xl md:text-5xl font-semibold leading-tight">
              {title}
            </h1>
          ) : null}
          {subhead ? (
            <p className="text-white/75 leading-relaxed">{subhead}</p>
          ) : null}

          <div className="flex items-center gap-3">
            <SegmentedToggle value={mode} onChange={setMode} segments={segs} />
            <span className="text-white/60 text-sm" aria-live="polite">
              {mode === "digital" ? "Purchase packages" : "Request a time"}
            </span>
          </div>

          <SearchBar
            onSubmit={(q) => onSearch({ q, mode })}
            placeholder="Find a provider or service…"
          />
        </div>
      </div>
    </section>
  );
}
