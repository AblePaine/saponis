import { createFileRoute } from "@tanstack/react-router";
import { CostingCalculator } from "@/components/calculator/costing-calculator";
import { JsonLd } from "@/components/oils/json-ld";
import { SITE_ORIGIN, ogMeta } from "@/lib/site";
import { benchJsonLd } from "@/lib/site-jsonld";

const TITLE = "Costing suite — Saponis";
const DESCRIPTION =
  "Size it, cost it, price it: standalone mold-fill sizing on the mold engine's own math, true cost per bar with labor, packaging, and overhead divided by good bars only, and a wholesale ladder that prints discount off retail and margin side by side.";

export const Route = createFileRoute("/costing")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { name: "robots", content: "index,follow" },
      ...ogMeta({ title: TITLE, description: DESCRIPTION, path: "/costing" }),
    ],
    links: [{ rel: "canonical", href: `${SITE_ORIGIN}/costing` }],
  }),
  component: CostingBench,
});

function CostingBench() {
  return (
    <main>
      <JsonLd
        data={benchJsonLd({
          name: "Saponis Costing Suite",
          description: DESCRIPTION,
          path: "/costing",
        })}
      />
      <CostingCalculator />
    </main>
  );
}
