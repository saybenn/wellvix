import { useId } from "react";

/**
 * SegmentedToggle
 * - Generic, no service-specific strings. Labels provided via props.
 */
export default function SegmentedToggle({
  value = "digital",
  onChange = () => {},
  segments = [
    { id: "digital", label: "Digital" },
    { id: "in_person", label: "In-person" },
  ],
}) {
  const groupId = useId();

  return (
    <div className="inline-flex rounded-full bg-white border border-muted-400/40 p-1 shadow-sm">
      {segments.map((seg) => {
        const active = value === seg.id;
        return (
          <button
            key={seg.id}
            type="button"
            aria-pressed={active}
            aria-controls={`${groupId}-${seg.id}`}
            onClick={() => onChange(seg.id)}
            className={[
              "px-4 py-1.5 text-sm rounded-full transition",
              active
                ? "bg-blue-600 text-white"
                : "text-ink-700 hover:bg-blue-500/10",
            ].join(" ")}
          >
            {seg.label}
          </button>
        );
      })}
    </div>
  );
}
