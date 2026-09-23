import { OIL_DATABASE, getOilBySlug, workhorseOils } from "../data/oils.ts";
import { qualityFromFattyAcids } from "./calcEngine.ts";
import {
  FATTY_ACID_KEYS,
  type FattyAcidKey,
  type FattyAcidProfile,
  type MasterOilRecord,
  type QualityScores,
} from "../types/soap.ts";

const QUALITY_METRIC_KEYS = [
  "hardness",
  "cleansing",
  "conditioning",
  "bubbly",
  "creamy",
  "longevity",
] as const;

export const KOH_COMMERCIAL_PURITY = 0.9;
export const DEFAULT_PRELOAD_WEIGHT_G = 500;
export const COMPARE_DELIMITER = "-vs-";

export type FattyAcidFamily =
  | "saturated"
  | "monounsaturated"
  | "polyunsaturated"
  | "hydroxy";

export interface FattyAcidMeta {
  label: string;
  chain: string;
  family: FattyAcidFamily;
  contribution: string;
}

export const FATTY_ACID_META: Record<FattyAcidKey, FattyAcidMeta> = {
  lauric: {
    label: "Lauric",
    chain: "C12:0",
    family: "saturated",
    contribution: "Hardness, cleansing, bubbly",
  },
  myristic: {
    label: "Myristic",
    chain: "C14:0",
    family: "saturated",
    contribution: "Hardness, cleansing, bubbly",
  },
  palmitic: {
    label: "Palmitic",
    chain: "C16:0",
    family: "saturated",
    contribution: "Hardness, creamy, longevity",
  },
  stearic: {
    label: "Stearic",
    chain: "C18:0",
    family: "saturated",
    contribution: "Hardness, creamy, longevity",
  },
  ricinoleic: {
    label: "Ricinoleic",
    chain: "C18:1-OH",
    family: "hydroxy",
    contribution: "Conditioning, bubbly, creamy",
  },
  oleic: {
    label: "Oleic",
    chain: "C18:1",
    family: "monounsaturated",
    contribution: "Conditioning",
  },
  linoleic: {
    label: "Linoleic",
    chain: "C18:2",
    family: "polyunsaturated",
    contribution: "Conditioning",
  },
  linolenic: {
    label: "Linolenic",
    chain: "C18:3",
    family: "polyunsaturated",
    contribution: "Conditioning",
  },
};

export const FAMILY_LABEL: Record<FattyAcidFamily, string> = {
  saturated: "Saturated",
  monounsaturated: "Monounsaturated",
  polyunsaturated: "Polyunsaturated",
  hydroxy: "Hydroxy",
};

export function kohAdjustedSap(
  sapKoh: number,
  purity: number = KOH_COMMERCIAL_PURITY,
): number {
  if (!Number.isFinite(sapKoh) || !Number.isFinite(purity) || purity <= 0) {
    return 0;
  }
  return sapKoh / purity;
}

export function oilQuality(oil: MasterOilRecord): QualityScores {
  return qualityFromFattyAcids(oil.fatty_acids, oil.iodine, oil.ins);
}

export function fattyAcidSum(profile: FattyAcidProfile): number {
  return FATTY_ACID_KEYS.reduce((sum, key) => sum + profile[key], 0);
}

export function unlistedFattyAcids(profile: FattyAcidProfile): number {
  return Math.max(0, 100 - fattyAcidSum(profile));
}

export function substitutionFactor(
  oilA: MasterOilRecord,
  oilB: MasterOilRecord,
): number {
  if (!Number.isFinite(oilB.sap_naoh) || oilB.sap_naoh === 0) return 0;
  return oilA.sap_naoh / oilB.sap_naoh;
}

export function comparePairPath(
  oilA: MasterOilRecord,
  oilB: MasterOilRecord,
): string {
  return `${oilA.slug}${COMPARE_DELIMITER}${oilB.slug}`;
}

export function parseComparePair(
  pair: string,
  database: MasterOilRecord[] = OIL_DATABASE,
): { a: MasterOilRecord; b: MasterOilRecord } | null {
  const idx = pair.indexOf(COMPARE_DELIMITER);
  if (idx <= 0) return null;
  const left = pair.slice(0, idx);
  const right = pair.slice(idx + COMPARE_DELIMITER.length);
  if (!left || !right) return null;
  const a = getOilBySlug(left, database);
  const b = getOilBySlug(right, database);
  if (!a || !b || a.id === b.id) return null;
  return { a, b };
}

export interface ComparePair {
  a: MasterOilRecord;
  b: MasterOilRecord;
  pair: string;
  factor: number;
}

export function listWorkhorseComparePairs(
  database: MasterOilRecord[] = OIL_DATABASE,
): ComparePair[] {
  const horses = workhorseOils(database);
  const pairs: ComparePair[] = [];
  for (const a of horses) {
    for (const b of horses) {
      if (a.id === b.id) continue;
      pairs.push({
        a,
        b,
        pair: comparePairPath(a, b),
        factor: substitutionFactor(a, b),
      });
    }
  }
  return pairs;
}

