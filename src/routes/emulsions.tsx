import { createFileRoute } from "@tanstack/react-router";
import { EmulsionCalculator } from "@/components/calculator/emulsion-calculator";

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
    ],
    links: [{ rel: "canonical", href: "/emulsions" }],
  }),
  component: EmulsionsBench,
});

function EmulsionsBench() {
  return (
    <main>
      <EmulsionCalculator />
    </main>
  );
}
