import { createFileRoute } from "@tanstack/react-router";
import { ComingBench } from "@/components/hub/coming-bench";

export const Route = createFileRoute("/emulsions")({
  head: () => ({
    meta: [
      { title: "Emulsions bench — Saponis" },
      {
        name: "description",
        content:
          "Emulsion and cream formulation bench. Coming next: required HLB blending, preservative ceilings, water-phase shrinkage.",
      },
    ],
  }),
  component: EmulsionsBench,
});

function EmulsionsBench() {
  return (
    <ComingBench
      kicker="03 · Creams"
      title="Emulsions & creams"
      status="next"
      statusLabel="Coming next"
      summary="Required HLB blending, preservative dermal ceilings, and water-phase shrinkage. Specs are locked; the compute engine is next."
      specs={[
        "Required HLB (rHLB) mathematical blending",
        "Preservative dermal ceilings",
        "Water-phase shrinkage adjusters",
      ]}
    />
  );
}