export function counterpartPairs(
  oil: MasterOilRecord,
  database: MasterOilRecord[] = OIL_DATABASE,
): ComparePair[] {
  const horses = workhorseOils(database);
  const pool = horses.some((entry) => entry.id === oil.id)
    ? horses
    : [oil, ...horses];
  return pool
    .filter((entry) => entry.id !== oil.id)
    .map((b) => ({
      a: oil,
      b,
      pair: comparePairPath(oil, b),
      factor: substitutionFactor(oil, b),
    }));
}

export type UsageTag = "hardening" | "softening" | "brittle";

export interface UsageAdvisory {
  maxPercent: number;
  tags: UsageTag[];
  notes: string[];
}

export function usageAdvisory(oil: MasterOilRecord): UsageAdvisory {
  const quality = oilQuality(oil);
  const tags: UsageTag[] = [];
  const notes: string[] = [];

  if (oil.hardness_profile === "brittle") tags.push("brittle");
  else if (oil.hardness_profile === "hard") tags.push("hardening");
  else tags.push("softening");

  if (oil.recommended_max_percentage < 100) {
    notes.push(`Recommended maximum ${oil.recommended_max_percentage}% of total oils.`);
  } else {
    notes.push("No percentage cap in this library (100% of oils).");
  }

  if (quality.cleansing > 40) {
    notes.push("High lauric/myristic — stripping risk above the max without extra superfat.");
  } else if (quality.cleansing > 22) {
    notes.push("Cleansing above the 12–22 target range at 100%.");
  }

  if (oil.hardness_profile === "hard" && quality.longevity >= 40) {
    notes.push("High palmitic/stearic — accelerates hardness and can crack if overused.");
  }

  if (oil.fatty_acids.ricinoleic >= 50) {
    notes.push("Ricinoleic lather booster — keep at or below the max to avoid stickiness.");
  }

  if (oil.hardness_profile === "soft" && oil.iodine >= 100) {
    notes.push("High iodine — DOS risk in exposed bars; keep the percentage modest.");
  }

  if (oil.trace_speed_impact === "accelerates") {
    notes.push("Accelerates trace.");
  } else if (oil.trace_speed_impact === "slows") {
    notes.push("Slows trace.");
  }

  return {
    maxPercent: oil.recommended_max_percentage,
    tags,
    notes,
  };
}

export function oilPath(oil: MasterOilRecord): string {
  return `/oils/${oil.slug}`;
}

export function comparePath(oilA: MasterOilRecord, oilB: MasterOilRecord): string {
  return `/oils/compare/${comparePairPath(oilA, oilB)}`;
}

export function calculatorPreloadPath(
  oil: MasterOilRecord,
  weight = DEFAULT_PRELOAD_WEIGHT_G,
): string {
  return `/soap?oil=${encodeURIComponent(oil.slug)}&wt=${weight}`;
}

type JsonLd = Record<string, unknown>;

function sapVariable(
  name: string,
  value: number,
  unitText: string,
): JsonLd {
  return {
    "@type": "PropertyValue",
    name,
    value: Number(value.toFixed(4)),
    unitText,
  };
}

export function oilDatasetJsonLd(oil: MasterOilRecord): JsonLd {
  const quality = oilQuality(oil);
  const path = oilPath(oil);
  const variables: JsonLd[] = [
    sapVariable("SAP NaOH (pure)", oil.sap_naoh, "g NaOH / g oil"),
    sapVariable("SAP KOH (pure)", oil.sap_koh, "g KOH / g oil"),
    sapVariable(
      "SAP KOH (90% reagent)",
      kohAdjustedSap(oil.sap_koh),
      "g 90% KOH / g oil",
    ),
    {
      "@type": "PropertyValue",
      name: "Iodine value",
      value: oil.iodine,
      unitText: "g I2 / 100 g",
    },
    {
      "@type": "PropertyValue",
      name: "INS",
      value: oil.ins,
    },
    ...FATTY_ACID_KEYS.map((key) => ({
      "@type": "PropertyValue",
      name: `${FATTY_ACID_META[key].label} (${FATTY_ACID_META[key].chain})`,
      value: oil.fatty_acids[key],
      unitText: "%",
    })),
    ...QUALITY_METRIC_KEYS.map((key) => ({
      "@type": "PropertyValue",
      name: key,
      value: Number(quality[key].toFixed(1)),
    })),
  ];

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Dataset",
        "@id": `${path}#dataset`,
        name: `${oil.name} saponification constants`,
        description: `${oil.name} (${oil.common_botanical_name}) NaOH SAP, KOH SAP, iodine, INS, fatty acids, and quality scores.`,
        url: path,
        license: "https://creativecommons.org/publicdomain/zero/1.0/",
        creator: { "@type": "Organization", "name": "Saponis" },
        variableMeasured: variables,
        isPartOf: { "@type": "DataCatalog", name: "Saponis oil library", url: "/oils" },
      },
      {
        "@type": "Product",
        "@id": `${path}#product`,
        name: oil.name,
        alternateName: [oil.common_botanical_name, oil.inci_names.standard],
        category: "Soapmaking oil",
        material: oil.inci_names.standard,
        identifier: oil.slug,
        additionalProperty: [
          {
            "@type": "PropertyValue",
            name: "INCI pre-saponification",
            value: oil.inci_names.standard,
          },
          {
            "@type": "PropertyValue",
            name: "INCI NaOH salt",
            value: oil.inci_names.saponified_naoh,
          },
          {
            "@type": "PropertyValue",
            name: "INCI KOH salt",
            value: oil.inci_names.saponified_koh,
          },
          {
            "@type": "PropertyValue",
            name: "Hardness classification",
            value: oil.hardness_profile,
          },
          {
            "@type": "PropertyValue",
            name: "Recommended maximum percentage",
            value: oil.recommended_max_percentage,
            unitText: "% of oils",
          },
        ],
      },
      {
        "@type": "TechArticle",
        "@id": `${path}#article`,
        headline: `${oil.name} specification sheet`,
        name: `${oil.name} specification sheet`,
        about: { "@id": `${path}#product` },
        url: path,
        proficiencyLevel: "Expert",
        author: { "@type": "Organization", name: "Saponis" },
      },
    ],
  };
}

