/**
 * Shared model for the Bespoke Atelier ring configurator.
 * Used by the interactive form, the WebGL preview and the
 * /api/generate-ring route so every surface agrees on the options.
 */

export type SettingId = "solitaire" | "halo" | "trinity" | "pave";
export type MetalId = "yellow-gold" | "rose-gold" | "white-gold" | "platinum";
export type GemId = "diamond" | "ruby" | "sapphire" | "emerald" | "amethyst" | "aquamarine";
export type CutId = "round" | "princess" | "oval" | "emerald";

export interface RingConfig {
  setting: SettingId;
  metal: MetalId;
  gem: GemId;
  cut: CutId;
  carat: number; // 0.5 – 3.0
  engraving: string;
}

export const DEFAULT_CONFIG: RingConfig = {
  setting: "solitaire",
  metal: "yellow-gold",
  gem: "diamond",
  cut: "round",
  carat: 1.0,
  engraving: "",
};

export interface SettingOption {
  id: SettingId;
  label: string;
  tagline: string;
  description: string;
  /** Prompt fragment describing the setting for the AI render. */
  prompt: string;
  basePrice: number;
}

export const SETTINGS: SettingOption[] = [
  {
    id: "solitaire",
    label: "Solitaire",
    tagline: "One stone, undivided light",
    description: "A single center stone raised on a six-prong crown — the purest, most timeless silhouette.",
    prompt:
      "a classic solitaire setting where the single center stone is held high in a delicate six-prong crown basket",
    basePrice: 1800,
  },
  {
    id: "halo",
    label: "Halo",
    tagline: "A crown of micro-diamonds",
    description: "The center stone encircled by a halo of micro-set diamonds, amplifying its fire and presence.",
    prompt:
      "a halo setting where the center stone is encircled by a sparkling ring of small pavé micro-diamonds",
    basePrice: 2600,
  },
  {
    id: "trinity",
    label: "Trinity",
    tagline: "Past · Present · Forever",
    description: "Three stones side by side — a grand center flanked by two companions, telling a story in light.",
    prompt:
      "a three-stone trinity setting with the large center stone flanked by two smaller matching side stones",
    basePrice: 3200,
  },
  {
    id: "pave",
    label: "Pavé",
    tagline: "A band paved in starlight",
    description: "The shoulders of the band are micro-set with accent diamonds that shimmer with every movement.",
    prompt:
      "a pavé setting where the shoulders of the band are micro-set with tiny accent diamonds running along the band",
    basePrice: 2400,
  },
];

export interface MetalOption {
  id: MetalId;
  label: string;
  karat: string;
  description: string;
  /** Hex color used by the WebGL material. */
  hex3d: number;
  /** CSS gradient for the swatch chip. */
  swatch: string;
  prompt: string;
  price: number;
}

export const METALS: MetalOption[] = [
  {
    id: "yellow-gold",
    label: "Yellow Gold",
    karat: "18K",
    description: "Warm, classic radiance",
    hex3d: 0xe9c877,
    swatch: "radial-gradient(circle at 30% 30%, #f7e7b2, #e2b64f 55%, #9c6c1e)",
    prompt: "richly polished 18k yellow gold",
    price: 950,
  },
  {
    id: "rose-gold",
    label: "Rose Gold",
    karat: "18K",
    description: "A romantic blush hue",
    hex3d: 0xe8a586,
    swatch: "radial-gradient(circle at 30% 30%, #f9d3c0, #e2a084 55%, #a5583b)",
    prompt: "romantic polished 18k rose gold with a soft blush tone",
    price: 950,
  },
  {
    id: "white-gold",
    label: "White Gold",
    karat: "18K",
    description: "Cool, contemporary sheen",
    hex3d: 0xe8e8e4,
    swatch: "radial-gradient(circle at 30% 30%, #ffffff, #d9dadb 55%, #8f9194)",
    prompt: "bright rhodium-finished 18k white gold",
    price: 1050,
  },
  {
    id: "platinum",
    label: "Platinum",
    karat: "950",
    description: "The rarest, forever metal",
    hex3d: 0xd8dcde,
    swatch: "radial-gradient(circle at 30% 30%, #f4f7f8, #c9cfd3 55%, #7e868b)",
    prompt: "dense lustrous 950 platinum with a cool silvery finish",
    price: 1600,
  },
];

