import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { OIL_DATABASE, getOilBySlug } from "../data/oils.ts";
import {
  COMPARE_DELIMITER,
  KOH_COMMERCIAL_PURITY,
  comparePairPath,
  kohAdjustedSap,
  listWorkhorseComparePairs,
  oilQuality,
  parseComparePair,
  substitutionFactor,
  unlistedFattyAcids,
} from "./oil-specs.ts";

function must(slug: string) {
  const oil = getOilBySlug(slug);
  assert.ok(oil, `missing ${slug}`);
  return oil;
}

describe("oil library identity", () => {
  it("has unique ids and slugs", () => {
    const ids = OIL_DATABASE.map((oil) => oil.id);
    const slugs = OIL_DATABASE.map((oil) => oil.slug);
    assert.equal(new Set(ids).size, ids.length);
    assert.equal(new Set(slugs).size, slugs.length);
  });

  it("resolves published aliases used in compare URLs", () => {
    assert.equal(getOilBySlug("coconut-oil")?.id, "coconut-76");
    assert.equal(getOilBySlug("palm-oil")?.id, "palm-rspo");
    assert.equal(getOilBySlug("tallow")?.id, "tallow");
    assert.equal(getOilBySlug("babassu-oil")?.id, "babassu");
  });
});

describe("KOH 90% reagent adjustment", () => {
  it("divides pure KOH SAP by 0.90", () => {
    const coconut = must("coconut-oil-76");
    assert.equal(KOH_COMMERCIAL_PURITY, 0.9);
    assert.equal(kohAdjustedSap(coconut.sap_koh), coconut.sap_koh / 0.9);
  });
});

describe("single-oil quality scores", () => {
  it("matches the fatty-acid identities used by the batch engine", () => {
    const coconut = must("coconut-76");
    const scores = oilQuality(coconut);
    const fa = coconut.fatty_acids;
    assert.equal(
      scores.hardness,
      fa.lauric + fa.myristic + fa.palmitic + fa.stearic,
    );
    assert.equal(scores.cleansing, fa.lauric + fa.myristic);
    assert.equal(
      scores.conditioning,
      fa.oleic + fa.linoleic + fa.linolenic + fa.ricinoleic,
    );
    assert.equal(scores.bubbly, fa.lauric + fa.myristic + fa.ricinoleic);
    assert.equal(scores.creamy, fa.palmitic + fa.stearic + fa.ricinoleic);
    assert.equal(scores.longevity, fa.palmitic + fa.stearic);
    assert.equal(scores.iodine, coconut.iodine);
    assert.equal(scores.ins, coconut.ins);
  });

  it("reports unlisted acids as the remainder below 100%", () => {
    const coconut = must("coconut-76");
    const listed =
      coconut.fatty_acids.lauric +
      coconut.fatty_acids.myristic +
      coconut.fatty_acids.palmitic +
      coconut.fatty_acids.stearic +
      coconut.fatty_acids.ricinoleic +
      coconut.fatty_acids.oleic +
      coconut.fatty_acids.linoleic +
      coconut.fatty_acids.linolenic;
    assert.equal(unlistedFattyAcids(coconut.fatty_acids), 100 - listed);
    assert.ok(unlistedFattyAcids(coconut.fatty_acids) > 0);
  });
});

describe("compare pair routing", () => {
  it("parses canonical workhorse slugs", () => {
    const parsed = parseComparePair("babassu-oil-vs-coconut-oil-76");
    assert.ok(parsed);
    assert.equal(parsed.a.id, "babassu");
    assert.equal(parsed.b.id, "coconut-76");
  });

  it("parses the published alias forms", () => {
    const babassuCoconut = parseComparePair("babassu-oil-vs-coconut-oil");
    assert.ok(babassuCoconut);
    assert.equal(babassuCoconut.a.id, "babassu");
    assert.equal(babassuCoconut.b.id, "coconut-76");

    const palmTallow = parseComparePair("palm-oil-vs-tallow");
    assert.ok(palmTallow);
    assert.equal(palmTallow.a.id, "palm-rspo");
    assert.equal(palmTallow.b.id, "tallow");
  });

  it("rejects unknown oils, missing delimiter, and identical oils", () => {
    assert.equal(parseComparePair("not-an-oil-vs-olive-oil"), null);
    assert.equal(parseComparePair("olive-oil"), null);
    assert.equal(parseComparePair("coconut-oil-vs-coconut-oil-76"), null);
  });

  it("generates ordered workhorse permutations including both directions", () => {
    const pairs = listWorkhorseComparePairs();
    const horses = OIL_DATABASE.filter((oil) => oil.workhorse);
    assert.equal(pairs.length, horses.length * (horses.length - 1));
    assert.ok(
      pairs.some((row) => row.pair === "babassu-oil-vs-coconut-oil-76"),
    );
    assert.ok(pairs.some((row) => row.pair === "palm-oil-rspo-vs-tallow"));
    assert.ok(
      pairs.every((row) => row.pair.includes(COMPARE_DELIMITER) && row.a.id !== row.b.id),
    );
    const reverse = pairs.find((row) => row.pair === "tallow-vs-palm-oil-rspo");
    assert.ok(reverse);
  });

  it("builds pair paths from canonical slugs", () => {
    assert.equal(
      comparePairPath(must("babassu-oil"), must("coconut-oil-76")),
      "babassu-oil-vs-coconut-oil-76",
    );
  });
});

describe("substitution factor", () => {
  it("is SAP_A / SAP_B using NaOH SAP", () => {
    const a = must("babassu-oil");
    const b = must("coconut-oil-76");
    const factor = substitutionFactor(a, b);
    assert.equal(factor, a.sap_naoh / b.sap_naoh);
    assert.ok(factor < 1);
  });

  it("is the reciprocal when the pair is reversed", () => {
    const a = must("palm-oil");
    const b = must("tallow");
    const forward = substitutionFactor(a, b);
    const reverse = substitutionFactor(b, a);
    assert.ok(Math.abs(forward * reverse - 1) < 1e-12);
  });
});
