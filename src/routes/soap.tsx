import { createFileRoute } from "@tanstack/react-router";
import { BatchCalculator } from "@/components/calculator/BatchCalculator";
import { JsonLd } from "@/components/oils/json-ld";
import { soapSearchSchema } from "@/lib/soap-search";
import { ogMeta } from "@/lib/site";
import { benchJsonLd } from "@/lib/site-jsonld";

export const Route = createFileRoute("/soap")({
  validateSearch: soapSearchSchema,
  head: () => ({
    meta: [
      { title: "Soap bench — Saponis" },
      {
        name: "description",
        content:
          "Cold-process soap calculator: exact lye, water, fatty acids, and a read on how the bar will behave — all in your browser.",
      },
      { name: "robots", content: "index,follow" },
      ...ogMeta({
        title: "Soap bench — Saponis",
        description:
          "Cold-process soap calculator: exact lye, water, fatty acids, and a read on how the bar will behave — all in your browser.",
        path: "/soap",
      }),
    ],
    links: [{ rel: "canonical", href: "/soap" }],
  }),
  component: SoapBench,
});

function SoapBench() {
  return (
    <main>
      <JsonLd
        data={benchJsonLd({
          name: "Saponis Soap Calculator",
          description:
            "Cold-process soap calculator: exact lye, water, fatty acids, and a read on how the bar will behave — all in your browser.",
          path: "/soap",
        })}
      />
      <BatchCalculator />
    </main>
  );
}
