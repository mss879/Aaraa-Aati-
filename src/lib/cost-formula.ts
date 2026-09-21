/**
 * The maison's cost formula — the client's own "Cost Formula" sheet, as code.
 *
 *   Gold          = gold used (g)        × gold price per gram
 *   Gemstone      = carat × stone count  × stone price per carat
 *   Materials     = Gold + Gemstone
 *   Selling price = Materials × (1 + mark-up %) + Labour
 *
 * Worked example from the sheet ("Ring Design 1"): 2 g of 18K yellow gold at
 * $200/g is $400; a 1.5 ct blue sapphire at $1,200/ct is $1,800; materials
 * $2,200, marked up ×3 (200%) to $6,600, plus $150 labour = $6,750.
 *
 * Labour is added AFTER the mark-up, not inside it — that is how the sheet does
 * it, and the difference is real money on every quote, so it is kept exactly.
 *
 * This file holds arithmetic only, never numbers. The cost prices themselves are
 * the house's margins in plain sight, so they live server-side in
 * lib/pricing.ts and never reach a visitor's browser; this module is shared so
 * the admin's live preview and the atelier's quote run the same sums.
 */

export type CostInputs = {
  /** Grams of metal the design uses (the design's own figure). */
  metalGrams: number;
  /** Cost of the chosen metal, per gram. */
  metalCostPerGram: number;
  /** Carat of ONE stone — the centre stone, or each stone on a bracelet. */
  carat: number;
  /** How many stones of that carat the design carries (1 except bracelets). */
  stoneCount: number;
  /** Cost of the chosen gemstone, per carat. */
  stoneCostPerCarat: number;
  /** The design's labour cost, added after the mark-up. */
  labour: number;
  /** Mark-up on materials, as a percentage: 200 means ×3. */
  markupPct: number;
};

/** 200% → 3. The sheet thinks in multipliers; the back office asks for a %. */
export const markupMultiplier = (markupPct: number): number => 1 + markupPct / 100;

export function materialsCost(i: CostInputs): number {
  return i.metalGrams * i.metalCostPerGram + i.carat * i.stoneCount * i.stoneCostPerCarat;
}

/** The unrounded selling price — the sheet's final column. */
export function sellingPrice(i: CostInputs): number {
  return materialsCost(i) * markupMultiplier(i.markupPct) + i.labour;
}

/** Quotes are shown to the nearest $50, in the atelier and the admin alike. */
export const roundQuote = (n: number): number => Math.round(n / 50) * 50;
