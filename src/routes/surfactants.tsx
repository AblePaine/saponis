import { createFileRoute } from "@tanstack/react-router";
import { SurfactantCalculator } from "@/components/calculator/surfactant-calculator";

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
    ],
    links: [{ rel: "canonical", href: "/surfactants" }],
  }),
  component: SurfactantsBench,
});

function SurfactantsBench() {
  return (
    <main>
      <SurfactantCalculator />
    </main>
  );
}
