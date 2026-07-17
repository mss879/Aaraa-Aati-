/**
 * Shared model for the Bespoke Atelier jewellery configurator.
 * Used by the interactive form, the WebGL preview and the
 * /api/generate-ring route so every surface agrees on the options.
 */

export type PieceId = "ring" | "necklace" | "bracelet";
export type SettingId = "solitaire" | "halo" | "trinity" | "pave";
export type MetalId = "yellow-gold" | "rose-gold" | "white-gold" | "platinum";
export type GemId = "diamond" | "ruby" | "sapphire" | "emerald" | "amethyst" | "aquamarine";
export type CutId = "round" | "princess" | "oval" | "emerald";
export type BraceletStyleId = "cable" | "bangle" | "curb" | "rope";
export type FitId = "slender" | "classic" | "generous";

export interface RingConfig {
  piece: PieceId;
  setting: SettingId;
  metal: MetalId;
  gem: GemId;
  cut: CutId;
  carat: number; // 0.5 – 3.0
  engraving: string;
  /** Bracelets are pure metalwork — styled, not stone-set. */
  braceletStyle: BraceletStyleId;
  fit: FitId;
}

export const DEFAULT_CONFIG: RingConfig = {
  piece: "ring",
  setting: "solitaire",
  metal: "yellow-gold",
  gem: "diamond",
  cut: "round",
  carat: 1.0,
  engraving: "",
  braceletStyle: "cable",
  fit: "classic",
};

export interface PieceOption {
  id: PieceId;
  label: string;
  tagline: string;
  description: string;
  /** Lowercase noun for sentences ("your ring"). */
  noun: string;
  /** Where the hidden engraving lives — used in UI copy and the AI prompt. */
  engravingSpot: string;
  /** Extra metalwork relative to a ring (chain, bangle) scales the metal cost. */
  metalFactor: number;
  /** Settings translate differently per piece (a pavé chain ≠ a pavé band). */
  settingFactor: number;
  /** Flat crafting premium for the larger piece. */
  craftBase: number;
}

export const PIECES: PieceOption[] = [
  {
    id: "ring",
    label: "The Ring",
    tagline: "Worn closest, forever",
    description: "A crown for the hand — engagement, promise, or a gift to yourself.",
    noun: "ring",
    engravingSpot: "on the inner surface of the band",
    metalFactor: 1,
    settingFactor: 1,
    craftBase: 0,
  },
  {
    id: "necklace",
    label: "The Necklace",
    tagline: "Light at the collarbone",
    description: "A pendant suspended on a fine chain — the stone rests at the heart.",
    noun: "necklace",
    engravingSpot: "on the small clasp tag of the chain",
    metalFactor: 2.1,
    settingFactor: 0.9,
    craftBase: 450,
  },
  {
    id: "bracelet",
    label: "The Bracelet",
    tagline: "A circle of presence",
    description: "Pure precious metal for the wrist — chain, bangle or twisted rope.",
    noun: "bracelet",
    engravingSpot: "on the polished clasp tag",
    metalFactor: 2.6,
    settingFactor: 0, // bracelets carry no stone setting
    craftBase: 650,
  },
];

/* ---------- bracelet styles (pure metalwork — no stone) ---------- */

export interface BraceletStyleOption {
  id: BraceletStyleId;
  label: string;
  tagline: string;
  description: string;
  /** Prompt fragment describing the bracelet for the AI render. */
  prompt: string;
  /** Heavier metalwork costs more. */
  priceFactor: number;
}