export interface GemOption {
  id: GemId;
  label: string;
  origin: string;
  description: string;
  hex3d: number;
  swatch: string;
  prompt: string;
  pricePerCarat: number;
  /** Optical hints for the WebGL material. */
  transmission: number;
  ior: number;
}

export const GEMS: GemOption[] = [
  {
    id: "diamond",
    label: "Diamond",
    origin: "D-Flawless",
    description: "Pure white brilliance and unmatched fire",
    hex3d: 0xffffff,
    swatch: "radial-gradient(circle at 32% 28%, #ffffff, #dfe9f2 45%, #8fa8bd 80%, #5d7488)",
    prompt: "flawless D-color white diamond with intense fire and scintillation",
    pricePerCarat: 6800,
    transmission: 0.97,
    ior: 2.417,
  },
  {
    id: "ruby",
    label: "Ruby",
    origin: "Burmese",
    description: "Pigeon-blood red, the stone of passion",
    hex3d: 0xc2103a,
    swatch: "radial-gradient(circle at 32% 28%, #ff8fa5, #d81b4b 50%, #7a0322)",
    prompt: "vivid pigeon-blood red Burmese ruby",
    pricePerCarat: 4200,
    transmission: 0.85,
    ior: 1.77,
  },
  {
    id: "sapphire",
    label: "Sapphire",
    origin: "Ceylon",
    description: "Royal Ceylon blue, deep as dusk",
    hex3d: 0x1a4fc4,
    swatch: "radial-gradient(circle at 32% 28%, #8db4ff, #2450c7 50%, #0a1e63)",
    prompt: "deep royal-blue Ceylon sapphire",
    pricePerCarat: 3600,
    transmission: 0.86,
    ior: 1.77,
  },
  {
    id: "emerald",
    label: "Emerald",
    origin: "Colombian",
    description: "Lush garden green with velvet depth",
    hex3d: 0x0e8a5f,
    swatch: "radial-gradient(circle at 32% 28%, #7fe6bd, #12996a 50%, #04422c)",
    prompt: "lush vivid-green Colombian emerald",
    pricePerCarat: 3900,
    transmission: 0.82,
    ior: 1.58,
  },
  {
    id: "amethyst",
    label: "Amethyst",
    origin: "Uruguayan",
    description: "Regal violet with a silken glow",
    hex3d: 0x8b4fd8,
    swatch: "radial-gradient(circle at 32% 28%, #d9b8ff, #9256d9 50%, #451f78)",
    prompt: "rich violet Uruguayan amethyst",
    pricePerCarat: 900,
    transmission: 0.92,
    ior: 1.54,
  },
  {
    id: "aquamarine",
    label: "Aquamarine",
    origin: "Santa Maria",
    description: "Glacial sea-blue, luminous and calm",
    hex3d: 0x7fd0e8,
    swatch: "radial-gradient(circle at 32% 28%, #dff8ff, #8fd4e8 50%, #35849e)",
    prompt: "luminous sea-blue Santa Maria aquamarine",
    pricePerCarat: 1200,
    transmission: 0.94,
    ior: 1.57,
  },
];

export interface CutOption {
  id: CutId;
  label: string;
  facets: string;
  description: string;
  prompt: string;
}

export const CUTS: CutOption[] = [
  {
    id: "round",
    label: "Round Brilliant",
    facets: "57 facets",
    description: "The mathematical maximum of sparkle",
    prompt: "round brilliant cut",
  },
  {
    id: "princess",
    label: "Princess",
    facets: "58 facets",
    description: "Crisp modern square geometry",
    prompt: "square princess cut",
  },
  {
    id: "oval",
    label: "Oval",
    facets: "58 facets",
    description: "Elongated grace that flatters the hand",
    prompt: "elongated oval cut",
  },
  {
    id: "emerald",
    label: "Emerald Cut",
    facets: "step-cut",
    description: "Art-deco hall-of-mirrors elegance",
    prompt: "step-cut emerald cut with long hall-of-mirrors facets",
  },
];

