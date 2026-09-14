import type { QualityScoreKey } from "@/types/soap";

export interface QualityRange {
  label: string;
  hint: string;
  min: number;
  max: number;
  ceiling: number;
}

export const QUALITY_RANGES: Record<
  Exclude<QualityScoreKey, "iodine" | "ins">,
  QualityRange
> = {
  hardness: {
    label: "Hardness",
    hint: "Lauric + myristic + palmitic + stearic",
    min: 29,
    max: 54,
    ceiling: 80,
  },
  cleansing: {
    label: "Cleansing",
    hint: "Lauric + myristic",
    min: 12,
    max: 22,
    ceiling: 80,
  },
  conditioning: {
    label: "Conditioning",
    hint: "Oleic + linoleic + linolenic + ricinoleic",
    min: 44,
    max: 69,
    ceiling: 100,
  },
  bubbly: {
    label: "Bubbly lather",
    hint: "Lauric + myristic + ricinoleic",
    min: 14,
    max: 46,
    ceiling: 80,
  },
  creamy: {
    label: "Creamy lather",
    hint: "Palmitic + stearic + ricinoleic",
    min: 16,
    max: 48,
    ceiling: 80,
  },
  longevity: {
    label: "Longevity",
    hint: "Palmitic + stearic",
    min: 25,
    max: 50,
    ceiling: 80,
  },
};

export const METRIC_KEYS = [
  "hardness",
  "cleansing",
  "conditioning",
  "bubbly",
  "creamy",
  "longevity",
] as const;

export type MetricKey = (typeof METRIC_KEYS)[number];
