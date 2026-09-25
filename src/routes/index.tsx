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
      { title: "Saponis — soap & cosmetic calculators" },
      {
        name: "description",
        content:
          "Soap and cosmetic calculators that do the math: exact lye for your oils, superfat you can trust, and INCI & FDA labels ready to print. Zero guesswork.",
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
