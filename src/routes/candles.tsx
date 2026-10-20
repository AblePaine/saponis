import { createFileRoute } from "@tanstack/react-router";
import { CandleCalculator } from "@/components/calculator/candle-calculator";
import { JsonLd } from "@/components/oils/json-ld";
import { SITE_ORIGIN, ogMeta } from "@/lib/site";
import { benchJsonLd } from "@/lib/site-jsonld";

export const Route = createFileRoute("/candles")({
  head: () => ({
    meta: [
      { title: "Candle bench — Saponis" },
      {
        name: "description",
        content:
          "Candle calculator that names the fragrance convention — percent of wax vs percent of finished weight, both printed — and sizes vessel fill from weighed water times wax specific gravity.",
      },
      { name: "robots", content: "index,follow" },
      ...ogMeta({
        title: "Candle bench — Saponis",
        description:
          "Candle calculator that names the fragrance convention — percent of wax vs percent of finished weight, both printed — and sizes vessel fill from weighed water times wax specific gravity.",
        path: "/candles",
      }),
    ],
    links: [{ rel: "canonical", href: `${SITE_ORIGIN}/candles` }],
  }),
  component: CandlesBench,
});

function CandlesBench() {
  return (
    <main>
      <JsonLd
        data={benchJsonLd({
          name: "Saponis Candle Calculator",
          description:
            "Candle calculator that names the fragrance convention — percent of wax vs percent of finished weight, both printed — and sizes vessel fill from weighed water times wax specific gravity.",
          path: "/candles",
        })}
      />
      <CandleCalculator />
    </main>
  );
}
