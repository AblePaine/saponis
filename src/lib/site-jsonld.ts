import { SITE_ORIGIN } from "./site";
import type { Guide } from "@/data/guides";

type JsonLdData = Record<string, unknown>;

const PUBLISHER: JsonLdData = {
  "@type": "Organization",
  name: "Saponis",
  url: `${SITE_ORIGIN}/`,
};

/** Home page: the site itself. */
export function websiteJsonLd(): JsonLdData {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Saponis",
    url: `${SITE_ORIGIN}/`,
    description:
      "Soap and cosmetic calculators that do the math: exact lye for your oils, superfat you can trust, and INCI & FDA labels ready to print.",
    publisher: PUBLISHER,
  };
}

interface BenchJsonLdInput {
  name: string;
  description: string;
  /** Path beginning with "/", e.g. "/soap". */
  path: string;
}

/** Calculator benches: free in-browser web applications. */
export function benchJsonLd({ name, description, path }: BenchJsonLdInput): JsonLdData {
  return {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name,
    url: `${SITE_ORIGIN}${path}`,
    description,
    applicationCategory: "UtilitiesApplication",
    operatingSystem: "Any",
    browserRequirements: "Requires JavaScript",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    publisher: PUBLISHER,
  };
}

/** Guide pages: articles. */
export function guideArticleJsonLd(guide: Guide): JsonLdData {
  const url = `${SITE_ORIGIN}/guides/${guide.slug}`;
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: guide.title,
    description: guide.description,
    datePublished: guide.published,
    url,
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    author: PUBLISHER,
    publisher: PUBLISHER,
  };
}
