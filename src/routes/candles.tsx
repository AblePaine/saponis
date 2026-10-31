import { createFileRoute } from "@tanstack/react-router";
import { CandleCalculator } from "@/components/calculator/candle-calculator";
import { CandleStudioTools } from "@/components/calculator/candle-studio-tools";
import { JsonLd } from "@/components/oils/json-ld";
import { SITE_ORIGIN, ogMeta } from "@/lib/site";
import { benchJsonLd } from "@/lib/site-jsonld";

export const Route = createFileRoute("/candles")({
  head: () => ({
    meta: [
      { title: "Candle Studio — Saponis" },
      {
        name: "description",
        content:
          "Candle calculator that names the fragrance convention — percent of wax vs percent of finished weight, both printed — and sizes vessel fill from weighed water times wax specific gravity. Plus the rest of the studio: one oil across candle, melt, diffuser and soap with per-format caps, a wax-blend melt and pour window, and a wick starting point with its burn-test card.",
      },
      { name: "robots", content: "index,follow" },
      ...ogMeta({
        title: "Candle Studio — Saponis",
        description:
          "Candle calculator that names the fragrance convention — percent of wax vs percent of finished weight, both printed — and sizes vessel fill from weighed water times wax specific gravity. Plus a multi-format fragrance card, a wax-blend window, and a wick starting point with its burn-test card.",
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
          name: "Saponis Candle Studio",
          description:
            "Candle bench suite: batch calculator (fragrance convention named — percent of wax vs percent of finished weight, both printed; vessel fill from weighed water times wax specific gravity), multi-format fragrance card with per-format caps, wax-blend melt/pour window, and wick starting point with burn-test card.",
          path: "/candles",
        })}
      />
      <CandleCalculator />
      <CandleStudioTools />
    </main>
  );
}
