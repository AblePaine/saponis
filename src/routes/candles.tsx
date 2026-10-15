import { createFileRoute } from "@tanstack/react-router";
import { CandleCalculator } from "@/components/calculator/candle-calculator";

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
    ],
    links: [{ rel: "canonical", href: "/candles" }],
  }),
  component: CandlesBench,
});

function CandlesBench() {
  return (
    <main>
      <CandleCalculator />
    </main>
  );
}
