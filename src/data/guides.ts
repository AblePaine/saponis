export type GuideBlock =
  | { kind: "paragraph"; text: string }
  | { kind: "list"; items: string[] }
  | { kind: "ordered"; items: string[] }
  | { kind: "table"; headers: string[]; rows: string[][] };

export interface GuideSection {
  heading: string;
  /** "warning" renders the section card with a safety accent. */
  accent?: "warning";
  blocks: GuideBlock[];
}

export interface Guide {
  slug: string;
  title: string;
  description: string;
  kicker: string;
  tags: string[];
  published: string;
  intro: string[];
  sections: GuideSection[];
  keyNumbers: string[];
}

const lyeSafety: Guide = {
  slug: "lye-safety-checklist",
  title: "Lye Safety: The Non-Negotiable Checklist",
  description:
    "PPE, ventilation, mixing order, and storage for sodium and potassium hydroxide — the working rules before any batch of soap.",
  kicker: "Safety",
  tags: ["lye", "safety", "PPE", "cold-process"],
  published: "2026-09-23",
  intro: [
    "Sodium hydroxide and potassium hydroxide turn oils into soap. They also destroy skin, eyes, and aluminum. This is the working checklist. If a step is skipped, the batch waits.",
  ],
  sections: [
    {
      heading: "Before anything leaves the shelf",
      accent: "warning",
      blocks: [
        {
          kind: "list",
          items: [
            "No children, no pets, no open drink, no bare feet in the room.",
            "Work on a stable, wipeable surface. Not a wooden dining table you care about.",
            "Aluminum is off the list: no aluminum bowls, spoons, scale pans, or foil. Lye plus aluminum makes heat and hydrogen gas. Use HDPE, stainless steel, tempered glass, or polypropylene.",
            "Vinegar does not treat an eye exposure. It is a cleanup rinse for counters after the lye is diluted and wiped. Eyes and skin get running water. That is the whole first-aid rule.",
          ],
        },
      ],
    },
    {
      heading: "PPE that actually covers the splash",
      accent: "warning",
      blocks: [
        { kind: "paragraph", text: "Wear all of it before the lye lid opens." },
        {
          kind: "list",
          items: [
            "Eye protection: sealed goggles, not street glasses.",
            "Gloves: nitrile, long cuff. Not cracked dish gloves.",
            "Sleeves and closed shoes. An apron that can be stripped off.",
            "Optional face shield over goggles when you pour lye water into oils.",
          ],
        },
        {
          kind: "paragraph",
          text: "A long-sleeve shirt you will throw in the wash is better than a favorite hoodie.",
        },
      ],
    },
    {
      heading: "Ventilation",
      blocks: [
        {
          kind: "paragraph",
          text: "Mixing lye and water releases heat and a brief caustic mist. Do it under a running vent hood, next to an open window with a fan pulling air *out*, or outdoors. Do not lean over the pitcher while it clears.",
        },
        {
          kind: "paragraph",
          text: "The mix is usually done steaming in 30–90 seconds. Stay out of the plume until it settles.",
        },
      ],
    },
    {
      heading: "Mixing order is not a preference",
      accent: "warning",
      blocks: [
        { kind: "paragraph", text: "Water first. Lye second." },
        {
          kind: "ordered",
          items: [
            "Weigh room-temperature distilled or deionized water into a marked HDPE pitcher.",
            "Weigh the hydroxide into a separate dry cup.",
            "Pour the hydroxide into the water in a steady stream, stirring with a silicone or stainless spoon.",
            "Never pour water onto dry lye. The first water to hit the pile superheats and can erupt.",
          ],
        },
        {
          kind: "paragraph",
          text: "Target lye-water temperature after the reaction settles: 80–120°F for most cold-process batches. If it spikes above 180°F, leave it alone until it drops. Do not fridge a 200°F pitcher sealed tight.",
        },
        {
          kind: "paragraph",
          text: "Potassium hydroxide for liquid soap follows the same order. KOH often runs hotter. Same PPE, same water-first rule.",
        },
      ],
    },
    {
      heading: "Water and lye amounts",
      blocks: [
        {
          kind: "paragraph",
          text: "Use a scale that reads 0.1 g for batches under 2 kg of oils, 1 g for larger. Volume measurements of lye are how people mis-batch.",
        },
        {
          kind: "paragraph",
          text: "Standard practice is to calculate NaOH or KOH from the saponification values of each oil, then apply a lye discount (superfat) of 5–8% for bars unless a specific recipe says otherwise. Different calculators publish slightly different SAP tables. Use one tool for the whole batch. Do not mix a SAP from one chart with a discount from another.",
        },
        {
          kind: "paragraph",
          text: "Water as a percent of oils commonly sits at 30–38% for cold process (a 2.2:1 to 2.5:1 water:lye ratio by weight is a typical band). That is a formulation choice, not a safety choice. Safety is: known weights, labeled pitcher, no substitutions.",
        },
      ],
    },
    {
      heading: "Storage",
      blocks: [
        {
          kind: "list",
          items: [
            "Hydroxide stays in its original sealed container, dry, up high, away from acids and away from food.",
            "Do not store lye in unlabeled jars. A strip of tape with \"NaOH — caustic\" and the date is the minimum.",
            "Lye water that you mixed and did not use: leave it labeled, let it cool, and use it in the next batch within a day, or neutralize with a large volume of water and pour to a utility sink — never a septic lecture, just do not dump concentrate on soil or aluminum.",
            "Clean tools with plenty of water. Wash gloves before you take them off so you do not touch the cuffs to your face.",
          ],
        },
      ],
    },
    {
      heading: "If it gets on you",
      accent: "warning",
      blocks: [
        {
          kind: "list",
          items: [
            "Skin: running water 10–15 minutes. Remove soaked cloth while under the water. Then medical care if the area is more than a small splash.",
            "Eyes: running water 15 minutes, eyelids open. Then emergency care. Do not neutralize with acid.",
            "Inhaled mist: fresh air. If breathing is affected, emergency care.",
            "Swallowed: do not induce vomiting. Emergency care.",
          ],
        },
        {
          kind: "paragraph",
          text: "Keep a charged phone in the room. Keep a clear path to the sink.",
        },
      ],
    },
    {
      heading: "Batch-day order of operations",
      blocks: [
        {
          kind: "ordered",
          items: [
            "Clear the room. Put on PPE.",
            "Weigh water. Weigh oils. Weigh lye last.",
            "Mix lye into water. Set it aside to cool.",
            "Melt and combine oils.",
            "When both pans are in the 80–110°F band (or whatever the recipe calls for), combine.",
            "Do not take the goggles off until the mold is filled and the pitcher is rinsing.",
          ],
        },
      ],
    },
    {
      heading: "Milk, honey, and other sugars",
      blocks: [
        {
          kind: "paragraph",
          text: "Sugar in the water phase heats harder. Frozen milk, added in slush to the lye, is the usual control. Same PPE. Same water-first logic: the milk is the water. Work cooler, and do not walk away from the pitcher in the first two minutes. Honey at 1–2 oz per pound of oils goes in at trace, not in the lye water.",
        },
      ],
    },
  ],
  keyNumbers: [
    "Water first, lye second. Never the reverse.",
    "Goggles + nitrile + covered skin before the lid opens.",
    "No aluminum anywhere in the chain.",
    "Scale to 0.1 g on small batches.",
    "Eyes and skin: water only, 10–15 minutes. Vinegar is for counters, not eyes.",
  ],
};

