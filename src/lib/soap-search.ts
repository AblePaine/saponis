import { z } from "zod";

export const soapSearchSchema = z.object({
  r: z.string().optional(),
  add: z.string().optional(),
  oil: z.string().optional(),
  wt: z.coerce.number().positive().optional(),
  recipe: z.string().optional(),
});

export type SoapSearch = z.infer<typeof soapSearchSchema>;

export type SoapBenchSearch = {
  r?: string;
  add?: string;
  oil?: string;
  wt?: number;
};

export function soapSearchFromLegacy(search: SoapSearch): SoapBenchSearch {
  const r = search.r ?? search.recipe;
  const next: SoapBenchSearch = {};
  if (r) next.r = r;
  if (search.add) next.add = search.add;
  if (search.oil) next.oil = search.oil;
  if (search.wt) next.wt = search.wt;
  return next;
}

export function hasLegacySoapSearch(search: SoapSearch): boolean {
  return Boolean(
    search.r || search.recipe || search.add || search.oil || search.wt,
  );
}
