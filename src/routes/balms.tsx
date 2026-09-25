import { createFileRoute } from "@tanstack/react-router";
import { ComingBench } from "@/components/hub/coming-bench";

export const Route = createFileRoute("/balms")({
  head: () => ({
    meta: [
      { title: "Balms bench — Saponis" },
      {
        name: "description",
        content:
          "Balm, salve, and wax calculator — coming soon: wax-to-oil ratios, melt points, and graininess alerts.",
      },
    ],
  }),
  component: BalmsBench,
});

function BalmsBench() {
  return (
    <ComingBench
      kicker="02 · Balms"
      title="Balms, salves & waxes"
      status="calibrating"
      statusLabel="Almost ready"
      summary="Wax, butter, and oil ratios that set right — plus when the balm melts and a heads-up before it goes grainy. The soap bench is live while this one gets finished."
      specs={[
        "Wax, butter, and oil ratios that actually set",
        "Melt-point curves for your waxes",
        "Graininess warnings before you pour",
      ]}
    />
  );
}