const readingAnOil: Guide = {
  slug: "reading-an-oil",
  title: "Reading an Oil: Hardness, Lather, and Conditioning in the Finished Bar",
  description:
    "How coconut, olive, tallow, palm, castor, and the common butters shift hardness, bubbles, and skin feel — with usable percentage ranges.",
  kicker: "Formulation",
  tags: ["oils", "formulation", "lather", "fatty-acids"],
  published: "2026-09-23",
  intro: [
    "Every oil is a mix of fatty acids. Those acids become the soap molecules. Change the mix and you change whether the bar is a rock, a slime, a bubble factory, or a lotion with a hint of cleaning.",
    "You do not need to memorize every SAP value — your calculator already has a table. You do need to know what each fat is *for* so you stop swapping oils by vibe.",
  ],
  sections: [
    {
      heading: "The four things a fat changes",
      blocks: [
        {
          kind: "list",
          items: [
            "**Hardness.** Stearic and palmitic acids make a bar that unmolds clean and lasts in the dish. Lauric and myristic help hardness too, with more bubble.",
            "**Lather.** Lauric and myristic (coconut, palm kernel, babassu) make big, quick bubbles. Castor's ricinoleic acid makes bubbles creamier and more stable.",
            "**Conditioning.** Oleic, linoleic, and linolenic acids leave the skin softer. Too much and the bar is soft and short-lived.",
            "**Shelf life.** Linoleic and linolenic oxidize. High-linoleic oils in a 40% slice of the recipe are how a bar smells like old crayons in four months.",
          ],
        },
      ],
    },
    {
      heading: "The common fats, as ranges",
      blocks: [
        { kind: "paragraph", text: "Percentages are percent of total oils in a bar recipe." },
        {
          kind: "table",
          headers: ["Fat", "Typical range in a bar", "Dominant acids", "What it does", "Watch-outs"],
          rows: [
            ["Coconut oil (76°)", "15–30%", "Lauric, myristic", "Hardness + big bubbles", "Above 30% without extra superfat can feel harsh"],
            ["Olive oil", "20–80%", "Oleic", "Conditioning, mildness, slow to harden", "100% Castile takes 6–8+ weeks to firm"],
            ["Tallow or lard", "20–50%", "Palmitic, stearic, oleic", "Hard, stable, creamy, cheap if you render", "Quality varies with the render"],
            ["Palm (not kernel)", "15–30%", "Palmitic, oleic", "Hardness similar to tallow", "Skip if you do not want it; tallow or lard substitute"],
            ["Palm kernel / babassu", "10–20%", "Lauric", "Coconut-like bubbles", "Treat like coconut in the math"],
            ["Castor", "3–8%", "Ricinoleic", "Creamy, stable lather", "Above 10% gets sticky and soft"],
            ["Shea / cocoa / mango butter", "5–15%", "Stearic, oleic", "Hardness + conditioning", "High shea can accelerate trace"],
            ["Sweet almond, sunflower, rice bran", "5–15%", "Oleic / linoleic", "Slip and conditioning", "Keep linoleic-heavy oils modest"],
            ["Avocado", "5–20%", "Oleic", "Mildness", "Soft bar if it dominates"],
          ],
        },
        {
          kind: "paragraph",
          text: "A workhorse grocery bar that lasts: 30% tallow or palm, 25% olive, 25% coconut, 15% a liquid oil, 5% castor.",
        },
        {
          kind: "paragraph",
          text: "A 100% olive Castile is a valid bar. It is not a beginner unmold. Plan 48 hours in the mold and a long cure.",
        },
      ],
    },
    {
      heading: "Fatty-acid targets for a balanced bar",
      blocks: [
        {
          kind: "paragraph",
          text: "Formulators often aim at a finished-bar window like this. Calculators differ on the exact predicted percentages; treat these as a lane, not a law.",
        },
        {
          kind: "list",
          items: [
            "Lauric: 10–20%",
            "Myristic: 5–10%",
            "Palmitic: 10–20%",
            "Stearic: 5–12%",
            "Oleic: 30–45%",
            "Linoleic: under 15% for a long-lived bar",
            "Ricinoleic: 3–8% if castor is in the recipe",
          ],
        },
        {
          kind: "paragraph",
          text: "If lauric + myristic climb over ~30%, add 1–2 points of extra superfat or drop the coconut. If oleic dominates past 55%, expect a softer bar and a longer wait before unmold.",
        },
      ],
    },
    {
      heading: "Swapping without wrecking the batch",
      blocks: [
        {
          kind: "paragraph",
          text: "Replacing palm with tallow is usually 1:1 by weight, then run the calculator again — SAP values are not identical. Replacing coconut with olive is not 1:1 in performance. You will lose bubbles. Replacing 10% coconut with 10% babassu is close.",
        },
        {
          kind: "paragraph",
          text: "Always recalculate lye when an oil changes. A \"same weight\" swap is not a same-lye swap. Use one SAP table for the whole recipe.",
        },
      ],
    },
    {
      heading: "Butters and trace",
      blocks: [
        {
          kind: "paragraph",
          text: "Shea and cocoa butter, especially above 10%, can push trace from \"I have time to swirl\" to \"the pot is pudding\" in under a minute. Melt them fully, combine with the liquid oils, and soap 5–10°F cooler if you need swirl time. Stick blenders are not a personality test. Pulse.",
        },
      ],
    },
    {
      heading: "A 1 kg test loaf worth keeping",
      blocks: [
        {
          kind: "paragraph",
          text: "300 g tallow, 250 g olive, 250 g coconut, 150 g sunflower (high-oleic), 50 g castor. 5% superfat. 33% water as percent of oils. That bar unmolds at 24 hours, lathers without stripping most hands, and lasts in a dish. Change one fat 5–10 points per test loaf so you can actually feel the difference.",
        },
        {
          kind: "paragraph",
          text: "Keep a single page of your last ten recipes with coconut percent, superfat, and a one-word lather note. That page is worth more than another fatty-acid essay. Patterns show up at recipe eight.",
        },
      ],
    },
  ],
  keyNumbers: [
    "Coconut 15–30% for bubbles; watch harshness above 30%.",
    "Castor 3–8%. Tallow or palm 20–50% for a hard bar.",
    "Olive as the conditioner; 100% olive is slow to harden.",
    "Keep linoleic-heavy oils modest if the bar must last a year.",
    "Any oil swap: rerun the lye math on one calculator. Do not mix SAP tables.",
  ],
};

