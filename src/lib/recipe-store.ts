import { create } from "zustand";
import type { LiquidMode, MassUnit, RecipeConfig } from "@/types/soap";
import { convertAmount } from "@/lib/format";

export const STORAGE_KEY = "saponis.recipe.v1";
export const UI_STORAGE_KEY = "saponis.ui.v1";

export type EntryMode = "weight" | "percent";

export const EVERYDAY_BAR: RecipeConfig = {
  unit: "g",
  oils: [
    { oilId: "coconut-76", amount: 250 },
    { oilId: "olive", amount: 400 },
    { oilId: "palm-rspo", amount: 250 },
    { oilId: "castor", amount: 50 },
    { oilId: "shea-unrefined", amount: 50 },
  ],
  superfatPercentage: 5,
  liquidConfig: { mode: "concentration", value: 33 },
  lyeChoice: { naohRatio: 1, naohPurity: 0.99, kohPurity: 0.9 },
  additives: { fragranceGrams: 30, sodiumLactateGrams: 0 },
};

export const CASTILE: RecipeConfig = {
  unit: "g",
  oils: [{ oilId: "olive", amount: 1000 }],
  superfatPercentage: 8,
  liquidConfig: { mode: "concentration", value: 28 },
  lyeChoice: { naohRatio: 1, naohPurity: 0.99, kohPurity: 0.9 },
  additives: { fragranceGrams: 0, sodiumLactateGrams: 0 },
};

export const HIGH_CLEANSING: RecipeConfig = {
  unit: "g",
  oils: [
    { oilId: "coconut-76", amount: 400 },
    { oilId: "palm-rspo", amount: 300 },
    { oilId: "olive", amount: 250 },
    { oilId: "castor", amount: 50 },
  ],
  superfatPercentage: 3,
  liquidConfig: { mode: "concentration", value: 36 },
  lyeChoice: { naohRatio: 1, naohPurity: 0.99, kohPurity: 0.9 },
  additives: { fragranceGrams: 30, sodiumLactateGrams: 0 },
};

export const CREAMY_SHEA: RecipeConfig = {
  unit: "g",
  oils: [
    { oilId: "olive", amount: 450 },
    { oilId: "coconut-76", amount: 200 },
    { oilId: "shea-unrefined", amount: 150 },
    { oilId: "palm-rspo", amount: 150 },
    { oilId: "castor", amount: 50 },
  ],
  superfatPercentage: 7,
  liquidConfig: { mode: "concentration", value: 33 },
  lyeChoice: { naohRatio: 1, naohPurity: 0.99, kohPurity: 0.9 },
  additives: { fragranceGrams: 30, sodiumLactateGrams: 20 },
};

export const PRESETS: { id: string; name: string; blurb: string; config: RecipeConfig }[] =
  [
    {
      id: "everyday",
      name: "Everyday bar",
      blurb: "Balanced 25/40/25/5/5 workhorse",
      config: EVERYDAY_BAR,
    },
    {
      id: "castile",
      name: "Castile",
      blurb: "100% olive, slow and conditioning",
      config: CASTILE,
    },
    {
      id: "cleansing",
      name: "High cleansing",
      blurb: "Coconut-forward — watch the superfat",
      config: HIGH_CLEANSING,
    },
    {
      id: "shea",
      name: "Creamy shea",
      blurb: "Stearic cream with a 7% cushion",
      config: CREAMY_SHEA,
    },
  ];

export function cloneConfig(config: RecipeConfig): RecipeConfig {
  return {
    ...config,
    oils: config.oils.map((oil) => ({ ...oil })),
    liquidConfig: { ...config.liquidConfig },
    lyeChoice: { ...config.lyeChoice },
    additives: { ...config.additives },
  };
}

export function oilTotal(config: RecipeConfig): number {
  return config.oils.reduce((sum, row) => sum + row.amount, 0);
}

export function parseStoredRecipe(raw: string | null): RecipeConfig | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as RecipeConfig;
    if (!parsed || !Array.isArray(parsed.oils) || !parsed.liquidConfig) {
      return null;
    }
    return cloneConfig({
      ...EVERYDAY_BAR,
      ...parsed,
      oils: parsed.oils,
      liquidConfig: { ...EVERYDAY_BAR.liquidConfig, ...parsed.liquidConfig },
      lyeChoice: { ...EVERYDAY_BAR.lyeChoice, ...parsed.lyeChoice },
      additives: { ...EVERYDAY_BAR.additives, ...parsed.additives },
    });
  } catch {
    return null;
  }
}

