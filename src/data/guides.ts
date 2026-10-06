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

const dualLye: Guide = {
  slug: "dual-lye-soap",
  title: "Dual Lye Soap Recipe: NaOH and KOH Blends",
  description:
    "Dual lye soap recipe basics: why blend NaOH and KOH, where a 95/5 split earns its keep, and how the SAP math divides.",
  kicker: "Formulation",
  tags: ["dual-lye", "NaOH", "KOH", "shaving-soap", "formulation"],
  published: "2026-10-05",
  intro: [
    "A dual-lye soap uses sodium hydroxide and potassium hydroxide in the same batch. NaOH builds the hard bar. KOH builds solubility. The blend is a texture tool, not a second recipe.",
  ],
  sections: [
    {
      heading: "Before you measure lye",
      accent: "warning",
      blocks: [
        {
          kind: "list",
          items: [
            "Goggles, chemical-resistant gloves, and long sleeves before the lye lid opens.",
            "Work with air moving — a window fan pulling vapor away is enough for most home batches.",
            "Add lye to water, never water to lye.",
            "No aluminum pots or utensils; lye attacks them.",
            "Flush any splash with running water. Vinegar is not a bench neutralizer.",
          ],
        },
      ],
    },
    {
      heading: "Why blend at all",
      blocks: [
        {
          kind: "paragraph",
          text: "Sodium soaps of the common bar fats are solid at room temperature. They stack into a firm lattice. That is the bar you can stamp and ship.",
        },
        {
          kind: "paragraph",
          text: "Potassium soaps of the same fats are softer and more soluble. Pure KOH and a high water phase is liquid soap. Used as a minority share in a bar, KOH does not liquefy the batch. It loosens the lattice. The bar wets faster, lather starts sooner, and the feel moves toward cream rather than tight bubbles.",
        },
        {
          kind: "paragraph",
          text: "Shaving soaps exploited this first. A face lather needs to load a brush and stay slick. A pure NaOH bar can be too stubborn unless the formula is already heavy in stearic acid and clay. A little KOH fixes the solubility without giving up the puck.",
        },
      ],
    },
    {
      heading: "The 95/5 classic, and where it actually matters",
      blocks: [
        {
          kind: "paragraph",
          text: "The working classic is 95% of the alkali as NaOH and 5% as KOH, counted on neutralization demand — not by tossing 5 grams of each into the cup. KOH is a heavier molecule. The same neutralizing power takes more grams of KOH than of NaOH. A calculator has to convert SAP, then split.",
        },
        {
          kind: "paragraph",
          text: "Five percent KOH is enough to change how a shaving puck drinks water. It is often enough in a bath bar that feels slow to lather: high tallow, high palm, high stearic. It is not a rescue for a recipe that is mostly soft oils. Those bars are already soluble. Extra KOH makes them smear.",
        },
        {
          kind: "paragraph",
          text: "Go higher — 10%, occasionally 15% in a shaving formula — only when you have already raised stearic acid or hard butters and the puck still will not load. Above that, you are making a soft soap and calling it a bar. Cream soaps and shave pastes live in that range on purpose. Stamped bars do not.",
        },
        {
          kind: "paragraph",
          text: "Dual-lye is fussiness when the goal is a swirl-friendly cold-process bath bar with ordinary coconut, olive, and a hard oil. NaOH alone will do that job. Add KOH and you add a second weigh, a second SAP path, and a softer cure, for a difference most users will not notice in the shower.",
        },
      ],
    },
    {
      heading: "How the split SAP math works",
      blocks: [
        {
          kind: "paragraph",
          text: "Each oil has a NaOH SAP and a KOH SAP. The KOH figure is the NaOH figure scaled by the ratio of the two molar masses. You do not average the two alkalis and multiply once.",
        },
        { kind: "paragraph", text: "The sequence is fixed." },
        {
          kind: "ordered",
          items: [
            "Total the NaOH demand from every oil.",
            "Apply superfat to that total.",
            "Split the remaining alkali by the ratio you chose.",
            "Convert the KOH share from NaOH-equivalent grams into actual KOH grams.",
            "Weigh the two alkalis separately. Dissolve them in the same water phase unless you have a reason not to.",
          ],
        },
        {
          kind: "paragraph",
          text: "Skip the conversion and the batch is lye-heavy or lye-light by the amount of the error. That is the whole case for a calculator. Hand charts that list \"5% KOH\" as a spoon measure are not charts. They are guesses.",
        },
        {
          kind: "paragraph",
          text: "Superfat still applies once, to the combined alkali demand. Do not discount NaOH and then discount KOH again. Water is set for the full lye solution, not for each alkali on its own.",
        },
      ],
    },
    {
      heading: "What changes on the bench",
      blocks: [
        {
          kind: "paragraph",
          text: "Trace can look different. KOH soaps thicken on their own timeline, and a dual-lye batch sometimes moves faster than the same oils on NaOH alone. Plan swirls with that in mind, or skip them.",
        },
        {
          kind: "paragraph",
          text: "The cure is still a water-loss cure. A dual-lye bar can feel done sooner in the hand and still be wet in the middle. Give it the same weeks you would give the NaOH version. High-olive dual-lye bars need the long cure, not a pass.",
        },
        {
          kind: "paragraph",
          text: "Labels change. The saponified portion lists both sodium and potassium salts of the oils — Sodium Olivate and Potassium Olivate, and the rest of the pair. Free oil from superfat stays in the INCI as the oil name. A calculator that already emits INCI for NaOH or KOH should emit the blend without a second naming pass.",
        },
        {
          kind: "paragraph",
          text: "Set the ratio, then read both lye lines before you open either container. The Saponis soap bench (/soap) runs the split SAP math for NaOH, KOH, or a blend, and keeps superfat as a single discount.",
        },
        {
          kind: "paragraph",
          text: "Write the ratio on the batch note as percent NaOH / percent KOH. Weigh each alkali to 0.1 g. The blend is only as precise as the second number on the scale.",
        },
      ],
    },
  ],
  keyNumbers: [
    "95/5 NaOH/KOH is counted on neutralization demand, not spoon measures.",
    "Superfat applies once, to the combined alkali — never discount twice.",
    "KOH share converts from NaOH-equivalent grams; the engine uses per-oil KOH SAP values.",
    "Write the ratio on the batch note; weigh each alkali to 0.1 g.",
  ],
};

