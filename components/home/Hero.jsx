import { useState, useMemo } from "react";
import SegmentedToggle from "./SegmentedToggle";
import SearchBar from "./SearchBar";

export default function Hero({
  title = "Any Service. Anytime. Anywhere",
  subhead, // optional
  onSearch = () => {},
  defaultMode = "digital",
  segments,
  videoSrc = "/media/wellvixhero.mp4",
  posterSrc = "/images/hero-poster.jpg",
  // use tokens you have: blue-800 & blue-600
  overlayClass = "bg-gradient-to-b from-blue-800/10 to-blue-600/60",
  minHeightClass = "min-h-[78vh]",
}) {
  const [mode, setMode] = useState(defaultMode);

  const segs = useMemo(
    () =>
      segments ?? [
        { id: "digital", label: "Digital Services" },
        { id: "in_person", label: "In-person Services" },
      ],
    [segments]
  );

  return (
    <section className={`relative text-white ${minHeightClass}`}>
      {/* BG video */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <video
          className="h-full w-full object-cover"
          src={videoSrc}
          poster={posterSrc}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
        />
        <div className={`absolute inset-0 ${overlayClass}`} />
      </div>

      {/* Center everything */}
      <div className="container-x flex items-center justify-center py-12 md:py-20">
        {/* Glass panel */}
        <div
          className={[
            "w-full max-w-5xl",
            "rounded-[28px] md:rounded-[32px]",
            "px-6 md:px-10 py-8 md:py-10",
            // glass look using your tokens
            "backdrop-blur-sm bg-ink-900/70",
            "ring-1 ring-white/25",
            "shadow-[0_20px_60px_-15px_rgba(0,0,0,0.45)]",
          ].join(" ")}
        >
          {/* Headline */}
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-semibold tracking-tight">
              {title}
            </h1>
            {subhead ? <p className="mt-3 text-white/75">{subhead}</p> : null}
          </div>

          {/* Pills + helper text */}
          <div className="mt-6 flex items-center justify-center gap-3">
            <div className="rounded-full bg-white/10 p-1 ring-1 ring-white/15">
              <SegmentedToggle
                value={mode}
                onChange={setMode}
                segments={segs}
                className="*:[&>button]:px-5 *:[&>button]:py-2 *:[&>button]:rounded-full *:[&>button]:text-sm"
              />
            </div>
            <span className="text-white/65 text-sm" aria-live="polite">
              {mode === "digital" ? "Purchase packages" : "Request a time"}
            </span>
          </div>

          {/* Search row (big, rounded) */}
          <div className="mt-6">
            <div
              className={[
                "mx-auto",
                "rounded-full bg-white/10",
                "ring-1 ring-white/20",
                "p-2 md:p-2.5",
              ].join(" ")}
            >
              <SearchBar
                onSubmit={(q) => onSearch({ q, mode })}
                placeholder="What can we help you with?"
                // Override defaults to match hero glass
                containerClassName="bg-transparent border-transparent shadow-none px-0 py-0"
                inputClassName="bg-transparent placeholder-white/70 text-white px-4 md:px-5 py-2.5 md:py-3 rounded-full focus:outline-none w-full"
                buttonClassName="rounded-full px-5 md:px-6 py-2.5 md:py-3 bg-blue-600 hover:bg-blue-500 text-white font-medium"
                iconClassName="text-white/80"
              />
            </div>
          </div>

          {/* Tagline */}
          <div className="mt-6 md:mt-7">
            <p className="text-center text-white/85 font-medium tracking-wide">
              <span>Global</span>
              <span className="mx-3 md:mx-4 opacity-60">|</span>
              <span>Unlimited</span>
              <span className="mx-3 md:mx-4 opacity-60">|</span>
              <span>Affordable</span>
              <span className="mx-3 md:mx-4 opacity-60">|</span>
              <span>Quality</span>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
