import { createFileRoute } from "@tanstack/react-router";
import { ComingBench } from "@/components/hub/coming-bench";

export const Route = createFileRoute("/surfactants")({
  head: () => ({
    meta: [
      { title: "Surfactants bench — Saponis" },
      {
        name: "description",
        content:
          "Surfactant cleanser calculator — coming soon: cleansing strength, surfactant compatibility, and a gentleness score for skin.",
      },
    ],
  }),
  component: SurfactantsBench,
});

function SurfactantsBench() {
  return (
    <ComingBench
      kicker="04 · Cleansers"
      title="Surfactant cleansers"
      status="next"
      statusLabel="Coming soon"
      summary="Cleansing strength, surfactants that play nice together, and a gentleness score for skin. The soap bench is live while this one gets finished."
      specs={[
        "Cleansing strength dialed to your recipe",
        "Surfactants that play nice together",
        "A gentleness score for skin",
      ]}
    />
  );
}
