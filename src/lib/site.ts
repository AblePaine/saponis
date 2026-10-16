export const SITE_ORIGIN = "https://saponis.app";
export const OG_IMAGE = `${SITE_ORIGIN}/og.jpg`;

interface OgMetaInput {
  title: string;
  description: string;
  /** Path beginning with "/", e.g. "/soap". */
  path: string;
  type?: string;
}

/**
 * The standard per-page share-preview meta set (Open Graph + Twitter card),
 * matching the pattern first used by the guides routes: every page states its
 * own title/description instead of inheriting the homepage defaults from the
 * root route.
 */
export function ogMeta({ title, description, path, type = "website" }: OgMetaInput) {
  return [
    { property: "og:type", content: type },
    { property: "og:site_name", content: "Saponis" },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:url", content: `${SITE_ORIGIN}${path}` },
    { property: "og:image", content: OG_IMAGE },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
    { name: "twitter:image", content: OG_IMAGE },
  ];
}
