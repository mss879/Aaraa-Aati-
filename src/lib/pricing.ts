import "server-only";
import {
  DESIGNS,
  GEMS,
  METALS,
  type DesignKey,
  type GemId,
  type MetalId,
  type QuoteTable,
} from "@/lib/ring-options";
import { markupMultiplier } from "@/lib/cost-formula";

/**
 * The atelier's cost figures — the client's "Cost Formula" sheet, per design.
 *
 * This replaced a system of piece multipliers, setting multipliers, crafting
 * premiums and a hidden 35% melee discount that the client found impossible to
 * reason about. What is left is exactly what the sheet asks for:
 *
 *   per gold type      cost per gram       (18K / 14K yellow, rose, white; platinum)
 *   per gemstone       cost per carat
 *   per design         gold used (g), labour, mark-up %
 *
 * and the customer supplies the rest in the atelier: which gold, which stone,
 * what carat. The formula itself is in lib/cost-formula.ts.
 *
 * SERVER-ONLY, and that is load-bearing. Every figure here is a COST, and the
 * mark-ups are the house's margins — a visitor who could read these could read
 * that a ring is sold at three times its materials. So none of it crosses to the
 * browser: the atelier is handed buildQuoteTable()'s retail figures instead, and
 * migration 0017 withdrew the public read on crafting_prices for the same
 * reason. Import this from Server Components, route handlers and server actions
 * only; the "server-only" import above makes a client import fail the build.
 */

/* --------------------------------------------------------------- the keys */

/** The three families of number the back office holds. */
export type PriceGroupId = "metal" | "gem" | "design";

/** A row in crafting_prices is keyed `group:option:field`. */
export const priceKey = (group: PriceGroupId, optionId: string, field: string): string =>
  `${group}:${optionId}:${field}`;

/** Admin-set figures, keyed by priceKey(). A missing key uses the default below. */
export type PriceTable = Record<string, number>;

/* --------------------------------------------------------- starting values
   The client's sheet supplies two real figures — 18K yellow gold at $200/g and
   blue sapphire at $1,200/ct — and the ×3 mark-up, and a solitaire weight and
   labour (2 g, $150). Everything else is a STARTING VALUE for them to replace:
   other golds scaled from 18K yellow by their current relative cost, other
   stones at a third of the retail per-carat rates the atelier quoted before
   (which is how sapphire's old $3,600 lands exactly on the sheet's $1,200),
   and design weights and labour graded by how much metal and setting work each
   design involves. */

const METAL_COST_PER_GRAM: Record<MetalId, number> = {
  "yellow-gold": 200,
  "rose-gold": 200,
  "white-gold": 220,
  "yellow-gold-14k": 155,
  "rose-gold-14k": 155,
  "white-gold-14k": 170,
  platinum: 340,
};

const GEM_COST_PER_CARAT: Record<GemId, number> = {
  diamond: 2250,
  ruby: 1400,
  sapphire: 1200,
  emerald: 1300,
  amethyst: 300,
  aquamarine: 400,
};

/** The sheet's "Mark up" column is ×3, which is 200% on top of materials. */
const DEFAULT_MARKUP_PCT = 200;

/**
 * [gold used in grams, labour] for each design. `satisfies` makes a missing
 * design a type error, so a setting added to ring-options.ts cannot quietly
 * quote from nothing.
 */
const DESIGN_DEFAULTS = {
  // Rings — the sheet's "Ring Design 1" is the solitaire.
  "ring:solitaire": [2.0, 150],
  "ring:tension": [4.0, 250],
  "ring:pave": [2.5, 300],
  "ring:channel": [3.0, 300],
  "ring:bezel": [2.5, 180],
  "ring:halo": [2.8, 350],
  "ring:double-halo": [3.2, 450],
  "ring:split-shank": [3.0, 220],
  "ring:cathedral": [2.8, 200],
  "ring:vintage": [3.2, 400],
  "ring:milgrain": [2.4, 220],
  "ring:bypass": [3.0, 220],
  "ring:flush": [4.5, 200],
  "ring:signet": [6.0, 250],
  // Pendants — the weight includes the chain.
  "necklace:bezel": [4.5, 180],
  "necklace:prong": [4.5, 180],
  "necklace:pear-drop": [5.0, 220],
  "necklace:bar": [5.0, 200],
  "necklace:solitaire-drop": [4.0, 150],
  // Bracelets — the whole bracelet's weight.
  "bracelet:single": [3.0, 180],
  "bracelet:tennis": [9.0, 600],
  "bracelet:station": [4.0, 250],
  "bracelet:bar": [6.0, 350],
  "bracelet:mixed": [5.0, 300],
} satisfies Record<DesignKey, [number, number]>;

/* ------------------------------------------------------- the field catalogue */

export type PriceUnit = "perGram" | "perCarat" | "grams" | "money" | "percent";

export type PriceFieldDef = {
  group: PriceGroupId;
  optionId: string;
  field: string;
  unit: PriceUnit;
  defaultValue: number;
  /** Bounds the save action enforces — a typo cannot become a live quote. */
  min: number;
  max: number;
  step: number;
};

