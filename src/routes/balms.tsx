import { createFileRoute } from "@tanstack/react-router";
import { BalmCalculator } from "@/components/calculator/balm-calculator";
import { JsonLd } from "@/components/oils/json-ld";
import { SITE_ORIGIN, ogMeta } from "@/lib/site";
import { benchJsonLd } from "@/lib/site-jsonld";

export const Route = createFileRoute("/balms")({
  head: () => ({
    meta: [
      { title: "Balms bench — Saponis" },
      {
        name: "description",
        content:
          "Balm and salve calculator: wax-to-oil ratios that set, estimated melt point, and graininess warnings before you pour.",
      },
      { name: "robots", content: "index,follow" },
      ...ogMeta({
        title: "Balms bench — Saponis",
        description:
          "Balm and salve calculator: wax-to-oil ratios that set, estimated melt point, and graininess warnings before you pour.",
        path: "/balms",
      }),
    ],
    links: [{ rel: "canonical", href: `${SITE_ORIGIN}/balms` }],
  }),
  component: BalmsBench,
});

function BalmsBench() {
  return (
    <main>
      <JsonLd
        data={benchJsonLd({
          name: "Saponis Balm & Salve Calculator",
          description:
            "Balm and salve calculator: wax-to-oil ratios that set, estimated melt point, and graininess warnings before you pour.",
          path: "/balms",
        })}
      />
      <BalmCalculator />
    </main>
  );
}