const sapValues: Guide = {
  slug: "sap-values-explained",
  title: "SAP Value Chart for Soap Making: What SAP Value Means",
  description:
    "What a SAP value is, why a soap making SAP chart is only a start, and a worked NaOH example you can check by hand.",
  kicker: "Formulation",
  tags: ["SAP", "lye", "formulation", "calculator"],
  published: "2026-10-05",
  intro: [
    "A SAP value is the conversion factor between a fat and the alkali that fat can consume. Every oil needs a different amount of lye. The SAP value is why.",
  ],
  sections: [
    {
      heading: "Before you measure lye",
      accent: "warning",
      blocks: [
        {
          kind: "list",
          items: [
            "Goggles, chemical-resistant gloves, and long sleeves before the lye lid opens.",
            "Work with air moving — a window fan pulling vapor away is enough for most home batches.",
            "Add lye to water, never water to lye.",
            "No aluminum pots or utensils; lye attacks them.",
            "Flush any splash with running water. Vinegar is not a bench neutralizer.",
          ],
        },
      ],
    },
    {
      heading: "What the number is",
      blocks: [
        {
          kind: "paragraph",
          text: "Classic lab SAP is milligrams of potassium hydroxide to saponify one gram of fat. Soap calculators store the practical form: grams of NaOH per gram of oil. A KOH SAP is the same relationship expressed for potassium hydroxide.",
        },
        {
          kind: "paragraph",
          text: "The number moves because fats are not one molecule. Coconut is rich in shorter chains. Olive is mostly oleic. Tallow sits in between, and its SAP moves with the animal and the trim. A published chart is an average of a defined crop or render, not a universal constant.",
        },
        {
          kind: "paragraph",
          text: "Use the figure that matches the alkali in the cup. A NaOH SAP fed into a KOH batch is a lye-light error. The reverse is lye-heavy.",
        },
      ],
    },
    {
      heading: "A worked example, one oil",
      blocks: [
        {
          kind: "paragraph",
          text: "Take coconut oil (76°) as the single fat. Its NaOH SAP on the Saponis oil sheet is 0.183 g of NaOH per gram of oil.",
        },
        {
          kind: "list",
          items: [
            "100 g of that oil, at zero superfat, calls for 18.3 g of NaOH.",
            "A 5% superfat withholds 5% of that alkali: 18.3 × 0.95 = 17.385 g of NaOH.",
          ],
        },
        {
          kind: "paragraph",
          text: "The oil weight does not change. Only the alkali does. Add a second oil and you do not average the SAP values by vibe. You multiply each oil's weight by its own SAP, sum the lye, then apply superfat once.",
        },
        {
          kind: "paragraph",
          text: "That is the whole chart. Rows are oils. Columns are discounts. A blend is a sum down the column, not a new SAP invented for the recipe.",
        },
      ],
    },
    {
      heading: "Why the chart is not optional — and not enough",
      blocks: [
        {
          kind: "paragraph",
          text: "Eyeballing is how lye-heavy soap happens. \"About the same as last time\" fails when the olive percentage moved, the coconut was a different grade, or the batch was scaled to a new mold and the water was scaled but the lye was copied.",
        },
        {
          kind: "paragraph",
          text: "A stale chart fails more quietly. SAP tables in old books disagree with each other in the third decimal. That digit is tenths of a gram on a small batch and grams on a production slab. Enough to zap. Enough to soften.",
        },
        {
          kind: "paragraph",
          text: "A calculator is the chart kept current: one verified SAP per fat, NaOH and KOH both available, superfat applied after the sum. It also refuses the silent error of a 100% sum that is actually 98% because of a typed weight.",
        },
      ],
    },
    {
      heading: "What SAP does not tell you",
      blocks: [
        {
          kind: "paragraph",
          text: "SAP does not tell you hardness, lather, or a recommended maximum. Those come from the fatty-acid split — lauric, myristic, palmitic, stearic, oleic, and the rest — and from practice. An oil can have a modest SAP and still be a poor idea at 40% of the blend.",
        },
        {
          kind: "paragraph",
          text: "SAP does not include the superfat. If you look up a chart value and weigh that lye, you have chosen 0% superfat whether you meant to or not.",
        },
        {
          kind: "paragraph",
          text: "SAP does not know your water. Water is a solvent and a temperature sink. It is not part of the saponification ratio. Discount water for a harder pour. Do not discount lye to make the batch thicker.",
        },
      ],
    },
    {
      heading: "From one oil to a real batch",
      blocks: [
        {
          kind: "paragraph",
          text: "Build the formula as weights of fats. Confirm the weights sum to the oil phase you intend. Read each SAP. Multiply. Sum. Apply one superfat. Round the lye to the precision of the scale — 0.1 g is the useful floor on a home batch under a kilogram.",
        },
        {
          kind: "paragraph",
          text: "Then stop editing. Changing an oil after the lye is weighed is how the SAP work gets thrown out.",
        },
        {
          kind: "paragraph",
          text: "Check a single-oil example against the library before you trust a new tool. The Saponis soap bench (/soap) stores a verified SAP for each of 22 fats and butters, and runs NaOH, KOH, or a dual-lye blend from those figures.",
        },
        {
          kind: "paragraph",
          text: "If the hand product and the calculator disagree, believe neither until you find the rounding. The scale will not arbitrate a math error.",
        },
      ],
    },
  ],
  keyNumbers: [
    "SAP = grams of alkali per gram of oil. Match the SAP to the alkali in the cup.",
    "Coconut (76°) NaOH SAP 0.183: 100 g oil → 18.3 g NaOH at 0%; 17.385 g at 5% superfat.",
    "Blend math: each oil × its own SAP, sum, then one superfat. Never average SAPs.",
    "One SAP table per batch. Tables disagree in the third decimal — enough to matter.",
    "SAP covers the lye, not the water, hardness, or lather.",
  ],
};