const coldVsHot: Guide = {
  slug: "cold-process-vs-hot-process",
  title: "Cold Process vs Hot Process: Control, Cure Time, and Texture",
  description:
    "What you gain and lose choosing cold process or hot process — trace control, cook time, cure length, and the bar you get at the end.",
  kicker: "Process",
  tags: ["cold-process", "hot-process", "cure", "trace"],
  published: "2026-09-23",
  intro: [
    "Both methods mix oils with a calculated lye solution. Cold process lets the saponification heat happen in the mold. Hot process finishes that reaction in the pot, then you pack the mold with a mashed-potato paste. Neither is \"more natural.\" They make different workdays and slightly different bars.",
  ],
  sections: [
    {
      heading: "The clock",
      blocks: [
        {
          kind: "table",
          headers: ["", "Cold process (CP)", "Hot process (HP)"],
          rows: [
            ["Active time at the pot", "20–45 minutes", "60–150 minutes"],
            ["Time in the mold before cut", "18–48 hours", "4–24 hours"],
            ["Cure before a fair test of the bar", "4–6 weeks", "2–4 weeks (water still needs to leave)"],
            ["Swirls and delicate color work", "Excellent at emulsion-to-light trace", "Poor; paste smears"],
            ["Unmold reliability", "Depends on hard oils and temp", "Usually easy; paste is already thick"],
            ["Texture", "Smooth, can be glassy", "Rustic, scooped, sometimes grainy if rushed"],
          ],
        },
        {
          kind: "paragraph",
          text: "HP is not a shortcut past chemistry. It is a shortcut past waiting for the reaction to finish in the mold. Water still evaporates in the cure. A HP bar used the next morning is still a wet bar.",
        },
      ],
    },
    {
      heading: "Cold process, when it is the right tool",
      blocks: [
        {
          kind: "paragraph",
          text: "CP is the default when you want a smooth face, a swirl, a piped top, or a layered loaf.",
        },
        {
          kind: "paragraph",
          text: "Typical CP temperatures: oils and lye water both in the 80–110°F band. Milk soaps run cooler to keep the sugars from scorching. Stick-blend to a light trace if you need time, to a medium trace if the recipe is behaving and you want a clean pour.",
        },
        {
          kind: "paragraph",
          text: "Insulate the mold 24 hours if you want gel phase (a darker, slightly translucent center). Leave it uncovered in a 68°F room if you want to avoid gel. Neither choice is morally better. Gel can wrinkle titanium-dioxide swirls. No-gel is more even in color.",
        },
        {
          kind: "paragraph",
          text: "Cut at 24 hours for a tallow-coconut loaf. Wait 36–48 hours for high-olive recipes. If the loaf drags the knife, wait.",
        },
      ],
    },
    {
      heading: "Hot process, when it is the right tool",
      blocks: [
        {
          kind: "paragraph",
          text: "HP is the default when you want the lye reaction done before the mold, you are rebatching a failed CP loaf, or you do not care about a rustic top.",
        },
        {
          kind: "paragraph",
          text: "After trace, cook. Crockpot on low, or a pot over very low heat, stirring every 10–15 minutes. The paste moves through applesauce, then mashed potato, then a glossy, translucent vaseline stage. That last stage is the usual \"it's done\" signal — often 45–90 minutes after trace, depending on pot size and recipe.",
        },
        {
          kind: "paragraph",
          text: "Add fragrance after the cook, off the heat, at 180°F or below if the FO flash point needs it. You will lose some scent to heat. Use the higher end of a fragrance range, still inside IFRA and supplier limits.",
        },
        { kind: "paragraph", text: "Pack the mold. Tap. Do not expect a swirl to stay put." },
        {
          kind: "paragraph",
          text: "Some HP bars are usable in 7–10 days for a kitchen-sink test. They still firm through week 3–4 as water leaves. If a HP recipe used the same water as CP (33–38% of oils), it is not dry on day two.",
        },
      ],
    },
    {
      heading: "What does not change",
      blocks: [
        {
          kind: "list",
          items: [
            "Lye math. Same SAP values, same discount. Use one calculator.",
            "PPE. Hot paste is still alkaline. Goggles stay on.",
            "Superfat. A 5% discount is a 5% discount in both methods. HP does not \"burn off\" the extra fat if the cook is done at the usual finish. Overcooking until the paste dries out can fool you into thinking you need more water, not more lye.",
          ],
        },
      ],
    },
    {
      heading: "A straight recommendation",
      blocks: [
        {
          kind: "paragraph",
          text: "Making your first three batches: CP, simple loaf mold, 30% hard fat, 25% coconut, 5% castor, the rest olive or tallow, 5–6% superfat, no swirl. Learn trace.",
        },
        {
          kind: "paragraph",
          text: "Making a batch of laundry bars or using up a crate of rendered tallow on a weekday night: HP is fine.",
        },
        { kind: "paragraph", text: "Making anything you intend to photograph: CP." },
      ],
    },
    {
      heading: "Rebatch sits in the middle",
      blocks: [
        {
          kind: "paragraph",
          text: "A CP loaf that seized, separated, or came out lye-heavy (and is not a chemical burn hazard) can be grated and cooked like HP with a splash of water. You lose the swirl. You keep the oils. Treat the recook as HP for cure time. Do not rebatch a batch you cannot vouch for on the scale.",
        },
        {
          kind: "paragraph",
          text: "Fragrance and essential oils behave differently in the two pots. CP can take a swirl-friendly slow-moving FO at light trace. HP wants scent that survives 180°F. Check the supplier flash point. If it is under 180°F, add HP scent at the lowest temp you can still pack.",
        },
      ],
    },
  ],
  keyNumbers: [
    "CP pour: oils and lye water often 80–110°F; cut at 18–48 h; cure 4–6 weeks.",
    "HP cook: 45–90 min past trace to a glossy paste; cut as soon as it holds; still cure 2–4 weeks.",
    "Same lye math for both. Same PPE.",
    "HP does not delete the need for water weight to leave the bar.",
  ],
};

