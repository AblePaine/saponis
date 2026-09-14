import type { MassUnit } from "@/types/soap";

const GRAMS_PER_OUNCE = 28.349523125;

export function gramsToRecipeUnit(grams: number, unit: MassUnit): number {
  return unit === "oz" ? grams / GRAMS_PER_OUNCE : grams;
}

export function recipeUnitToGrams(amount: number, unit: MassUnit): number {
  return unit === "oz" ? amount * GRAMS_PER_OUNCE : amount;
}

export function convertAmount(
  amount: number,
  from: MassUnit,
  to: MassUnit,
): number {
  if (from === to) return amount;
  return gramsToRecipeUnit(recipeUnitToGrams(amount, from), to);
}

export function formatMass(amount: number, unit: MassUnit): string {
  if (!Number.isFinite(amount)) return `— ${unit}`;
  const digits = unit === "oz" ? 3 : 2;
  return `${amount.toLocaleString("en-US", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  })} ${unit}`;
}

export function formatPercent(value: number, digits = 1): string {
  if (!Number.isFinite(value)) return "—";
  return `${value.toLocaleString("en-US", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  })}%`;
}

export function formatRatio(value: number): string {
  if (!Number.isFinite(value)) return "—";
  return `${value.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} : 1`;
}

export function formatScore(value: number): string {
  if (!Number.isFinite(value)) return "—";
  return value.toLocaleString("en-US", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });
}

export function formatSap(value: number, digits = 4): string {
  if (!Number.isFinite(value)) return "—";
  return value.toFixed(digits);
}

export function formatFactor(value: number): string {
  if (!Number.isFinite(value)) return "—";
  return value.toLocaleString("en-US", {
    minimumFractionDigits: 4,
    maximumFractionDigits: 4,
  });
}