interface RecipeState {
  config: RecipeConfig;
  entryMode: EntryMode;
  batchTotal: number;
  setConfig: (config: RecipeConfig) => void;
  setUnit: (unit: MassUnit) => void;
  setEntryMode: (mode: EntryMode) => void;
  setBatchTotal: (total: number) => void;
  setOilAmount: (oilId: string, amount: number) => void;
  setOilPercent: (oilId: string, percent: number) => void;
  normalizePercents: () => void;
  addOil: (oilId: string, amount?: number) => void;
  removeOil: (oilId: string) => void;
  scaleOilsTo: (total: number) => void;
  setSuperfat: (value: number) => void;
  setLiquidMode: (mode: LiquidMode) => void;
  setLiquidValue: (value: number) => void;
  setNaohRatio: (value: number) => void;
  setLyeType: (type: "naoh" | "koh" | "blend") => void;
  setNaohPurity: (value: number) => void;
  setKohPurity: (value: number) => void;
  setFragrance: (value: number) => void;
  setSodiumLactate: (value: number) => void;
  loadPreset: (config: RecipeConfig) => void;
  loadSingleOil: (oilId: string, amount: number) => void;
  reset: () => void;
}

export const useRecipeStore = create<RecipeState>((set, get) => ({
  config: cloneConfig(EVERYDAY_BAR),
  entryMode: "percent",
  batchTotal: oilTotal(EVERYDAY_BAR),

  setConfig: (config) =>
    set({
      config: cloneConfig(config),
      batchTotal: oilTotal(config) || get().batchTotal,
    }),

  setUnit: (unit) => {
    const current = get().config;
    if (current.unit === unit) return;
    const converted = {
      ...current,
      unit,
      oils: current.oils.map((row) => ({
        ...row,
        amount: convertAmount(row.amount, current.unit, unit),
      })),
      additives: {
        fragranceGrams: convertAmount(
          current.additives?.fragranceGrams ?? 0,
          current.unit,
          unit,
        ),
        sodiumLactateGrams: convertAmount(
          current.additives?.sodiumLactateGrams ?? 0,
          current.unit,
          unit,
        ),
      },
    };
    set({
      config: converted,
      batchTotal: convertAmount(get().batchTotal, current.unit, unit),
    });
  },

  setEntryMode: (entryMode) => {
    const total = oilTotal(get().config);
    set({
      entryMode,
      batchTotal: total > 0 ? total : get().batchTotal,
    });
  },

  setBatchTotal: (total) => {
    if (!Number.isFinite(total) || total <= 0) return;
    const current = get().config;
    if (get().entryMode === "percent") {
      const basis = get().batchTotal > 0 ? get().batchTotal : oilTotal(current);
      if (basis <= 0) {
        set({ batchTotal: total });
        return;
      }
      const factor = total / basis;
      set({
        batchTotal: total,
        config: {
          ...current,
          oils: current.oils.map((row) => ({
            ...row,
            amount: row.amount * factor,
          })),
        },
      });
      return;
    }
    get().scaleOilsTo(total);
  },

  setOilAmount: (oilId, amount) => {
    const current = get().config;
    const oils = current.oils.map((row) =>
      row.oilId === oilId ? { ...row, amount } : row,
    );
    set({
      config: { ...current, oils },
      batchTotal:
        get().entryMode === "weight"
          ? oils.reduce((sum, row) => sum + row.amount, 0)
          : get().batchTotal,
    });
  },

  setOilPercent: (oilId, percent) => {
    const basis = get().batchTotal > 0 ? get().batchTotal : oilTotal(get().config);
    const amount = (Math.max(0, percent) / 100) * (basis || 1000);
    const current = get().config;
    set({
      batchTotal: basis || 1000,
      config: {
        ...current,
        oils: current.oils.map((row) =>
          row.oilId === oilId ? { ...row, amount } : row,
        ),
      },
    });
  },

  normalizePercents: () => {
    const current = get().config;
    const sum = oilTotal(current);
    const basis = get().batchTotal > 0 ? get().batchTotal : sum;
    if (sum <= 0 || basis <= 0) return;
    const factor = basis / sum;
    set({
      entryMode: "percent",
      batchTotal: basis,
      config: {
        ...current,
        oils: current.oils.map((row) => ({
          ...row,
          amount: row.amount * factor,
        })),
      },
    });
  },

  addOil: (oilId, amount) => {
    const current = get().config;
    if (current.oils.some((row) => row.oilId === oilId)) return;
    const nextAmount =
      amount ??
      (get().entryMode === "percent"
        ? (get().batchTotal || oilTotal(current) || 1000) * 0.05
        : current.unit === "oz"
          ? 1.76
          : 50);
    set({
      config: { ...current, oils: [...current.oils, { oilId, amount: nextAmount }] },
    });
  },

  removeOil: (oilId) => {
    const current = get().config;
    set({
      config: {
        ...current,
        oils: current.oils.filter((row) => row.oilId !== oilId),
      },
    });
  },

  scaleOilsTo: (total) => {
    const current = get().config;
    const sum = oilTotal(current);
    if (sum <= 0 || !Number.isFinite(total) || total <= 0) {
      set({ batchTotal: total });
      return;
    }
    const factor = total / sum;
    set({
      batchTotal: total,
      config: {
        ...current,
        oils: current.oils.map((row) => ({
          ...row,
          amount: row.amount * factor,
        })),
      },
    });
  },

  setSuperfat: (superfatPercentage) => {
    set({ config: { ...get().config, superfatPercentage } });
  },

  setLiquidMode: (mode) => {
    const current = get().config;
    const defaults: Record<LiquidMode, number> = {
      concentration: 33,
      ratio: 2,
      water_percent_oils: 38,
    };
    set({
      config: {
        ...current,
        liquidConfig: { mode, value: defaults[mode] },
      },
    });
  },

  setLiquidValue: (value) => {
    const current = get().config;
    set({
      config: {
        ...current,
        liquidConfig: { ...current.liquidConfig, value },
      },
    });
  },

  setNaohRatio: (naohRatio) => {
    const current = get().config;
    set({
      config: {
        ...current,
        lyeChoice: { ...current.lyeChoice, naohRatio },
      },
    });
  },

  setLyeType: (type) => {
    const current = get().config;
    const naohRatio = type === "naoh" ? 1 : type === "koh" ? 0 : current.lyeChoice.naohRatio === 0 || current.lyeChoice.naohRatio === 1 ? 0.5 : current.lyeChoice.naohRatio;
    set({
      config: {
        ...current,
        lyeChoice: { ...current.lyeChoice, naohRatio },
      },
    });
  },

  setNaohPurity: (naohPurity) => {
    const current = get().config;
    set({
      config: {
        ...current,
        lyeChoice: { ...current.lyeChoice, naohPurity },
      },
    });
  },

  setKohPurity: (kohPurity) => {
    const current = get().config;
    set({
      config: {
        ...current,
        lyeChoice: { ...current.lyeChoice, kohPurity },
      },
    });
  },

  setFragrance: (fragranceGrams) => {
    const current = get().config;
    set({
      config: {
        ...current,
        additives: { ...current.additives, fragranceGrams },
      },
    });
  },

  setSodiumLactate: (sodiumLactateGrams) => {
    const current = get().config;
    set({
      config: {
        ...current,
        additives: { ...current.additives, sodiumLactateGrams },
      },
    });
  },

  loadPreset: (config) =>
    set({
      config: cloneConfig(config),
      batchTotal: oilTotal(config),
    }),

  loadSingleOil: (oilId, amount) => {
    const weight = Number.isFinite(amount) && amount > 0 ? amount : 500;
    const config: RecipeConfig = {
      unit: "g",
      oils: [{ oilId, amount: weight }],
      superfatPercentage: 5,
      liquidConfig: { mode: "concentration", value: 33 },
      lyeChoice: { naohRatio: 1, naohPurity: 0.99, kohPurity: 0.9 },
      additives: { fragranceGrams: 0, sodiumLactateGrams: 0 },
    };
    set({
      config,
      entryMode: "weight",
      batchTotal: weight,
    });
  },

  reset: () =>
    set({
      config: cloneConfig(EVERYDAY_BAR),
      entryMode: "percent",
      batchTotal: oilTotal(EVERYDAY_BAR),
    }),
}));