const superfatting: Guide = {
  slug: "superfatting-lye-discount",
  title: "Superfatting and Lye Discount: What the Percentage Does to the Bar",
  description:
    "What a 5% versus 8% superfat actually changes — leftover oil, mildness, shelf life — and how a lye discount is calculated.",
  kicker: "Formulation",
  tags: ["superfat", "lye-discount", "formulation", "SAP"],
  published: "2026-09-23",
  intro: [
    "Superfat and lye discount are the same idea from two directions. You use less hydroxide than the oils could theoretically consume, so a slice of fat remains unsaponified. That leftover fat is the cushion between \"cleans well\" and \"strips the hands.\"",
    "It is not extra oil poured in at trace unless you choose that method. The default is a discount on the lye.",
  ],
  sections: [
    {
      heading: "The math, in one pass",
      blocks: [
        {
          kind: "paragraph",
          text: "A calculator looks up a saponification value for each oil — grams of NaOH (or KOH) needed to saponify 1 gram of that oil. It multiplies by your weights, sums them, and that sum is a 0% superfat lye weight.",
        },
        { kind: "paragraph", text: "A 5% superfat means you use 95% of that lye weight." },
        {
          kind: "paragraph",
          text: "Example using round numbers for illustration. Your tool's SAP table is the one that matters; tables differ by a few thousandths.",
        },
        {
          kind: "list",
          items: [
            "500 g olive + 300 g coconut + 200 g tallow",
            "Hypothetical combined NaOH at 0%: 142.0 g",
            "5% superfat: 142.0 × 0.95 = 134.9 g NaOH",
            "8% superfat: 142.0 × 0.92 = 130.6 g NaOH",
          ],
        },
        { kind: "paragraph", text: "Same oils. Different leftover fat. Different bar." },
        {
          kind: "paragraph",
          text: "If you soap with KOH for liquid soap, the calculator uses KOH SAP values or converts NaOH × 1.403. Do not apply a NaOH gram weight to a KOH batch.",
        },
      ],
    },
    {
      heading: "What the leftover fat does",
      blocks: [
        {
          kind: "table",
          headers: ["Superfat", "Typical use", "Feel", "Risk"],
          rows: [
            ["0–2%", "Laundry bars, some household soap", "Very cleansing, can bite", "Harsh on skin, especially with high coconut"],
            ["3–5%", "Everyday body bars with 20–30% coconut", "Balanced", "The default lane"],
            ["6–8%", "Face bars, high-coconut recipes, gift soap", "Richer, milder", "Softer bar, slightly faster DOS if the extra fat is linoleic"],
            ["10%+", "Specialty or a mistake", "Greasy slip, poor lather", "Soft, short-lived, can go rancid sooner"],
          ],
        },
        {
          kind: "paragraph",
          text: "DOS is \"dreaded orange spots\" — oxidation. Extra unsaturated oil is fuel for it. Superfatting a high-linoleic recipe at 10% is how a pretty swirl spots in eight weeks.",
        },
      ],
    },
    {
      heading: "Discount vs. adding oil at trace",
      blocks: [
        { kind: "paragraph", text: "Two methods:" },
        {
          kind: "ordered",
          items: [
            "**Lye discount.** All oils in the pot from the start. Lye is reduced. The leftover fat is a mix of whatever is in the pot. Simple. Default.",
            "**Superfat at trace.** Calculate at 0% (or 2%), mix to trace, then stir in a reserved 5% of a chosen oil — often shea or a fancy liquid oil. That last oil is more likely to remain as that oil.",
          ],
        },
        {
          kind: "paragraph",
          text: "Method 2 is a preference for people who want the reserved oil's unsaponifiables in the bar. It is not required for a mild soap. Do not do both at full strength unless you meant to make an 10–12% superfat bar.",
        },
      ],
    },
    {
      heading: "Dual lye",
      blocks: [
        {
          kind: "paragraph",
          text: "Some liquid and cream soaps split the alkali between NaOH and KOH. The calculator should ask for a percent split (for example 30% NaOH / 70% KOH by neutralization demand) and a superfat. The discount applies to the combined alkali, not to one of them after the fact. If you hand-calculate, convert everything to one basis first.",
        },
      ],
    },
    {
      heading: "How to pick a number tomorrow",
      blocks: [
        {
          kind: "list",
          items: [
            "25–30% coconut body bar: 5–6%.",
            "40% coconut \"beach\" bar: 7–8%, or drop coconut.",
            "100% olive: 2–5%. Castile is already mild; extra superfat makes a softer slug.",
            "Shampoo bar: 3–5% plus a recipe built for that job, not a body-bar recipe with more shea.",
            "Laundry bar: 0–2%.",
          ],
        },
        {
          kind: "paragraph",
          text: "Run the number in one calculator. Write the superfat on the mold tag. When the bar feels harsh at week 6, raise superfat 1–2 points next time or cut coconut 5 points. When the bar dissolves in a week, lower superfat and raise hard fats — do not only chase the discount.",
        },
      ],
    },
    {
      heading: "A harsh bar is not always low superfat",
      blocks: [
        {
          kind: "paragraph",
          text: "40% coconut at 5% superfat can still bite. The fix is often coconut down to 25% at the same 5%, not a jump to 12% superfat. Conversely, a 15% coconut bar at 8% superfat can feel slimy. Change one variable per test loaf. Write it on the tag or you will not remember which lever you pulled.",
        },
        {
          kind: "paragraph",
          text: "If two calculators disagree on NaOH by more than 2% on the same oils, pick one and stay there. The disagreement is the SAP table, not your scale. Mixing tables mid-batch is how a 5% superfat becomes an accident.",
        },
      ],
    },
  ],
  keyNumbers: [
    "Superfat 5% = use 95% of the 0%-SAP lye weight.",
    "Everyday body bar: 5–6%. Face or high-coconut: 6–8%. Laundry: 0–2%.",
    "One SAP table per batch. Tables are not identical.",
    "KOH batches use KOH math or the 1.403 conversion, not a pasted NaOH gram weight.",
    "Do not stack a full lye discount and a full at-trace oil add unless you want a double superfat.",
  ],
};