export function compareDatasetJsonLd(
  oilA: MasterOilRecord,
  oilB: MasterOilRecord,
): JsonLd {
  const factor = substitutionFactor(oilA, oilB);
  const path = comparePath(oilA, oilB);
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Dataset",
        "@id": `${path}#dataset`,
        name: `${oilA.name} vs ${oilB.name} substitution constants`,
        description: `Head-to-head SAP, fatty acid, and quality comparison. Substitution factor = SAP(${oilA.name}) / SAP(${oilB.name}) = ${factor.toFixed(4)}.`,
        url: path,
        creator: { "@type": "Organization", name: "Saponis" },
        variableMeasured: [
          sapVariable(`${oilA.name} SAP NaOH`, oilA.sap_naoh, "g NaOH / g oil"),
          sapVariable(`${oilB.name} SAP NaOH`, oilB.sap_naoh, "g NaOH / g oil"),
          {
            "@type": "PropertyValue",
            name: "Substitution factor",
            value: Number(factor.toFixed(4)),
            description: `SAP_Oil_A / SAP_Oil_B. Oil-weight factor: use this many grams of ${oilB.name} per gram of ${oilA.name} to keep lye unchanged. To swap at equal oil weight instead, multiply that oil's lye share by ${Number((1 / factor).toFixed(4))} (SAP_B / SAP_A).`,
          },
        ],
        hasPart: [
          { "@id": `${oilPath(oilA)}#dataset` },
          { "@id": `${oilPath(oilB)}#dataset` },
        ],
      },
      {
        "@type": "TechArticle",
        "@id": `${path}#article`,
        headline: `${oilA.name} vs ${oilB.name}`,
        about: [
          { "@id": `${oilPath(oilA)}#product` },
          { "@id": `${oilPath(oilB)}#product` },
        ],
        url: path,
        proficiencyLevel: "Expert",
        author: { "@type": "Organization", name: "Saponis" },
      },
    ],
  };
}

export function catalogDatasetJsonLd(
  database: MasterOilRecord[] = OIL_DATABASE,
): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "DataCatalog",
    name: "Saponis oil library",
    description:
      "Saponification constants, fatty acid profiles, INCI names, and quality scores for soapmaking oils.",
    url: "/oils",
    creator: { "@type": "Organization", name: "Saponis" },
    dataset: database.map((oil) => ({
      "@type": "Dataset",
      name: oil.name,
      identifier: oil.slug,
      url: oilPath(oil),
    })),
  };
}

export function oilPageTitle(oil: MasterOilRecord): string {
  return `${oil.name} — SAP ${oil.sap_naoh.toFixed(4)} · Saponis`;
}

export function oilPageDescription(oil: MasterOilRecord): string {
  return `${oil.name} (${oil.common_botanical_name}). NaOH SAP ${oil.sap_naoh.toFixed(4)}, KOH SAP ${oil.sap_koh.toFixed(4)} (90% ${kohAdjustedSap(oil.sap_koh).toFixed(4)}), iodine ${oil.iodine}, INS ${oil.ins}. INCI ${oil.inci_names.standard} / ${oil.inci_names.saponified_naoh}.`;
}

export function comparePageTitle(
  oilA: MasterOilRecord,
  oilB: MasterOilRecord,
): string {
  return `${oilA.name} vs ${oilB.name} — Saponis`;
}

export function comparePageDescription(
  oilA: MasterOilRecord,
  oilB: MasterOilRecord,
): string {
  const factor = substitutionFactor(oilA, oilB);
  const lyeFactor = 1 / factor;
  return `${oilA.name} vs ${oilB.name}. NaOH SAP ${oilA.sap_naoh.toFixed(4)} / ${oilB.sap_naoh.toFixed(4)}. Substitution factor ${factor.toFixed(4)} (SAP_A / SAP_B): use ${factor.toFixed(4)} g of ${oilB.name} per gram of ${oilA.name} to keep lye unchanged, or multiply that oil's lye share by ${lyeFactor.toFixed(4)} at equal oil weight.`;
}
