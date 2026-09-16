import { createFileRoute } from "@tanstack/react-router";
import { ComingBench } from "@/components/hub/coming-bench";

export const Route = createFileRoute("/surfactants")({
  head: () => ({
    meta: [
      { title: "Surfactants bench — Saponis" },
      {
        name: "description",
        content:
          "Surfactant cleanser formulation bench. Coming next: ASM balancing, charge compatibility, dermal mildness index.",
      },
    ],
  }),
  component: SurfactantsBench,
});

function SurfactantsBench() {
  return (
    <ComingBench
      kicker="04 · Wash"
      title="Surfactant cleansers"
      status="next"
      statusLabel="Coming next"
      summary="Active surfactant matter, charge compatibility, and mildness. The soap bench remains the live engine until this one ships."
      specs={[
        "Active surfactant matter (ASM) balancing",
        "Charge compatibility matrix (anionic / cationic)",
        "Dermal mildness index",
      ]}
    />
  );
}