const grainyBalm: Guide = {
  slug: "grainy-balm-fix",
  title: "Why Is My Lip Balm Grainy",
  description:
    "Why lip balm goes grainy, the fast-cool fix, and the melt-and-reset rescue for a grainy salve. Ratio first.",
  kicker: "Anhydrous",
  tags: ["balm", "graininess", "beeswax", "troubleshooting"],
  published: "2026-10-05",
  intro: [
    "Graininess is crystal structure. The balm set, then the butter re-crystallized into particles large enough to feel. It is not spoilage. It is not grit from a dirty beaker, unless you can see wax specks that never melted.",
  ],
  sections: [
    {
      heading: "What the grain actually is",
      blocks: [
        {
          kind: "paragraph",
          text: "Butters are triglycerides. As they cool they choose a crystal form. Cocoa butter is the notorious case. It has several polymorphs. One is smooth and stable. The others are soft, unstable, and coarse. Cool cocoa butter slowly and it often lands in a grainy form. Days later it can bloom into a sandy texture even if it looked fine at the pour.",
        },
        {
          kind: "paragraph",
          text: "Shea butter does this too, especially unrefined shea with a broad melt range. Mango and kokum are calmer. They are not immune. Any butter cooled through its set point without a plan can throw crystals.",
        },
        {
          kind: "paragraph",
          text: "Wax is the other half. Beeswax, candelilla, and carnauba set a network that traps oil. A strong enough wax network limits how far butter crystals can grow. A weak network lets them migrate. That is why two recipes with the same cocoa percentage do not grain equally.",
        },
      ],
    },
    {
      heading: "The fast-cool fix",
      blocks: [
        {
          kind: "paragraph",
          text: "Melt the phase completely. Cocoa butter should be fully clear, not cloudy, and past the point where streaks remain — hold it there briefly so the last crystal memory is gone. Pour at a temperature where the mix is still fluid but not so hot that the tin stays warm for an hour.",
        },
        {
          kind: "paragraph",
          text: "Then cool it fast. A counter is slow. A fridge is faster. A freezer is faster still, for small tins. The goal is many small crystals instead of a few large ones. Move the tins in one layer, not stacked. Pull them when the surface is set and the tin is cold, not when you remember them the next day.",
        },
        {
          kind: "paragraph",
          text: "Room-temperature pouring into a warm mold is the usual way to grow the grain. Holiday batches left to cool in a closed oven are the same mistake with a door.",
        },
      ],
    },
    {
      heading: "The melt-and-reset rescue",
      blocks: [
        {
          kind: "paragraph",
          text: "A grainy tin can be saved. Scrape it back into the beaker. Remelt until every grain is gone and the phase is clear. Do not stop at \"mostly smooth.\" A surviving crystal seeds the next set.",
        },
        {
          kind: "paragraph",
          text: "Cool fast, as above. If the same tin grains again, the ratio is wrong for that butter, not the cooling alone. Add wax, or cut the butter with a liquid oil, and reset. Do not keep remelting a formula that wants to grain. Heat cycles tire fragrance and can darken butters.",
        },
        {
          kind: "paragraph",
          text: "Stirring hard as the mix turns hazy is a third trick used on shea-heavy salves. It works until it incorporates air. Fast cooling is cleaner.",
        },
      ],
    },
    {
      heading: "How ratio discipline prevents it",
      blocks: [
        {
          kind: "paragraph",
          text: "Grain shows up when butter outruns the wax-and-oil system. A lip balm that is mostly cocoa or shea, with beeswax at a token percent, will grain no matter how heroic the freezer. A salve with a real wax share and a defined liquid-oil share has less free butter to recrystallize.",
        },
        {
          kind: "paragraph",
          text: "Write the formula as three buckets: wax, butter, liquid oil. Keep the butter share inside what that wax can lock. Cocoa is the one to cap first. Shea is second. Liquid oils (jojoba, sweet almond, fractionated coconut) dilute the crystal formers without softening the set the way extra butter does.",
        },
        {
          kind: "paragraph",
          text: "Temperature discipline belongs in the same note. Melt temperature. Pour temperature. Cool method. A grainy batch with no temperatures written down cannot be diagnosed. It can only be remelted.",
        },
        {
          kind: "paragraph",
          text: "Add-ins make it worse if they are cold. A spoon of room-temperature powder or a cold essential oil dumped into a barely fluid phase can seed crystals. Warm the oil. Disperse powders in a portion of the melt.",
        },
        {
          kind: "paragraph",
          text: "The bench version of this is a ratio check before the first melt, plus a graininess flag when the butter share is high for the wax. The Saponis balms bench (/balms) is built for that wax-to-butter-to-liquid balance, and for a heads-up before the batch sets coarse.",
        },
        {
          kind: "paragraph",
          text: "If the reset tin is smooth and the original was not, keep the cooling method and change nothing else. The chemistry was already fine.",
        },
      ],
    },
  ],
  keyNumbers: [
    "Grain is crystal structure, not spoilage.",
    "Melt fully clear — a surviving crystal seeds the next set.",
    "Cool fast: one layer, pull when set and cold.",
    "If it grains twice, the ratio is wrong — add wax or cut the butter.",
    "Write down melt temp, pour temp, and cool method or you cannot diagnose it.",
  ],
};

