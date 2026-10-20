import { createFileRoute } from "@tanstack/react-router";
import { SurfactantCalculator } from "@/components/calculator/surfactant-calculator";
import { JsonLd } from "@/components/oils/json-ld";
import { SITE_ORIGIN, ogMeta } from "@/lib/site";
import { benchJsonLd } from "@/lib/site-jsonld";

export const Route = createFileRoute("/surfactants")({
  head: () => ({
    meta: [
      { title: "Cleansers bench — Saponis" },
      {
        name: "description",
        content:
          "Surfactant cleanser calculator: total active matter, charge compatibility, a gentleness score for skin, and pH guidance.",
      },
      { name: "robots", content: "index,follow" },
      ...ogMeta({
        title: "Cleansers bench — Saponis",
        description:
          "Surfactant cleanser calculator: total active matter, charge compatibility, a gentleness score for skin, and pH guidance.",
        path: "/surfactants",
      }),
    ],
    links: [{ rel: "canonical", href: `${SITE_ORIGIN}/surfactants` }],
  }),
  component: SurfactantsBench,
});

function SurfactantsBench() {
  return (
    <main>
      <JsonLd
        data={benchJsonLd({
          name: "Saponis Cleanser Calculator",
          description:
            "Surfactant cleanser calculator: total active matter, charge compatibility, a gentleness score for skin, and pH guidance.",
          path: "/surfactants",
        })}
      />
      <SurfactantCalculator />
    </main>
  );
}
