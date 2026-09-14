import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { BatchCalculator } from "@/components/calculator/BatchCalculator";

const searchSchema = z.object({
  r: z.string().optional(),
  add: z.string().optional(),
  oil: z.string().optional(),
  wt: z.coerce.number().positive().optional(),
});

export const Route = createFileRoute("/")({
  validateSearch: searchSchema,
  component: Home,
});

function Home() {
  return (
    <main>
      <BatchCalculator />
    </main>
  );
}