const waterDiscount: Guide = {
  slug: "water-discount",
  title: "Water Discount in Cold Process Soap",
  description:
    "Water discount in cold process soap — how lye concentration changes trace speed, hardness, and cure time.",
  kicker: "Formulation",
  tags: ["water-discount", "lye-concentration", "cold-process", "formulation"],
  published: "2026-10-05",
  intro: [
    "Lye concentration is the share of alkali in the solution you pour into the oils. Water discount is the decision to use less water than a full-water batch. Same oils. Same superfat. Less water to evaporate later, and less time while the batter is fluid.",
    "Full water, a standard working strength, and a true water discount are three points on that line. The oils do not care which you pick. Trace speed and cure do.",
  ],
  sections: [
    {
      heading: "Before you measure lye",
      accent: "warning",
      blocks: [
        {
          kind: "list",
          items: [
            "Goggles, chemical-resistant gloves, and long sleeves before the lye lid opens.",
            "Work with air moving — a window fan pulling vapor away is enough for most home batches.",
            "Add lye to the water, never water to lye.",
            "No aluminum pots or utensils; lye attacks them.",
            "Flush any splash with running water. Vinegar is not a bench neutralizer.",
          ],
        },
      ],
    },
    {
      heading: "What the number actually is",
      blocks: [
        {
          kind: "paragraph",
          text: "Lye concentration is alkali weight divided by alkali weight plus water weight. A higher percent means a stronger solution and less water in the pot. It is not a second superfat, and it does not change how much lye the oils require. The alkali dose comes from the SAP values and the superfat you set. Water only decides how that dose is dissolved.",
        },
      ],
    },
    {
      heading: "Full water",
      blocks: [
        {
          kind: "paragraph",
          text: "Full water is the older, wetter batch. The solution is milder. The batter stays fluid longer. Swirls and slow layers get a wider window, especially in a recipe that already wants to move.",
        },
        {
          kind: "paragraph",
          text: "The cost shows up after the cut. Extra water has to leave the bar. Bars stay softer for longer. Cure still has to finish saponification and mellow the soap; a wetter start simply adds drying time on top of that. Full water is the right call when the design needs time, or when you are learning a new oil blend and do not want the clock running fast.",
        },
      ],
    },
    {
      heading: "A standard working strength",
      blocks: [
        {
          kind: "paragraph",
          text: "Most working batches sit between those extremes. Enough water that the lye dissolves cleanly and the batter can be poured. Little enough that the bars are not sodden in the mold. This is the default habit for a plain cold-process loaf: a usable fluid phase, then a bar that firms on a normal cure.",
        },
        {
          kind: "paragraph",
          text: "If a recipe neither sprints nor stalls, stay here. Chasing a harder bar by drying the solution is how a calm formula turns into a false emergency.",
        },
      ],
    },
    {
      heading: "Water-discounted",
      blocks: [
        {
          kind: "paragraph",
          text: "A water discount shortens the path from pour to a firm bar. Less free water remains after saponification, so the loaf hardens sooner and shrinks less in the cure. That is the point of the method, and it is a real one for makers who cut early or ship on a schedule.",
        },
        {
          kind: "paragraph",
          text: "The working window shrinks with it. Trace comes faster. A recipe that was polite at full water can hit medium trace while you are still stirring fragrance. Heat has less liquid to soak into, so gel is more likely if the mold is wrapped. Discounted water plus a fast oil — coconut, a butter, a floral that accelerates — is a short session. Plan the mold, the fragrance, and the swirl before the lye goes in.",
        },
        {
          kind: "paragraph",
          text: "Discounting does not replace cure. A harder bar at day three is not a finished bar. Saponification completes, excess alkali from a low superfat still needs time to settle, and scent still shifts. You have removed water. You have not removed weeks.",
        },
      ],
    },
    {
      heading: "What not to stack",
      blocks: [
        {
          kind: "paragraph",
          text: "Do not treat a water discount as a fix for a soft oil blend. Softness from a high liquid-oil recipe is a fatty-acid problem. Drying the lye solution firms the early bar and then leaves you with a soluble bar that melts fast in the shower. Fix the oils.",
        },
        {
          kind: "paragraph",
          text: "Do not discount so far that the lye will not dissolve, or that the solution sets up in the jug. Undissolved alkali in the batter is a lye pocket, not a harder bar. If the solution looks cloudy with grains, it is not ready. Add no oil until every grain is gone.",
        },
        {
          kind: "paragraph",
          text: "Hot process already cooks water off. A deep discount there is easy to overdo; the paste goes stiff before the cook is even. Cold process is where the discount earns its place.",
        },
        {
          kind: "paragraph",
          text: "Open the soap calculator at /soap, set the oils and the superfat, then set the water. Read the concentration before you commit. The alkali line should not move when you change only the water. If it does, something else changed.",
        },
      ],
    },
  ],
  keyNumbers: [
    "Lye concentration is alkali ÷ (alkali + water). It never changes the alkali dose.",
    "Full water buys working time and costs drying time.",
    "A discount firms the early bar but does not replace cure.",
    "Never discount past full lye dissolution — grains in the jug are lye pockets.",
    "Softness from liquid oils is a fatty-acid problem. Fix the oils, not the water.",
  ],
};

const formulateRecipe: Guide = {
  slug: "formulate-soap-recipe",
  title: "How to Formulate a Soap Recipe",
  description:
    "How to formulate a soap recipe: balance hardness, cleansing, bubbly lather, and conditioning in a short blend.",
  kicker: "Formulation",
  tags: ["formulation", "recipe-design", "fatty-acids", "cold-process"],
  published: "2026-10-05",
  intro: [
    "Reading an oil tells you what that fat will do. Formulating is the next step: choosing three to five oils so the bar is hard enough to last, mild enough to use, and able to lather in the kind of water you actually have. A recipe is a set of tradeoffs with the amounts written down. It is not a list of favorite bottles.",
  ],
  sections: [
    {
      heading: "Before you measure lye",
      accent: "warning",
      blocks: [
        {
          kind: "list",
          items: [
            "Goggles, chemical-resistant gloves, and long sleeves before the lye lid opens.",
            "Work with air moving — a window fan pulling vapor away is enough for most home batches.",
            "Add lye to water, never water to lye.",
            "No aluminum pots or utensils; lye attacks them.",
            "Flush any splash with running water. Vinegar is not a bench neutralizer.",
          ],
        },
      ],
    },
    {
      heading: "Why a short blend",
      blocks: [
        {
          kind: "paragraph",
          text: "Five oils can cover hardness, cleansing, cream, bubbles, and conditioning. A twelfth oil rarely adds a property the first five missed. It does make the next batch harder to repeat, and it muddies the lesson when something feels wrong.",
        },
        {
          kind: "paragraph",
          text: "Start with a job for each oil. One oil firms the bar. One oil does the cleaning and the fast bubbles. One oil conditions. A small share of a lather helper if the blend needs it. Stop when every job has an owner. If two oils do the same job, keep the one you can buy again.",
        },
      ],
    },
    {
      heading: "The pairs you are balancing",
      blocks: [
        {
          kind: "paragraph",
          text: "Hardness against solubility. Saturated fats and butters — tallow, lard, palm, cocoa butter, a measured share of shea — make a bar that holds its shape and lasts. Liquid oils keep it from turning into a brick that will not lather. A bar that is all hard fat feels dry and stubborn in the hand. A bar that is all liquid oil slicks away and needs a long cure just to be cut cleanly.",
        },
        {
          kind: "paragraph",
          text: "Cleansing against conditioning. The short saturated chains in coconut, palm kernel, and babassu are what make a bar feel like it is washing. They also strip if they dominate. Long unsaturated oils — olive, avocado, rice bran, high-oleic sunflower — leave the skin comfortable and slow the lather down. A cleansing bar with no conditioning oil is a laundry bar wearing a bathroom label. A conditioning bar with no cleansing oil is a castile: fine, and not what most people mean by soap.",
        },
        {
          kind: "paragraph",
          text: "Bubbly against creamy. Fast, open bubbles come from those same short saturates, plus a little castor if you want the lather to stretch. Cream comes from palmitic and stearic fats — the palm, the tallow, the cocoa butter. A bar can be bubbly and harsh, or creamy and quiet. The useful ones are both, in proportions you chose on purpose.",
        },
        {
          kind: "paragraph",
          text: "Solubility is the quiet fourth. A hard, low-solubility bar lasts and feels dead in cold water. A soft, high-solubility bar lathers fast and disappears. Match the blend to the water and the use. A face bar can afford more soluble oils than a shop bar that sits wet.",
        },
      ],
    },
    {
      heading: "What a single-oil soap is for",
      blocks: [
        {
          kind: "paragraph",
          text: "A 100 percent olive batch, a 100 percent coconut batch, and a 100 percent tallow batch are not recipes to sell. They are the controls. Olive alone is mild, slow to trace, and slow to lather. Coconut alone is hard, fast, and stripping. Tallow alone is firm, creamy, and quiet. Once you have felt the extreme, a blend is easier to read. You stop asking an oil to do a job it does not have.",
        },
        {
          kind: "paragraph",
          text: "Run those controls small. Label them as tests. The point is the shower, not the mold photo.",
        },
      ],
    },
    {
      heading: "Superfat is not the formula",
      blocks: [
        {
          kind: "paragraph",
          text: "Superfat is the oil left unsaponified after the lye is calculated. It buffers a harsh edge and adds a little slip. It will not rescue a blend that is mostly coconut, and it will not harden a blend that is mostly olive. Set it where you want the margin. Then fix the oils if the bar is wrong. Raising superfat to hide a bad ratio just makes a softer version of the same mistake.",
        },
        {
          kind: "paragraph",
          text: "Additives are last. Clay, salt, silk, and a spoon of butter on top do not rewrite the fatty-acid balance. Get the base honest before you decorate it.",
        },
      ],
    },
    {
      heading: "A workable order",
      blocks: [
        {
          kind: "paragraph",
          text: "Write the jobs. Assign an oil to each. Keep any single fast or stripping oil inside the range its spec sheet allows — the library marks those ceilings. Check the blend for the five qualities: hardness, cleansing, conditioning, bubbly lather, creamy lather. If cleansing is high and conditioning is thin, move weight from the coconut side to an oleic oil. If the bar will be soft, move weight toward a saturated fat, not toward a deeper water discount.",
        },
        {
          kind: "paragraph",
          text: "Then calculate. Open the soap calculator at /soap, enter the blend, and set the superfat. The lye line is the consequence of those choices. Change an oil, and read the lye again. Do not carry an old alkali number onto a new formula.",
        },
      ],
    },
  ],
  keyNumbers: [
    "Five oils cover the five jobs: hardness, cleansing, conditioning, bubbles, cream.",
    "Balance hardness vs. solubility, cleansing vs. conditioning, bubbly vs. creamy.",
    "Single-oil batches are controls, not recipes — feel the extremes first.",
    "Superfat buffers; it does not fix a bad oil ratio.",
    "Every oil change means a fresh lye calculation. Never carry the old number.",
  ],
};

