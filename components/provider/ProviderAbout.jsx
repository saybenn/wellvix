/**
 * ProviderAbout
 * - Shows paragraphs from provider.about array.
 */
export default function ProviderAbout({ about = [] }) {
  if (!about.length) return null;

  return (
    <div className="space-y-3">
      {about.map((p, i) => (
        <p key={i} className="text-ink-700 leading-relaxed">
          {p}
        </p>
      ))}
    </div>
  );
}
