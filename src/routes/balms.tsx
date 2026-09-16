import { createFileRoute } from "@tanstack/react-router";
import { ComingBench } from "@/components/hub/coming-bench";

export const Route = createFileRoute("/balms")({
  head: () => ({
    meta: [
      { title: "Balms bench — Saponis" },
      {
        name: "description",
        content:
          "Anhydrous balm, salve, and wax formulation bench. Calibrating: ratio balance, melting-point curve, graininess alerts.",
      },
    ],
  }),
  component: BalmsBench,
});

function BalmsBench() {
  return (
    <ComingBench
      kicker="02 · Anhydrous"
      title="Balms, salves & waxes"
      status="calibrating"
      statusLabel="Bench calibrating"
      summary="Wax-to-butter-to-liquid ratios, melting-point curves, and graininess alerts. The soap bench stays live while this engine is calibrated."
      specs={[
        "Wax-to-butter-to-liquid ratio balancing",
        "Dynamic melting-point curve (Tmelt)",
        "Anti-graininess solidification alerts",
      ]}
    />
  );
}