const traceStages: Guide = {
  slug: "soap-trace-stages",
  title: "Soap Trace Stages: Light, Medium, and Heavy",
  description:
    "Soap trace stages: what light, medium, and heavy trace look like, and which technique each stage is for.",
  kicker: "Technique",
  tags: ["trace", "emulsion", "cold-process", "technique"],
  published: "2026-10-05",
  intro: [
    "Trace is the point where oils and lye solution have emulsified. The batter will not separate back into a slick of oil and a puddle of lye water. Thickness comes after that, from the recipe, the temperature, and how long you run the stick blender. A thin batter can already be at trace. A thick batter can be a false one.",
  ],
  sections: [
    {
      heading: "Before you measure lye",
      accent: "warning",
      blocks: [
        {
          kind: "list",
          items: [
            "Goggles, chemical-resistant gloves, and long sleeves before the lye lid opens.",
            "Work with air moving — a window fan pulling vapor away is enough for most home batches.",
            "Lye goes into water, never the reverse.",
            "No aluminum pots or utensils; lye attacks them.",
            "Flush any splash with running water. Vinegar is not a bench neutralizer.",
          ],
        },
      ],
    },
    {
      heading: "Emulsion first",
      blocks: [
        {
          kind: "paragraph",
          text: "Before trace, the mixture looks divided. Oil shines on top. Ribbons of lye solution sink and reappear. If you poured that, it would separate in the mold, and the bar would carry wet pockets of alkali. Stirring and short bursts of the blender bring it to one phase. That one phase is trace. Everything people call light, medium, or heavy is how far the emulsion has thickened past that point.",
        },
        {
          kind: "paragraph",
          text: "Judge it with the blender switched off. A running blender lies — it digs a trench through any batter. Lift it, wait a second, and look at the surface.",
        },
      ],
    },
    {
      heading: "Light trace",
      blocks: [
        {
          kind: "paragraph",
          text: "Light trace is a thin trail across the surface that sinks back in. The batter pours like a heavy cream. Drizzle from the blender disappears. This is the stage for swirls, drops, and any design that has to move in the mold after the pour.",
        },
        {
          kind: "paragraph",
          text: "It is also the right stage to add a fragrance that tends to accelerate, if you have not already added it. You want the emulsion secure and the batter still fluid. Light trace is a short visit in a fast recipe. Treat it as a decision point, not a place to linger.",
        },
      ],
    },
    {
      heading: "Medium trace",
      blocks: [
        {
          kind: "paragraph",
          text: "Medium trace leaves a trail that sits. The batter mounds a little and levels slowly. It will still pour, but it will not travel far into a fine swirl. This is the stage for layers, a textured top, and suspending something light — a line of herb, a thin embed — that should stay where you put it.",
        },
        {
          kind: "paragraph",
          text: "Many plain loaves are poured here, without a design at all. Medium is enough emulsion to trust and enough body to fill a mold without a watery cap of oil. If you only need a clean cut bar, you do not need to push past it.",
        },
      ],
    },
    {
      heading: "Heavy trace",
      blocks: [
        {
          kind: "paragraph",
          text: "Heavy trace holds a peak. It looks like thick pudding and spoons rather than pours. Use it when the batter must not move: a heavy embed pressed into the top, a spooned rustic loaf, a layer that has to stay put under the next color. It is the wrong stage for a swirl. The pattern will break into lumps.",
        },
        {
          kind: "paragraph",
          text: "Heavy trace is also where a hot, fast recipe arrives whether you wanted it or not. If you meant to swirl and you are already here, stop. Spoon it in. A clean rustic bar is better than a seized lump you tried to paint with.",
        },
      ],
    },
    {
      heading: "False trace",
      blocks: [
        {
          kind: "paragraph",
          text: "Cool hard oils thicken before they have emulsified. The batter looks like medium trace, then warms in the mold and splits. That is false trace. The usual cause is oils that were not fully melted, or a soaping temperature low enough to re-solidify a butter or a wax. Warm the oils until they are clear, hold them there, and test again. A true emulsion stays one phase as it sits. A false one weeps oil.",
        },
      ],
    },
    {
      heading: "Staying at light when the recipe wants to sprint",
      blocks: [
        {
          kind: "paragraph",
          text: "Fast trace comes from heat, from a long run of the stick blender, and from oils and additives that accelerate. Coconut, butters, beeswax, honey, beer, and some florals and spice oils all shorten the window. You can keep a sprinting recipe at light trace if you decide to before you mix.",
        },
        {
          kind: "paragraph",
          text: "Melt hard oils fully, then let the batter temperature sit moderate rather than warm. Hand-stir to a loose combination. Use the stick blender in short bursts — a few seconds, then a rest — and watch the surface with the motor off. Have fragrance, color, and the mold ready before the lye solution goes in. Add a known accelerator at the last moment, into an emulsion that is only just there. If the recipe is built to race, do not also insulate the mold and expect a fluid pour.",
        },
        {
          kind: "paragraph",
          text: "Trace is a tool. Light for movement. Medium for structure. Heavy for anything that has to stay. Name the stage you need before you start the blender, and stop when you have it. If the recipe is still on paper, open the soap calculator at /soap and settle the oils first — a fast blend will not give you light trace just because you stirred gently.",
        },
      ],
    },
  ],
  keyNumbers: [
    "Trace is emulsification, not thickness. A thin batter can already be at trace.",
    "Judge with the blender off — a running blender digs a trench through anything.",
    "Light for swirls, medium for layers, heavy for spooned rustic loaves.",
    "False trace: cool butters thicken before they emulsify, then split in the mold.",
    "Fast recipes need a plan before the lye goes in, not heroics after.",
  ],
};

