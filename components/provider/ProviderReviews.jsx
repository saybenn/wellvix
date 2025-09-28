/**
 * ProviderReviews
 * - Renders a simple list of reviews; parent supplies array.
 */
export default function ProviderReviews({ reviews = [] }) {
  if (!reviews.length) return null;

  return (
    <ul className="space-y-4">
      {reviews.map((r, i) => (
        <li
          key={i}
          className="rounded-2xl border border-muted-400/30 bg-white p-4"
        >
          <div className="flex items-center gap-2 text-sm">
            <span className="font-medium text-ink-900">{r.author}</span>
            {typeof r.rating === "number" ? (
              <span className="text-ink-700">• {r.rating.toFixed(1)}/5</span>
            ) : null}
          </div>
          <p className="mt-1 text-ink-700">{r.comment}</p>
        </li>
      ))}
    </ul>
  );
}