export const CARAT_MIN = 0.5;
export const CARAT_MAX = 3.0;
export const CARAT_STEP = 0.1;

/* ---------- lookups & helpers ---------- */

export const settingById = (id: SettingId) => SETTINGS.find((s) => s.id === id) ?? SETTINGS[0];
export const metalById = (id: MetalId) => METALS.find((m) => m.id === id) ?? METALS[0];
export const gemById = (id: GemId) => GEMS.find((g) => g.id === id) ?? GEMS[0];
export const cutById = (id: CutId) => CUTS.find((c) => c.id === id) ?? CUTS[0];

export function estimatePrice(config: RingConfig): number {
  const raw =
    settingById(config.setting).basePrice +
    metalById(config.metal).price +
    gemById(config.gem).pricePerCarat * config.carat;
  return Math.round(raw / 50) * 50;
}

/** Clamp/whitelist an arbitrary payload into a safe RingConfig (used server-side). */
export function sanitizeConfig(input: unknown): RingConfig {
  const body = (typeof input === "object" && input !== null ? input : {}) as Record<string, unknown>;
  const pick = <T extends { id: string }>(list: T[], v: unknown, fallback: string) =>
    (list.some((o) => o.id === v) ? v : fallback) as never;

  const caratNum = Number(body.carat);
  const carat = Number.isFinite(caratNum)
    ? Math.min(CARAT_MAX, Math.max(CARAT_MIN, Math.round(caratNum * 10) / 10))
    : 1.0;

  const engraving =
    typeof body.engraving === "string"
      ? body.engraving.replace(/[^\p{L}\p{N} .,&'\-]/gu, "").slice(0, 28).trim()
      : "";

  return {
    setting: pick(SETTINGS, body.setting, "solitaire"),
    metal: pick(METALS, body.metal, "yellow-gold"),
    gem: pick(GEMS, body.gem, "diamond"),
    cut: pick(CUTS, body.cut, "round"),
    carat,
    engraving,
  };
}

/** Pre-filled WhatsApp enquiry text for the configured ring. */
export function buildWhatsAppMessage(config: RingConfig): string {
  const lines = [
    "Hello Ceylon Gem Maison! I just designed a bespoke ring on your site and would love to enquire:",
    `• Setting: ${settingById(config.setting).label}`,
    `• Metal: ${metalById(config.metal).karat} ${metalById(config.metal).label}`,
    `• Stone: ${config.carat.toFixed(1)} ct ${cutById(config.cut).label} ${gemById(config.gem).label}`,
  ];
  if (config.engraving) lines.push(`• Engraving: "${config.engraving}"`);
  lines.push(`• Estimated from: $${estimatePrice(config).toLocaleString("en-US")}`);
  return lines.join("\n");
}

/** Build the image-generation prompt for the configured ring. */
export function buildRingPrompt(config: RingConfig): string {
  const setting = settingById(config.setting);
  const metal = metalById(config.metal);
  const gem = gemById(config.gem);
  const cut = cutById(config.cut);

  return [
    `Ultra-detailed professional luxury jewelry product photograph of a single engagement ring.`,
    `The ring features ${setting.prompt}.`,
    `The band is crafted from ${metal.prompt}.`,
    `The center stone is a ${config.carat.toFixed(1)} carat ${cut.prompt} ${gem.prompt}.`,
    config.engraving
      ? `A subtle engraving reading "${config.engraving}" is faintly visible on the inner surface of the band.`
      : "",
    `Photorealistic macro studio photography, razor-sharp focus on the center stone, high-end jewelry catalog style,`,
    `three-quarter hero angle showing both the stone and the curve of the band, delicate sparkle highlights on every facet.`,
    `The ring is completely isolated on a pure seamless solid white (#FFFFFF) background —`,
    `no props, no fabric, no shadows cast on visible surfaces, no reflections of an environment, no hands, no text, no watermark, nothing else in frame.`,
  ]
    .filter(Boolean)
    .join(" ");
}