const goatMilkSoap: Guide = {
  slug: "goat-milk-soap",
  title: "Goat Milk Soap, Cold Process",
  description:
    "Goat milk soap, cold process: frozen milk, low heat, no insulation, and what the milk adds to the bar.",
  kicker: "Technique",
  tags: ["goat-milk", "milk-soap", "cold-process", "technique"],
  published: "2026-10-05",
  intro: [
    "Goat milk soap is cold process with the water replaced by milk, in part or in full. The lye math does not change because the liquid is milk. The session does. Milk carries sugars. Sugars speed trace and feed heat. A milk batch that would have been calm in water can gel hard enough to volcano if you treat it like a plain loaf.",
  ],
  sections: [
    {
      heading: "Before you measure lye",
      accent: "warning",
      blocks: [
        {
          kind: "list",
          items: [
            "Goggles, chemical-resistant gloves, and long sleeves before the lye lid opens.",
            "Work with air moving — a window fan pulling vapor away is enough for most home batches.",
            "Lye goes into the milk, never milk poured onto dry lye.",
            "No aluminum pots or utensils; lye attacks them.",
            "Flush any splash with running water. Vinegar is not a bench neutralizer.",
          ],
        },
      ],
    },
    {
      heading: "What the milk actually adds",
      blocks: [
        {
          kind: "paragraph",
          text: "Goat milk brings water, a little fat, protein, lactose, and lactic acid. The fat is a small share of a typical batch. It will not firm the bar the way tallow or cocoa butter will. The proteins and sugars are why the bar feels creamier and why the color moves if the soap gels. Lactic acid binds a little alkali, so a milk bar can feel slightly milder than the same oils in water at the same superfat. That is a side effect, not a reason to under-calculate the lye. The oils still need their full alkali dose.",
        },
        {
          kind: "paragraph",
          text: "On a label, goat milk belongs in the ingredient list if it is in the pot. A splash for color is not a milk soap. If milk is the liquid, say so, and use its INCI name with the rest of the declaration.",
        },
        {
          kind: "paragraph",
          text: "Ungelled milk soap stays pale, often ivory to a light tan. Gelled milk soap browns. The darker bar is not burnt by default. It is sugars that went through gel. Both can be fine soap. They will not match in a set.",
        },
      ],
    },
    {
      heading: "Frozen milk, low temperature",
      blocks: [
        {
          kind: "paragraph",
          text: "Sugars scorch when they meet a hot, concentrated lye solution. Freezing the milk is how you stop that. Freeze it in cubes or a flat tray so you can add lye to a slush, not to a warm jug. Add the lye slowly. Stir until every grain is dissolved and the mixture has the color of pale custard, not brown curd. If it smells cooked or looks like scrambled milk, the lye went in too fast or the milk was too warm. That batch of solution is for the notes, not for a pale bar.",
        },
        {
          kind: "paragraph",
          text: "Keep both sides cool. Oils fully melted, then brought down. Milk-lye solution cool enough to handle the jug comfortably. A warm soaping temperature plus lactose is how a milk loaf races to thick trace before the color is mixed.",
        },
      ],
    },
    {
      heading: "No insulation",
      blocks: [
        {
          kind: "paragraph",
          text: "After the pour, do not wrap the mold. Do not stack towels on it. Do not set it on a heating pad. The sugars will look for an excuse to gel. Many makers put the mold somewhere cool, and some use a fridge or a short stay in the freezer to skip gel entirely. Peek at it. A volcano starts as a dome and a crack, then overflow. If it rises and you did not want the dark gel, moving it to a cool surface is the intervention. Do not stir a rising loaf back down.",
        },
        {
          kind: "paragraph",
          text: "Partial gel — a translucent ring and an opaque center — is common in milk soap. It is cosmetic. It is also a reason some makers force a full gel or force none, so the loaf is one color. Pick one and build the temperature plan around it.",
        },
      ],
    },
    {
      heading: "Recipe side",
      blocks: [
        {
          kind: "paragraph",
          text: "Milk does not forgive a fast oil blend. Coconut and butters already accelerate. Stacked on lactose, the working window collapses. Keep the formula on the calmer side of what you would pour in water, and have the mold and any color ready. Fragrance oils that accelerate deserve the same caution; add them at thin emulsion, not into a warm batter you still plan to swirl.",
        },
        {
          kind: "paragraph",
          text: "Salt bars and milk are an awkward pair. Salt heats and firms. Milk wants the opposite conditions. Learn milk on a plain loaf first.",
        },
        {
          kind: "paragraph",
          text: "Weigh the milk you actually use. Replacing \"the water\" means replacing that weight, not filling a jug by eye. Ice and frost change nothing about the grams.",
        },
        {
          kind: "paragraph",
          text: "Open the soap calculator at /soap, enter the oils and the superfat, and use the liquid weight the calculator gives as the weight of milk you freeze. The alkali line is still the oils and the superfat. Milk changes the session, not the SAP math.",
        },
      ],
    },
  ],
  keyNumbers: [
    "The lye math does not change because the liquid is milk. Same oils, same superfat, same alkali.",
    "Freeze the milk. Add lye to a slush, slowly, until every grain is gone.",
    "Keep both sides cool and skip the insulation — sugars feed gel.",
    "Partial gel is cosmetic. Force full gel or none so the loaf is one color.",
    "Weigh the milk. Replacing the water means replacing its weight.",
  ],
};

