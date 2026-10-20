import { Navigate, createFileRoute } from "@tanstack/react-router";
import { HubLanding } from "@/components/hub/hub-landing";
import { JsonLd } from "@/components/oils/json-ld";
import { SITE_ORIGIN, ogMeta } from "@/lib/site";
import { websiteJsonLd } from "@/lib/site-jsonld";
import {
  hasLegacySoapSearch,
  soapSearchFromLegacy,
  soapSearchSchema,
} from "@/lib/soap-search";

export const Route = createFileRoute("/")({
  validateSearch: soapSearchSchema,
  head: () => ({
    meta: [
      { title: "Saponis — soap & cosmetic calculators" },
      {
        name: "description",
        content:
          "Soap and cosmetic calculators that do the math: exact lye for your oils, superfat you can trust, and INCI & FDA labels ready to print. Zero guesswork.",
      },
      { name: "robots", content: "index,follow" },
      ...ogMeta({
        title: "Saponis — soap & cosmetic calculators",
        description:
          "Soap and cosmetic calculators that do the math: exact lye for your oils, superfat you can trust, and INCI & FDA labels ready to print. Zero guesswork.",
        path: "/",
      }),
    ],
    links: [{ rel: "canonical", href: `${SITE_ORIGIN}/` }],
  }),
  component: Home,
});

function Home() {
  const search = Route.useSearch();
  if (hasLegacySoapSearch(search)) {
    return <Navigate to="/soap" search={soapSearchFromLegacy(search)} replace />;
  }
  return (
    <>
      <JsonLd data={websiteJsonLd()} />
      <HubLanding />
    </>
  );
}
