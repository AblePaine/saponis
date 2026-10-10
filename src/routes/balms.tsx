import { createFileRoute } from "@tanstack/react-router";
import { BalmCalculator } from "@/components/calculator/balm-calculator";

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
    ],
    links: [{ rel: "canonical", href: "/balms" }],
  }),
  component: BalmsBench,
});

function BalmsBench() {
  return (
    <main>
      <BalmCalculator />
    </main>
  );
}