export const BRACELET_STYLES: BraceletStyleOption[] = [
  {
    id: "cable",
    label: "Cable Chain",
    tagline: "The eternal classic",
    description: "Round interlocking links, hand-finished — supple, timeless, everyday luxury.",
    prompt: "a classic cable-link chain bracelet of round interlocking hand-polished links",
    priceFactor: 1.0,
  },
  {
    id: "bangle",
    label: "Bangle",
    tagline: "One unbroken line",
    description: "A single broad, mirror-polished band — sculptural and absolute.",
    prompt: "a solid mirror-polished bangle bracelet with a broad rounded profile and clean unbroken lines",
    priceFactor: 1.25,
  },
  {
    id: "curb",
    label: "Curb Chain",
    tagline: "Flat-laid strength",
    description: "Twisted, flattened links that lie flush on the wrist — quietly assertive.",
    prompt: "a curb-link chain bracelet of flat twisted interlocking links lying flush",
    priceFactor: 1.1,
  },
  {
    id: "rope",
    label: "Twisted Rope",
    tagline: "Strands, entwined",
    description: "Three strands of gold wound about each other — light moves along the spiral.",
    prompt: "a twisted rope bangle bracelet of three intertwined polished metal strands",
    priceFactor: 1.35,
  },
];

/* ---------- wrist fits ---------- */

export interface FitOption {
  id: FitId;
  label: string;
  size: string;
  /** Subtle scale applied to the 3D model. */
  scale3d: number;
}

export const FITS: FitOption[] = [
  { id: "slender", label: "Slender", size: "16 cm", scale3d: 0.94 },
  { id: "classic", label: "Classic", size: "17.5 cm", scale3d: 1.0 },
  { id: "generous", label: "Generous", size: "19 cm", scale3d: 1.06 },
];

export interface SettingOption {
  id: SettingId;
  label: string;
  tagline: string;
  description: string;
  /** Prompt fragment describing the setting for the AI render. */
  prompt: string;
  basePrice: number;
  /** Copy overrides for when the piece is a necklace (band → chain framing). */
  necklaceDescription?: string;
  necklacePrompt?: string;
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
    necklaceDescription:
      "A grand center pendant flanked by two smaller companions set along the chain — a story told in light.",
    necklacePrompt:
      "a trinity design with the grand center pendant flanked by two smaller matching stones set along the chain",
  },
  {
    id: "pave",
    label: "Pavé",
    tagline: "A band paved in starlight",
    description: "The shoulders of the band are micro-set with accent diamonds that shimmer with every movement.",
    prompt:
      "a pavé setting where the shoulders of the band are micro-set with tiny accent diamonds running along the band",
    basePrice: 2400,
    necklaceDescription:
      "The chain approaching the pendant is micro-set with accent diamonds that shimmer with every movement.",
    necklacePrompt:
      "a pavé design where the chain approaching the pendant is micro-set with tiny accent diamonds",
  },
];

/** Setting copy adjusted to the piece (a pavé chain ≠ a pavé band). */
export const settingDescriptionFor = (s: SettingOption, piece: PieceId) =>
  piece === "necklace" ? s.necklaceDescription ?? s.description : s.description;

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

export const pieceById = (id: PieceId) => PIECES.find((p) => p.id === id) ?? PIECES[0];
export const settingById = (id: SettingId) => SETTINGS.find((s) => s.id === id) ?? SETTINGS[0];
export const metalById = (id: MetalId) => METALS.find((m) => m.id === id) ?? METALS[0];
export const gemById = (id: GemId) => GEMS.find((g) => g.id === id) ?? GEMS[0];
export const cutById = (id: CutId) => CUTS.find((c) => c.id === id) ?? CUTS[0];
export const braceletStyleById = (id: BraceletStyleId) =>
  BRACELET_STYLES.find((b) => b.id === id) ?? BRACELET_STYLES[0];
export const fitById = (id: FitId) => FITS.find((f) => f.id === id) ?? FITS[1];

export function estimatePrice(config: RingConfig): number {
  const piece = pieceById(config.piece);
  // Bracelets are pure metalwork — priced on metal weight and style, no stone.
  const raw =
    config.piece === "bracelet"
      ? piece.craftBase +
        metalById(config.metal).price * piece.metalFactor * braceletStyleById(config.braceletStyle).priceFactor
      : piece.craftBase +
        settingById(config.setting).basePrice * piece.settingFactor +
        metalById(config.metal).price * piece.metalFactor +
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
    piece: pick(PIECES, body.piece, "ring"),
    setting: pick(SETTINGS, body.setting, "solitaire"),
    metal: pick(METALS, body.metal, "yellow-gold"),
    gem: pick(GEMS, body.gem, "diamond"),
    cut: pick(CUTS, body.cut, "round"),
    carat,
    engraving,
    braceletStyle: pick(BRACELET_STYLES, body.braceletStyle, "cable"),
    fit: pick(FITS, body.fit, "classic"),
  };
}

