import { createFileRoute } from "@tanstack/react-router";
import { BatchCalculator } from "@/components/calculator/BatchCalculator";
import { soapSearchSchema } from "@/lib/soap-search";

export const Route = createFileRoute("/soap")({
  validateSearch: soapSearchSchema,
  head: () => ({
    meta: [
      { title: "Soap bench — Saponis" },
      {
        name: "description",
        content:
          "Cold-process soap formulation bench: stoichiometric lye, liquid, fatty acids, and quality scores — entirely in the browser.",
      },
      { name: "robots", content: "index,follow" },
    ],
    links: [{ rel: "canonical", href: "/soap" }],
  }),
  component: SoapBench,
});

function SoapBench() {
  return (
    <main>
      <BatchCalculator />
    </main>
  );
}
