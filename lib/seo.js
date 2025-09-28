import Head from "next/head";

/** Build simple meta from args or site.meta */
export function getMeta({ title, description, url, image }) {
  return {
    title,
    description,
    url,
    image,
  };
}

/** JSON-LD helpers (extend as needed later) */
export function organizationJsonLd({ name, url, logo }) {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name,
    url,
    logo,
  };
}

export function websiteJsonLd({ name, url }) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name,
    url,
  };
}

/** Drop-in SEO head block */
export function SEO({ meta = {}, jsonLd = [] }) {
  const { title, description, url, image } = meta;
  const serialized = jsonLd.length ? JSON.stringify(jsonLd) : null;

  return (
    <Head>
      {title && <title>{title}</title>}
      {description && <meta name="description" content={description} />}
      {url && <link rel="canonical" href={url} />}
      {/* Open Graph */}
      {title && <meta property="og:title" content={title} />}
      {description && <meta property="og:description" content={description} />}
      {url && <meta property="og:url" content={url} />}
      {image && <meta property="og:image" content={image} />}
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      {serialized && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: serialized }}
        />
      )}
    </Head>
  );
}