/** Pre-filled WhatsApp enquiry text for the configured piece. */
export function buildWhatsAppMessage(config: RingConfig): string {
  const piece = pieceById(config.piece);
  const lines = [
    `Hello Ceylon Gem Maison! I just designed a bespoke ${piece.noun} on your site and would love to enquire:`,
    `• Piece: ${piece.label.replace(/^The /, "")}`,
  ];
  if (config.piece === "bracelet") {
    const fit = fitById(config.fit);
    lines.push(
      `• Style: ${braceletStyleById(config.braceletStyle).label}`,
      `• Metal: ${metalById(config.metal).karat} ${metalById(config.metal).label}`,
      `• Fit: ${fit.label} (${fit.size})`,
    );
  } else {
    lines.push(
      `• Setting: ${settingById(config.setting).label}`,
      `• Metal: ${metalById(config.metal).karat} ${metalById(config.metal).label}`,
      `• Stone: ${config.carat.toFixed(1)} ct ${cutById(config.cut).label} ${gemById(config.gem).label}`,
    );
  }
  if (config.engraving) lines.push(`• Engraving: "${config.engraving}"`);
  lines.push(`• Estimated from: $${estimatePrice(config).toLocaleString("en-US")}`);
  return lines.join("\n");
}

/** Build the image-generation prompt for the configured piece. */
export function buildJewelPrompt(config: RingConfig): string {
  const piece = pieceById(config.piece);
  const setting = settingById(config.setting);
  const metal = metalById(config.metal);
  const gem = gemById(config.gem);
  const cut = cutById(config.cut);
  const settingPrompt =
    config.piece === "necklace" ? setting.necklacePrompt ?? setting.prompt : setting.prompt;

  const subject = {
    ring: [
      `a single engagement ring.`,
      `The ring features ${settingPrompt}.`,
      `The band is crafted from ${metal.prompt}.`,
    ],
    necklace: [
      `a single pendant necklace on a fine cable chain.`,
      `The pendant presents ${settingPrompt}, hanging from a delicate bail.`,
      `The chain, bail and pendant are all crafted from ${metal.prompt}.`,
    ],
    bracelet: [
      // bracelets are pure metalwork — no stone in the composition
      `${braceletStyleById(config.braceletStyle).prompt}.`,
      `The entire bracelet is crafted from ${metal.prompt}, with no gemstones.`,
    ],
  }[config.piece];

  const focus =
    config.piece === "bracelet"
      ? [
          `Photorealistic macro studio photography, razor-sharp focus on the metalwork, high-end jewelry catalog style,`,
          `three-quarter hero angle showing the full sweep of the bracelet and the texture of its surface, delicate light along every polished edge.`,
        ]
      : [
          `The center stone is a ${config.carat.toFixed(1)} carat ${cut.prompt} ${gem.prompt}.`,
          `Photorealistic macro studio photography, razor-sharp focus on the center stone, high-end jewelry catalog style,`,
          `three-quarter hero angle showing both the stone and the full sweep of the ${piece.noun}, delicate sparkle highlights on every facet.`,
        ];

  return [
    `Ultra-detailed professional luxury jewelry product photograph of ${subject.join(" ")}`,
    ...focus,
    config.engraving
      ? `A subtle engraving reading "${config.engraving}" is faintly visible ${piece.engravingSpot}.`
      : "",
    `The ${piece.noun} is completely isolated on a pure seamless solid white (#FFFFFF) background —`,
    `no props, no fabric, no shadows cast on visible surfaces, no reflections of an environment, no hands, no text, no watermark, nothing else in frame.`,
  ]
    .filter(Boolean)
    .join(" ");
}
