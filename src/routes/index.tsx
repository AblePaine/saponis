import { Navigate, createFileRoute } from "@tanstack/react-router";
import { HubLanding } from "@/components/hub/hub-landing";
import {
  hasLegacySoapSearch,
  soapSearchFromLegacy,
  soapSearchSchema,
} from "@/lib/soap-search";

export const Route = createFileRoute("/")({
  validateSearch: soapSearchSchema,
  head: () => ({
    meta: [
      { title: "Saponis — formulation engines" },
      {
        name: "description",
        content:
          "Precision cosmetic and soap formulation engines: stoichiometric alkali, HLB, surfactant matter, and regulatory labels. Pure math, zero guesswork.",
      },
      { name: "robots", content: "index,follow" },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
  component: Home,
});

function Home() {
  const search = Route.useSearch();
  if (hasLegacySoapSearch(search)) {
    return <Navigate to="/soap" search={soapSearchFromLegacy(search)} replace />;
  }
  return <HubLanding />;
}