const rebatchSoap: Guide = {
  slug: "rebatch-soap",
  title: "How to Rebatch Soap",
  description:
    "How to rebatch soap: grate, melt with a little liquid, and what a rebatch fixes — and what it cannot.",
  kicker: "Technique",
  tags: ["rebatch", "rescue", "hot-process", "technique"],
  published: "2026-10-05",
  intro: [
    "Rebatching is the rescue. You grate a finished or fully saponified batch, melt it with a little liquid, and spoon it back into a mold. It saves an ugly loaf, a seized swirl, and a partial gel you cannot stand to look at. It does not remake the chemistry. Whatever alkali and oil balance went into the first pot is still in the grate.",
  ],
  sections: [
    {
      heading: "Before you grate",
      accent: "warning",
      blocks: [
        {
          kind: "list",
          items: [
            "Goggles and gloves stay on — warmed soap off-gasses fragrance, and a batch you do not trust can still carry free alkali.",
            "Ventilation still matters during the melt.",
            "No aluminum pots or utensils; lye attacks them.",
            "If you are rebatching because you suspect lye-heavy soap, treat the grate as active alkali until a zap test says otherwise.",
            "Flush any splash with running water. Vinegar is not a bench neutralizer.",
          ],
        },
      ],
    },
    {
      heading: "What it fixes",
      blocks: [
        {
          kind: "paragraph",
          text: "A seized batter that set in the pot before you could pour. A swirl that turned to mud. A partial gel that left a dark ring and a pale core. A fragrance you forgot, added to a batch that is already a safe, finished soap. A color that separated and looks worse than a plain bar would have.",
        },
        {
          kind: "paragraph",
          text: "Rebatch also lets you mill a batch on purpose. Grated, melted, and molded again, soap is denser and a little smoother in use than a rough first pour. The look stays rustic. That is the trade.",
        },
      ],
    },
    {
      heading: "What it cannot fix",
      blocks: [
        {
          kind: "paragraph",
          text: "A lye-heavy batch is still lye-heavy after you melt it. Heat does not create the missing oil. If the bar zaps, if it burns on a wet finger, or if the original numbers show too much alkali for the oils and the superfat, rebatching alone will not make it skin-safe. That batch needs a calculated fat addition — new oil, weighed against the deficit — and time. Melting and hoping is how a bad bar gets a second label.",
        },
        {
          kind: "paragraph",
          text: "Rancid soap stays rancid. Spots of DOS, a paint-like smell, orange blotches from oxidation: the melt spreads them. Throw that batch out or keep it for laundry experiments you are willing to smell. Rebatch is not a deodorizer.",
        },
        {
          kind: "paragraph",
          text: "A bar that is only soft because the cure has not finished does not need a rebatch. It needs air and weeks. Grating it now just makes a soft grate.",
        },
      ],
    },
    {
      heading: "The method",
      blocks: [
        {
          kind: "paragraph",
          text: "Wait until the soap has saponified. A fresh cold-process loaf is a poor candidate; give it its first days so you are grating soap, not batter. Shred it on a box grater or pulse it carefully. Finer shreds melt faster and more evenly.",
        },
        {
          kind: "paragraph",
          text: "Add liquid sparingly. Water, goat milk, or a light oil — a little, not a second water phase. You are loosening the shreds so they melt, not building a new recipe. Too much liquid gives a soft bar you will cure all over again.",
        },
        {
          kind: "paragraph",
          text: "Low heat. A crockpot on low, or a double boiler. Lid on, stir every so often. It will look like mashed potatoes, then like a glossy dough. That is done. Boiling drives off water you just added and can scorch sugars if the original bar had milk or honey. Do not chase a pour. Rebatch does not become fluid the way a new cold-process batter does.",
        },
        {
          kind: "paragraph",
          text: "Add fragrance or a colorant at the end, off the hottest heat, and stir until it is even. Spoon into the mold. Tap out the worst gaps. It will not take a swirl. Smooth the top if you want it less rough, and accept the rest.",
        },
      ],
    },
    {
      heading: "After the mold",
      blocks: [
        {
          kind: "paragraph",
          text: "Rebatched bars unmold sooner than a raw pour because they were already soap. They still need to dry. Any liquid you added has to leave. The texture stays matte, a little uneven, sometimes with a visible shred pattern under the surface. That is what rebatch looks like. Call it rustic and sell it as such, or keep it. Do not promise a poured-soap finish you cannot deliver.",
        },
        {
          kind: "paragraph",
          text: "If the goal is a precise new formula rather than a rescue, rebatch is the wrong tool. Open the soap calculator at /soap and build the next batch clean. Use rebatch for the loaf you already have — appearance, a late additive, a partial gel — and use new math for anything the first numbers got wrong.",
        },
      ],
    },
  ],
  keyNumbers: [
    "Rebatch fixes appearance, not chemistry. Lye-heavy stays lye-heavy.",
    "Grate fully saponified soap, melt low and slow — mashed potatoes, then glossy dough.",
    "Liquid is a loosener, not a second water phase. A little, not a pour.",
    "Rancid stays rancid. A soft uncured bar needs air, not a rebatch.",
    "A calculated fat addition fixes lye-heavy soap. Melting and hoping does not.",
  ],
};