const cureTime: Guide = {
  slug: "soap-cure-time",
  title: "Soap Cure Time: Why 4 to 6 Weeks Is Not Optional",
  description:
    "What happens during a 4–6 week cure — water loss, hardness, and pH — and how to rack bars so they actually dry.",
  kicker: "Process",
  tags: ["cure", "cold-process", "pH", "water-discount"],
  published: "2026-09-23",
  intro: [
    "A cold-process bar is soap within a day or two. It is not a finished bar. The extra weeks are water leaving and the crystal structure of the soap tightening. Skip them and you get a sloppy, short-lived bar that can still nip the skin.",
    "Four to six weeks is the working rule for a standard CP loaf at 30–38% water as a percent of oils. It is not folklore.",
  ],
  sections: [
    {
      heading: "What is actually changing",
      blocks: [
        {
          kind: "paragraph",
          text: "**Water weight.** A 1000 g oil batch at 33% water started with 330 g water. A large share of that is still in the loaf at 48 hours. Over four weeks in moving air the bar can lose 10–18% of its cut weight, sometimes more in a dry house. That loss is why a 4.5 oz cut becomes a 4.0 oz seller.",
        },
        {
          kind: "paragraph",
          text: "Weigh a marked bar on day 2, day 14, and day 28. When the weekly loss drops under 1–2 grams, the easy water is gone. That is a better \"done\" signal than a calendar alone.",
        },
        {
          kind: "paragraph",
          text: "**Hardness.** As water leaves, the soap phase packs. A high-olive loaf that drooped on day 3 will slice cleanly on day 10 and feel like a bar on day 35. Hard-fat recipes get there sooner. They still benefit from the full wait.",
        },
        {
          kind: "paragraph",
          text: "**pH and leftover alkali.** A well-calculated 5% superfat bar is not \"full of lye\" at 48 hours, but the paste is still finishing and the surface pH reads high on cheap strips. Phenol red and tap-water strips are blunt instruments. They can read 9–10 on a perfectly good six-week bar. Use them to catch a genuine lye-heavy disaster (slippery, zingy, stripe-burning), not to chase a 7.0 fantasy. Finished soap is alkaline. That is the chemistry.",
        },
        {
          kind: "paragraph",
          text: "Zing on the tongue at week 6 means the batch was lye-heavy. Do not sell it. Recheck the scale, the SAP table, and whether anyone used grams on one ingredient and ounces on another.",
        },
      ],
    },
    {
      heading: "Rack setup that lets water leave",
      blocks: [
        {
          kind: "list",
          items: [
            "Cut bars so air hits at least two faces. A loaf left uncut in the mold is not curing. It is sitting.",
            "Space 1/2–1 inch between bars on a slatted rack or a cardboard tray with holes.",
            "Flip once a week for the first three weeks.",
            "Room: 60–75°F, 40–60% RH, moving air. A closet with no airflow is a mold farm. A dehumidifier in a basement helps. Direct sun fades color and can sweat fragrance.",
            "Do not cure in a sealed plastic bin. A paperboard box with the lid cracked is fine for dust.",
          ],
        },
        {
          kind: "paragraph",
          text: "A ceiling fan on low across a baker's rack is the whole infrastructure most home batches need.",
        },
      ],
    },
    {
      heading: "Water discount is not a substitute for time",
      blocks: [
        {
          kind: "paragraph",
          text: "Dropping water to 25–28% of oils (a heavier water discount) makes a faster unmold and a slightly faster firm-up. It does not make a 7-day bar equal a 5-week bar. The crystal structure still wants weeks. Discounted-water CP can also trace faster and seize. Treat it as a process choice, not a cure hack.",
        },
        {
          kind: "paragraph",
          text: "Hot process finishes the reaction in the pot. It still sheds water in the rack. Two weeks is a minimum honest HP test; four is better if the recipe used full water.",
        },
      ],
    },
    {
      heading: "When you can test",
      blocks: [
        {
          kind: "paragraph",
          text: "Day 2–3: cut quality, swirl, whether the loaf held.",
        },
        {
          kind: "paragraph",
          text: "Day 7–10: first wash on your own hands, not a customer's. Judge harshness only loosely.",
        },
        {
          kind: "paragraph",
          text: "Day 28–42: hardness in the dish, scent, and whether you would sell it.",
        },
        {
          kind: "paragraph",
          text: "If a bar still weeps or feels chilled-damp in the center at day 28, give it two more weeks and check the rack airflow.",
        },
      ],
    },
    {
      heading: "What week 2 vs week 6 feels like in the dish",
      blocks: [
        {
          kind: "paragraph",
          text: "Week 2: the bar smears a little on the soap dish, lather is big then collapses, the bar looks swollen. Week 6: the same recipe squeaks less, lather is tighter, the bar wears down instead of melting into a pancake. If week 6 still smears, airflow was poor or the recipe is short on palmitic and stearic acids. Raise tallow or cocoa 5 points next time rather than adding two more weeks forever.",
        },
        {
          kind: "paragraph",
          text: "Sell by the week-6 weight, not the day-2 cut weight. If you need a 4.5 oz bar in the shop, cut 5.1–5.3 oz on day 2 for a typical 33% water recipe in a 40–50% RH room. Weigh once and write the rule on the cutter board.",
        },
      ],
    },
  ],
  keyNumbers: [
    "CP cure: 4–6 weeks at 60–75°F with airflow.",
    "Expect 10–18% weight loss from day-2 cut weight.",
    "Flip weekly for three weeks; 1/2–1 in between bars.",
    "pH strips will still read alkaline on a good bar; use zing and math to catch lye-heavy batches.",
    "Water discount speeds unmold, not a full cure.",
  ],
};

