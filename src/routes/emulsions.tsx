import { createFileRoute } from "@tanstack/react-router";
import { EmulsionCalculator } from "@/components/calculator/emulsion-calculator";
import { JsonLd } from "@/components/oils/json-ld";
import { ogMeta } from "@/lib/site";
import { benchJsonLd } from "@/lib/site-jsonld";

export const Route = createFileRoute("/emulsions")({
  head: () => ({
    meta: [
      { title: "Emulsions bench — Saponis" },
      {
        name: "description",
        content:
          "Cream and lotion calculator: emulsifier blends matched to your oil phase by HLB, skin-safe preservative amounts, and water adjusted for evaporation.",
      },
      { name: "robots", content: "index,follow" },
      ...ogMeta({
        title: "Emulsions bench — Saponis",
        description:
          "Cream and lotion calculator: emulsifier blends matched to your oil phase by HLB, skin-safe preservative amounts, and water adjusted for evaporation.",
        path: "/emulsions",
      }),
    ],
    links: [{ rel: "canonical", href: "/emulsions" }],
  }),
  component: EmulsionsBench,
});

function EmulsionsBench() {
  return (
    <main>
      <JsonLd
        data={benchJsonLd({
          name: "Saponis Emulsion Calculator",
          description:
            "Cream and lotion calculator: emulsifier blends matched to your oil phase by HLB, skin-safe preservative amounts, and water adjusted for evaporation.",
          path: "/emulsions",
        })}
      />
      <EmulsionCalculator />
    </main>
  );
}