const BOUNDS: Record<PriceUnit, Pick<PriceFieldDef, "min" | "max" | "step">> = {
  perGram: { min: 0, max: 100_000, step: 0.01 },
  perCarat: { min: 0, max: 1_000_000, step: 1 },
  grams: { min: 0, max: 500, step: 0.01 },
  money: { min: 0, max: 1_000_000, step: 1 },
  // Past 1000% (×11) is far more likely a slipped key than a price.
  percent: { min: 0, max: 1000, step: 0.1 },
};

const def = (
  group: PriceGroupId,
  optionId: string,
  field: string,
  unit: PriceUnit,
  defaultValue: number,
): PriceFieldDef => ({ group, optionId, field, unit, defaultValue, ...BOUNDS[unit] });

/** One per gold type, and one per gemstone. */
export const MATERIAL_FIELDS: PriceFieldDef[] = [
  ...METALS.map((m) => def("metal", m.id, "costPerGram", "perGram", METAL_COST_PER_GRAM[m.id])),
  ...GEMS.map((g) => def("gem", g.id, "costPerCarat", "perCarat", GEM_COST_PER_CARAT[g.id])),
];

/** The client's per-design variables, in the order the admin table shows them. */
export const DESIGN_VARIABLES = [
  { field: "metalGrams", unit: "grams" },
  { field: "labour", unit: "money" },
  { field: "markupPct", unit: "percent" },
] as const satisfies readonly { field: string; unit: PriceUnit }[];

export type DesignVariable = (typeof DESIGN_VARIABLES)[number]["field"];

export const DESIGN_FIELDS: PriceFieldDef[] = DESIGNS.flatMap((d) => {
  const [grams, labour] = DESIGN_DEFAULTS[d.key];
  const defaults: Record<DesignVariable, number> = {
    metalGrams: grams,
    labour,
    markupPct: DEFAULT_MARKUP_PCT,
  };
  return DESIGN_VARIABLES.map((v) => def("design", d.key, v.field, v.unit, defaults[v.field]));
});

/** Every legal (group, option, field) — also the save action's allowlist. */
export const PRICE_FIELDS: PriceFieldDef[] = [...MATERIAL_FIELDS, ...DESIGN_FIELDS];

export const PRICE_FIELD_BY_KEY = new Map<string, PriceFieldDef>(
  PRICE_FIELDS.map((f) => [priceKey(f.group, f.optionId, f.field), f]),
);

/* ------------------------------------------------------ resolved figures */

export type DesignCosts = Record<DesignVariable, number>;

export type ResolvedCosts = {
  metalCostPerGram: Record<MetalId, number>;
  stoneCostPerCarat: Record<GemId, number>;
  designs: Record<DesignKey, DesignCosts>;
};

/** The figures in force: each admin override where one is set, else the default. */
export function resolveCosts(table: PriceTable): ResolvedCosts {
  const read = (f: PriceFieldDef) => {
    const v = table[priceKey(f.group, f.optionId, f.field)];
    return typeof v === "number" && Number.isFinite(v) ? v : f.defaultValue;
  };
  const byKey = (group: PriceGroupId, optionId: string, field: string) =>
    read(PRICE_FIELD_BY_KEY.get(priceKey(group, optionId, field))!);

  return {
    metalCostPerGram: Object.fromEntries(
      METALS.map((m) => [m.id, byKey("metal", m.id, "costPerGram")]),
    ) as Record<MetalId, number>,
    stoneCostPerCarat: Object.fromEntries(
      GEMS.map((g) => [g.id, byKey("gem", g.id, "costPerCarat")]),
    ) as Record<GemId, number>,
    designs: Object.fromEntries(
      DESIGNS.map((d) => [
        d.key,
        Object.fromEntries(DESIGN_VARIABLES.map((v) => [v.field, byKey("design", d.key, v.field)])),
      ]),
    ) as Record<DesignKey, DesignCosts>,
  };
}

/**
 * Costs → the retail price list the atelier quotes from (see QuoteTable in
 * ring-options.ts for why this shape, and why it is safe to publish).
 *
 * Algebraically identical to cost-formula's sellingPrice():
 *   (g·gold + ct·n·stone)·M + labour  =  (g·gold·M + labour) + (stone·M)·ct·n
 * — the admin's live preview uses the left-hand side, the atelier the right.
 */
export function buildQuoteTable(table: PriceTable): QuoteTable {
  const costs = resolveCosts(table);
  const quote: QuoteTable = {};
  for (const d of DESIGNS) {
    const { metalGrams, labour, markupPct } = costs.designs[d.key];
    const m = markupMultiplier(markupPct);
    quote[d.key] = {
      base: Object.fromEntries(
        METALS.map((metal) => [metal.id, metalGrams * costs.metalCostPerGram[metal.id] * m + labour]),
      ),
      perCarat: Object.fromEntries(
        GEMS.map((gem) => [gem.id, costs.stoneCostPerCarat[gem.id] * m]),
      ),
    };
  }
  return quote;
}