const balmBasics: Guide = {
  slug: "balm-formulation-basics",
  title: "Balm Formulation Basics: Wax-to-Butter-to-Oil Ratios",
  description:
    "Starting ratios for jar balms and stick balms, and how beeswax vs candelilla or berry wax changes the set.",
  kicker: "Anhydrous",
  tags: ["balm", "beeswax", "candelilla", "ratios"],
  published: "2026-09-23",
  intro: [
    "A balm is wax plus butter plus liquid oil, melted and poured. No lye. The ratio decides whether you get a scoopable jar, a draggy stick, or a puddle in July.",
    "Work in percentages of the total batch. A 100 g test is enough to learn a formula before you scale to 1 kg.",
  ],
  sections: [
    {
      heading: "Three starting frames",
      blocks: [
        {
          kind: "table",
          headers: ["Style", "Wax", "Butter", "Liquid oil", "Texture at 72°F"],
          rows: [
            ["Soft jar balm / body butter-leaning", "12–18%", "25–40%", "45–60%", "Finger scoops; melts on skin in 3–5 seconds"],
            ["Firm jar balm", "18–22%", "25–35%", "45–55%", "Needs a firm press; holds in a warm car better"],
            ["Stick / lip balm", "20–30%", "10–25%", "50–65%", "Pushes from a tube without collapsing at 75°F"],
          ],
        },
        {
          kind: "paragraph",
          text: "A classic lip-balm starting point: 25% beeswax, 25% shea or cocoa butter, 50% liquid oil (almond, jojoba, or olive).",
        },
        {
          kind: "paragraph",
          text: "A classic skin-salve starting point: 16% beeswax, 30% shea, 54% olive.",
        },
        {
          kind: "paragraph",
          text: "These are not law. They are the middle of the lane. Move wax up 2 points if summer turns the jar to soup. Move wax down 2 points if the stick drags or pills.",
        },
      ],
    },
    {
      heading: "Beeswax vs plant waxes",
      blocks: [
        {
          kind: "paragraph",
          text: "**Beeswax.** The default. Tacky, plastic, forgiving. A 20% beeswax stick is usually stable at room temp. Beeswax smells like beeswax unless you over-fragrance.",
        },
        {
          kind: "paragraph",
          text: "**Candelilla.** Plant wax, harder and glossier than beeswax. Use about 70–80% of the beeswax weight as a starting swap — 20% beeswax ≈ 14–16% candelilla — then test. Too much candelilla is brittle and shiny in a way some people read as \"cheap lipstick.\"",
        },
        {
          kind: "paragraph",
          text: "**Carnauba.** Even harder. Rarely used alone in a skin balm. 2–5% of the batch can raise melt point if you already have beeswax.",
        },
        {
          kind: "paragraph",
          text: "**Berry wax / rice bran wax.** Softer, creamier, lower melt. They do not replace beeswax 1:1 in a stick. Better in a jar formula at 10–16%.",
        },
        {
          kind: "paragraph",
          text: "Always remelt and adjust from a written formula. Adding shaved wax to a poured tin and hoping it dissolves evenly is how you get grit.",
        },
      ],
    },
    {
      heading: "Butters",
      blocks: [
        {
          kind: "list",
          items: [
            "Shea: creamy, slight grain risk if you cool it very slowly through 85–90°F. Cool faster in the fridge 10–15 minutes if graininess has shown up before.",
            "Cocoa: hard, chocolate snap, raises the set. Excellent in sticks at 10–20%.",
            "Mango: in between. Cleaner odor than shea for some noses.",
            "Tallow or lard as the \"butter\": valid, firm, mild. Treat like 20–35% of a jar formula.",
          ],
        },
        {
          kind: "paragraph",
          text: "Butters are not oils. If you replace 20% shea with 20% almond oil, you just made a softer product. Recalculate the frame.",
        },
      ],
    },
    {
      heading: "Liquid oils",
      blocks: [
        {
          kind: "paragraph",
          text: "Stable oils first: jojoba, meadowfoam, olive, avocado, high-oleic sunflower. High-linoleic sunflower and rosehip are fine at 5–10% for feel, not as the entire oil phase, if the jar must last a year.",
        },
        {
          kind: "paragraph",
          text: "Antioxidant: mixed tocopherols at 0.5% of the batch is a common insurance policy. It is not a license to use rancid oil.",
        },
      ],
    },
    {
      heading: "Process",
      blocks: [
        {
          kind: "ordered",
          items: [
            "Weigh wax and butter into a pour pot. Melt at 160–175°F. Do not fry it at a rolling boil.",
            "Add liquid oils. Return to a uniform 160°F.",
            "Off heat. Add tocopherol, then essential oil or flavor oil at the supplier's maximum, typically 0.5–2% for skin balms, inside IFRA if it is a leave-on lip product.",
            "Pour at 140–160°F into tins or tubes.",
            "Cool undisturbed. Tubes stand upright.",
          ],
        },
        {
          kind: "paragraph",
          text: "A 100 g test that is slightly soft is easier to read than a 1 kg batch you have to chip out of eight tins.",
        },
      ],
    },
    {
      heading: "A worked 100 g firm jar",
      blocks: [
        {
          kind: "list",
          items: [
            "Beeswax: 20 g",
            "Shea: 30 g",
            "Olive oil: 49.5 g",
            "Mixed tocopherols: 0.5 g",
          ],
        },
        {
          kind: "paragraph",
          text: "If it is too firm at 72°F, recast with 18 g wax and 51.5 g olive. If it slumps at 80°F, 22 g wax and 47.5 g olive.",
        },
      ],
    },
    {
      heading: "Summer vs winter recast",
      blocks: [
        {
          kind: "paragraph",
          text: "The 20/30/50 jar that is perfect in January will slump in a 88°F stall. Recast a summer version at 23/28/49 and keep winter at 18/32/50. Label the tin with the ratio. Customers who leave a tin in a truck will still write to you; the summer ratio is what you can defend.",
        },
        {
          kind: "paragraph",
          text: "Date every tin. A high-oleic formula should smell clean at 12 months. If it smells like crayons at month 4, the liquid oil was the problem, not the wax ratio. Change the oil phase before you change the wax again.",
        },
      ],
    },
  ],
  keyNumbers: [
    "Soft jar: 12–18% wax. Firm jar: 18–22%. Stick: 20–30%.",
    "Candelilla ≈ 70–80% of the beeswax weight it replaces.",
    "Melt 160–175°F; pour 140–160°F.",
    "Test in 100 g batches; move wax in 2-point steps.",
    "Tocopherols ~0.5%; keep high-linoleic oils as a minority of the oil phase.",
  ],
};

export const GUIDE_DATABASE: Guide[] = [
  lyeSafety,
  readingAnOil,
  coldVsHot,
  superfatting,
  cureTime,
  balmBasics,
];

export function getGuideBySlug(slug: string): Guide | undefined {
  return GUIDE_DATABASE.find((guide) => guide.slug === slug);
}