const fragranceUsage: Guide = {
  slug: "fragrance-usage-rate",
  title: "Fragrance Oil Usage Rate in Cold Process Soap",
  description:
    "Fragrance oil usage rate in soap is a safety cap, not a strength preference — and it is not a candle rate.",
  kicker: "Formulation",
  tags: ["fragrance", "essential-oil", "IFRA", "usage-rate"],
  published: "2026-10-05",
  intro: [
    "A usage rate is the maximum share of a fragrance material allowed in that product. It is a safety number. It is not how strong you wish the bar were, and it is not the rate printed on a candle worksheet. Soap sits on skin, even if it rinses off. The cap comes from the supplier and from IFRA, the body that sets category limits for fragrance materials. Your nose does not get a vote above that cap.",
  ],
  sections: [
    {
      heading: "Before you measure lye",
      accent: "warning",
      blocks: [
        {
          kind: "list",
          items: [
            "Goggles, chemical-resistant gloves, and long sleeves before the lye lid opens.",
            "Work with air moving — a window fan pulling vapor away is enough for most home batches.",
            "You are still handling a lye batter when the fragrance goes in. Lye into water, never the reverse.",
            "No aluminum pots or utensils; lye attacks them.",
            "Flush any splash with running water. Vinegar is not a bench neutralizer.",
          ],
        },
      ],
    },
    {
      heading: "Why soap is not a candle",
      blocks: [
        {
          kind: "paragraph",
          text: "IFRA sorts products by how they meet the body. A rinse-off soap sits in a looser category than a leave-on cream, and in a different category from a candle, which is written for wax and a burn. A load that is normal in a candle can be well over what that same oil is allowed to do on skin. The bottle does not care that you used it somewhere else. Read the soap rate, or the IFRA category that covers rinse-off soap, and use that.",
        },
        {
          kind: "paragraph",
          text: "Essential oils are not a milder version of fragrance oils. They are the material. Clove, cinnamon, oregano, lemongrass, and the citrus oils that oxidize all have their own ceilings, often tighter than a blended fragrance oil sold for soap. \"Natural\" is not a usage rate.",
        },
      ],
    },
    {
      heading: "How to read the sheet",
      blocks: [
        {
          kind: "paragraph",
          text: "The supplier sheet for a fragrance oil should give a rate for soap, sometimes listed against cold process specifically. IFRA certificate categories sit beside it. Use the lower number that applies to your bar. If the sheet says the oil is not for soap, or is not skin-safe, leave it out. Candle-only oils stay in candles.",
        },
        {
          kind: "paragraph",
          text: "Rate is calculated on the batch the supplier names — often the oil weight, sometimes the whole formula. Match their base. A rate meant for oils, applied by accident to the full loaf including water, overdoses the bar. Weigh the fragrance. Squirts from the bottle are how a cap gets crossed.",
        },
        {
          kind: "paragraph",
          text: "A blend of two fragrance materials does not get two full rates. Each one still counts toward skin exposure. Split the budget. Do not stack two maximums and call it a custom scent.",
        },
      ],
    },
    {
      heading: "What the rate is not allowed to do",
      blocks: [
        {
          kind: "paragraph",
          text: "More oil does not mean a better bar. Past the cap you have a safety problem and, often, a worse soap. Excess fragrance can seize a batter, separate, weep out of the cut, or soften a bar that was firm. Vanilla-heavy and spice-heavy materials discolor. Some florals and spices accelerate trace the moment they hit emulsion. None of that is fixed by adding more.",
        },
        {
          kind: "paragraph",
          text: "Under the cap, strength is a formulation choice. A light scent and a firm scent can both be legal. Judge them at the end of cure, not at the cut. Top notes fade while the bar dries. A bar that smells loud on cutting day can be polite at six weeks, and the reverse is rare. If a scent fades, anchor it with a base note that is still inside the cap. Do not \"fix\" fade by exceeding the rate. Cure is doing what cure does.",
        },
      ],
    },
    {
      heading: "Accelerators and discolorers",
      blocks: [
        {
          kind: "paragraph",
          text: "Know the oil before it hits the pot. Spice oils, some florals, and a number of fragrance oils sold as \"floral\" or \"spice\" will thicken a light trace in seconds. Add those at thin emulsion, with the mold already set up. Plan a rustic pour if the supplier notes acceleration.",
        },
        {
          kind: "paragraph",
          text: "Discoloration is cosmetic and predictable. Vanillin goes tan to brown. Clove and cinnamon stain. A pale swirl design and a high-vanillin oil will not stay pale. Either accept the color or pick a different material. Rebatching later will not pull the color out.",
        },
        {
          kind: "paragraph",
          text: "Phototoxic citrus oils matter more in leave-on products, but a soap that sits on a wet sink in the sun is a poor place to ignore the sheet. If the note says use restrictions, follow them.",
        },
      ],
    },
    {
      heading: "When the numbers disagree",
      blocks: [
        {
          kind: "paragraph",
          text: "Supplier sheet, IFRA category, and the habit you copied from a candle kit will not always match. The lowest applicable soap limit wins. When you are unsure which figure you actually weighed against, the lowest applicable soap limit on the sheet wins — then you confirm it before the next batch, and you write the rate on the formula card.",
        },
        {
          kind: "paragraph",
          text: "Open the soap calculator at /soap when the oils and the superfat are set, and add the fragrance as a weighed line rather than a guess at the pot. The usage rate is part of the formula. Treat it with the same care as the lye.",
        },
      ],
    },
  ],
  keyNumbers: [
    "Usage rate is a safety cap, not a strength preference. Your nose does not vote above it.",
    "Soap is not a candle: rinse-off skin limits are tighter than wax loads.",
    "Match the supplier's base — a rate meant for oils, applied to the whole loaf, overdoses the bar.",
    "Two fragrance materials do not get two full rates. Split the budget.",
    "Do not fix fade by exceeding the rate. Cure does what cure does.",
  ],
};

export const GUIDE_DATABASE: Guide[] = [
  lyeSafety,
  readingAnOil,
  coldVsHot,
  superfatting,
  cureTime,
  balmBasics,
  dualLye,
  sapValues,
  grainyBalm,
  waterDiscount,
  formulateRecipe,
  traceStages,
  goatMilkSoap,
  rebatchSoap,
  fragranceUsage,
];

export function getGuideBySlug(slug: string): Guide | undefined {
  return GUIDE_DATABASE.find((guide) => guide.slug === slug);
}
