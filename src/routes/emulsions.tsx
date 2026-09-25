import { createFileRoute } from "@tanstack/react-router";
import { ComingBench } from "@/components/hub/coming-bench";

export const Route = createFileRoute("/emulsions")({
  head: () => ({
    meta: [
      { title: "Emulsions bench — Saponis" },
      {
        name: "description",
        content:
          "Emulsion and cream calculator — coming soon: emulsifier blending, skin-safe preservative amounts, and water-phase math.",
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
      statusLabel="Coming soon"
      summary="The right emulsifier blend, skin-safe preservative amounts, and water adjusted for what evaporates off. The recipe math is mapped out; the calculator is what's next."
      specs={[
        "Emulsifier blends matched to your oil phase",
        "Preservative amounts that stay skin-safe",
        "Water amounts adjusted for evaporation",
      ]}
    />
  );
}
