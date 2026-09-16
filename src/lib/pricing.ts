import {
  BRACELET_STYLES,
  GEMS,
  METALS,
  PENDANT_STYLES,
  PIECES,
  SETTINGS,
  priceKey,
  type PriceGroupId,
  type PriceTable,
} from "@/lib/ring-options";

/**
 * The catalogue of everything the back office may price.
 *
 * Built by mapping over the option arrays rather than being written out by
 * hand: add a setting or a gem to ring-options.ts and it appears on
 * /admin/crafting-prices automatically, already showing its code default. That
 * is the whole point — a hand-maintained second list would fall behind the
 * first the moment someone added an option in a hurry.
 *
 * It is also the allowlist. The server action rejects any key that isn't in
 * here, so a crafted form post can't invent rows in the table.
 */

/** Currency amounts render with a $ and no decimals; factors are multipliers. */
export type PriceKind = "currency" | "factor";

export type PriceFieldDef = {
  group: PriceGroupId;
  optionId: string;
  optionLabel: string;
  /** Second line under the option name, for context in the grid. */
  optionHint?: string;
  field: string;
  fieldLabel: string;
  kind: PriceKind;
  defaultValue: number;
};

export type PriceGroupDef = {
  id: PriceGroupId;
  label: string;
  blurb: string;
  fields: PriceFieldDef[];
};

export const PRICE_GROUPS: PriceGroupDef[] = [
  {
    id: "piece",
    label: "Piece Basics",
    blurb:
      "Applied to every quote for that piece. The crafting premium is a flat amount; the two factors multiply the metal and setting cost, so 2.1 means a necklace uses 2.1× the metalwork of a ring.",
    fields: PIECES.flatMap((p): PriceFieldDef[] => [
      {
        group: "piece",
        optionId: p.id,
        optionLabel: p.label,
        optionHint: p.tagline,
        field: "craftBase",
        fieldLabel: "Crafting premium",
        kind: "currency",
        defaultValue: p.craftBase,
      },
      {
        group: "piece",
        optionId: p.id,
        optionLabel: p.label,
        optionHint: p.tagline,
        field: "metalFactor",
        fieldLabel: "Metal multiplier",
        kind: "factor",
        defaultValue: p.metalFactor,
      },
      {
        group: "piece",
        optionId: p.id,
        optionLabel: p.label,
        optionHint: p.tagline,
        field: "settingFactor",
        fieldLabel: "Setting multiplier",
        kind: "factor",
        defaultValue: p.settingFactor,
      },
    ]),
  },
  {
    id: "setting",
    label: "Ring Settings",
    blurb:
      "The metalwork for each of the eighteen ring designs, before the piece's setting multiplier is applied.",
    fields: SETTINGS.map((s) => ({
      group: "setting" as const,
      optionId: s.id,
      optionLabel: s.label,
      optionHint: s.tagline,
      field: "basePrice",
      fieldLabel: "Setting price",
      kind: "currency" as const,
      defaultValue: s.basePrice,
    })),
  },
  {
    id: "metal",
    label: "Precious Metals",
    blurb: "The metalwork cost for a ring. Necklaces and bracelets scale this by their multiplier above.",
    fields: METALS.map((m) => ({
      group: "metal" as const,
      optionId: m.id,
      optionLabel: m.label,
      optionHint: m.karat,
      field: "price",
      fieldLabel: "Metal price",
      kind: "currency" as const,
      defaultValue: m.price,
    })),
  },
  {
    id: "gem",
    label: "Gemstones",
    blurb:
      "Charged per carat, multiplied by the carat weight the client chooses. On multi-stone bracelets, melee stones are charged at 35% of this rate.",
    fields: GEMS.map((g) => ({
      group: "gem" as const,
      optionId: g.id,
      optionLabel: g.label,
      optionHint: g.origin,
      field: "pricePerCarat",
      fieldLabel: "Price per carat",
      kind: "currency" as const,
      defaultValue: g.pricePerCarat,
    })),
  },
  {
    id: "bracelet_style",
    label: "Bracelet Designs",
    blurb:
      "A multiplier on the bracelet's metalwork — heavier designs cost more to build. The stone count is fixed by the design's geometry and is shown for reference only.",
    fields: BRACELET_STYLES.map((b) => ({
      group: "bracelet_style" as const,
      optionId: b.id,
      optionLabel: b.label,
      optionHint: `${b.stoneCount} ${b.stoneCount === 1 ? "stone" : "stones"} · ${b.tagline}`,
      field: "priceFactor",
      fieldLabel: "Metalwork multiplier",
      kind: "factor" as const,
      defaultValue: b.priceFactor,
    })),
  },
  {
    id: "pendant_style",
    label: "Pendant Designs",
    blurb: "The metalwork for each necklace pendant, charged as a flat amount.",
    fields: PENDANT_STYLES.map((p) => ({
      group: "pendant_style" as const,
      optionId: p.id,
      optionLabel: p.label,
      optionHint: p.tagline,
      field: "basePrice",
      fieldLabel: "Pendant price",
      kind: "currency" as const,
      defaultValue: p.basePrice,
    })),
  },
];

/** Flat view of every legal (group, option, field) triple. */
export const PRICE_FIELDS: PriceFieldDef[] = PRICE_GROUPS.flatMap((g) => g.fields);

/** The allowlist the server action validates submitted keys against. */
export const PRICE_FIELD_BY_KEY = new Map<string, PriceFieldDef>(
  PRICE_FIELDS.map((f) => [priceKey(f.group, f.optionId, f.field), f]),
);

/** Compiled-in defaults as a PriceTable — the baseline the admin grid diffs against. */
export const DEFAULT_PRICE_TABLE: PriceTable = Object.fromEntries(
  PRICE_FIELDS.map((f) => [priceKey(f.group, f.optionId, f.field), f.defaultValue]),
);

/** Format a value for display, by kind. */
export function formatPriceValue(value: number, kind: PriceKind): string {
  return kind === "currency"
    ? `$${Math.round(value).toLocaleString("en-SG")}`
    : `${value}×`;
}
