import Image from "next/image";

/**
 * ProfileHeader
 * - Pure presentational; receives provider object.
 * - No service-specific strings; labels/copy come from data or parent.
 */
export default function ProfileHeader({ provider }) {
  if (!provider) return null;

  return (
    <header className="bg-white border-b border-muted-400/30">
      <div className="container-x py-8 flex items-center gap-4">
        {provider.avatar_url ? (
          <div className="h-16 w-16 overflow-hidden rounded-full bg-card-800">
            {/* Using next/image for perf; fallback to <img> if needed */}
            <Image
              src={provider.avatar_url}
              alt=""
              width={64}
              height={64}
              className="h-full w-full object-cover"
            />
          </div>
        ) : null}

        <div className="min-w-0">
          <h1 className="text-2xl md:text-3xl font-semibold text-ink-900 truncate">
            {provider.display_name}
          </h1>
          {provider.tagline ? (
            <p className="text-ink-700">{provider.tagline}</p>
          ) : null}
          <div className="mt-1 flex items-center gap-3 text-sm text-ink-700">
            {typeof provider.rating === "number" ? (
              <span className="inline-flex items-center gap-1">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  className="text-green-500"
                  aria-hidden="true"
                >
                  <path
                    fill="currentColor"
                    d="M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"
                  />
                </svg>
                <span>{provider.rating.toFixed(1)}</span>
              </span>
            ) : null}
            {provider.reviews_count ? (
              <span>• {provider.reviews_count} reviews</span>
            ) : null}
            {provider.city || provider.state ? (
              <span>
                • {provider.city}
                {provider.city && provider.state ? ", " : ""}
                {provider.state}
              </span>
            ) : null}
          </div>
        </div>
      </div>
    </header>
  );
}
