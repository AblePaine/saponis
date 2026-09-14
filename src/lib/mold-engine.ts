export const BATTER_DENSITY_G_CM3 = 1.05;
export const OIL_FRACTION_OF_BATTER = 0.69;
export const HEADSPACE_FRACTION = 0.1;
export const CM_PER_INCH = 2.54;

export type MoldShape = "loaf" | "slab" | "cylinder" | "water_fill";
export type LengthUnit = "in" | "cm";
export type FillMode = "brim" | "headspace";

export interface MoldInput {
  shape: MoldShape;
  unit: LengthUnit;
  length: number;
  width: number;
  height: number;
  diameter: number;
  waterGrams: number;
}

export interface MoldResult {
  volumeCm3: number;
  batterGrams: number;
  oilWeightGrams: number;
  fill: FillMode;
}

function toCm(value: number, unit: LengthUnit): number {
  if (!Number.isFinite(value) || value < 0) return 0;
  return unit === "in" ? value * CM_PER_INCH : value;
}

export function moldVolumeCm3(input: MoldInput): number {
  switch (input.shape) {
    case "loaf":
    case "slab": {
      const l = toCm(input.length, input.unit);
      const w = toCm(input.width, input.unit);
      const h = toCm(input.height, input.unit);
      return l * w * h;
    }
    case "cylinder": {
      const d = toCm(input.diameter, input.unit);
      const h = toCm(input.height, input.unit);
      const r = d / 2;
      return Math.PI * r * r * h;
    }
    case "water_fill": {
      const grams = Number.isFinite(input.waterGrams) ? Math.max(0, input.waterGrams) : 0;
      return grams;
    }
  }
}

export function oilWeightFromVolume(
  volumeCm3: number,
  fill: FillMode = "brim",
): MoldResult {
  const usable = fill === "headspace" ? volumeCm3 * (1 - HEADSPACE_FRACTION) : volumeCm3;
  const batterGrams = usable * BATTER_DENSITY_G_CM3;
  const oilWeightGrams = batterGrams * OIL_FRACTION_OF_BATTER;
  return {
    volumeCm3,
    batterGrams,
    oilWeightGrams,
    fill,
  };
}

export function computeMold(input: MoldInput, fill: FillMode = "brim"): MoldResult {
  return oilWeightFromVolume(moldVolumeCm3(input), fill);
}

export const EMPTY_MOLD: MoldInput = {
  shape: "loaf",
  unit: "in",
  length: 10,
  width: 3.5,
  height: 3.5,
  diameter: 3,
  waterGrams: 0,
};
