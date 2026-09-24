import { roundQuote } from "@/lib/cost-formula";

/**
 * Shared model for the Bespoke Atelier jewellery configurator.
 * Used by the interactive form, the WebGL preview and the
 * /api/generate-ring route so every surface agrees on the options.
 *
 * The ring settings mirror the Maison's "Classic Engagement Ring Styles"
 * chart (14 silhouettes — see the note above SETTINGS for the four the house
 * retired) and the bracelets mirror the "5 Simple Sapphire
 * Bracelet Designs" chart — clients pick the standardised design, then
 * change metal, stone shape, stone colour and carat within atelier limits.
 */

export type PieceId = "ring" | "necklace" | "bracelet";
export type SettingId =
  | "solitaire"
  | "tension"
  | "pave"
  | "channel"
  | "bezel"
  | "halo"
  | "double-halo"
  | "split-shank"
  | "cathedral"
  | "vintage"
  | "milgrain"
  | "bypass"
  | "flush"
  | "signet";
/**
 * The unsuffixed gold ids are 18K and keep their original names, so every saved
 * design and craft request still resolves; 14K was added (Sept 2026) because the
 * client prices gold by karat and a karat nobody can choose is a price nobody
 * pays.
 */
export type MetalId =
  | "yellow-gold"
  | "rose-gold"
  | "white-gold"
  | "yellow-gold-14k"
  | "rose-gold-14k"
  | "white-gold-14k"
  | "platinum";
export type GemId = "diamond" | "ruby" | "sapphire" | "emerald" | "amethyst" | "aquamarine";
export type CutId = "round" | "princess" | "oval" | "emerald" | "marquise" | "pear";
export type BraceletStyleId = "single" | "tennis" | "station" | "bar" | "mixed";
export type PendantStyleId = "bezel" | "prong" | "pear-drop" | "bar" | "solitaire-drop";
export type FitId = "slender" | "classic" | "generous";

export interface RingConfig {
  piece: PieceId;
  setting: SettingId;
  metal: MetalId;
  gem: GemId;
  cut: CutId;
  /** Rings/necklaces: centre-stone carat. Bracelets: carat PER STONE. */
  carat: number;
  engraving: string;
  braceletStyle: BraceletStyleId;
  /** Necklaces are pendant-led — the design fixes the stone shape. */
  pendantStyle: PendantStyleId;
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
  braceletStyle: "tennis",
  pendantStyle: "bezel",
  fit: "classic",
};

/* ---------- carat rules & the private-appointment threshold ---------- */

export interface CaratRule {
  min: number;
  max: number;
  step: number;
  /** Above this weight the commission moves to a private appointment. */
  cap: number;
}

/** Bracelets are per-stone; rings and necklaces are the centre stone. */
export const CARAT_RULES: Record<PieceId, CaratRule> = {
  ring: { min: 0.5, max: 3.0, step: 0.1, cap: 1.5 },
  necklace: { min: 0.5, max: 3.0, step: 0.1, cap: 1.5 },
  bracelet: { min: 0.1, max: 1.0, step: 0.05, cap: 0.5 },
};

export const caratRuleFor = (piece: PieceId): CaratRule => CARAT_RULES[piece];

/** True when the chosen weight exceeds the standard atelier limit. */
export const isAppointmentCarat = (config: RingConfig): boolean =>
  config.carat > caratRuleFor(config.piece).cap + 1e-9;

export interface PieceOption {
  id: PieceId;
  label: string;
  tagline: string;
  description: string;
  /** Lowercase noun for sentences ("your ring"). */
  noun: string;
  /** Where the hidden engraving lives — used in UI copy and the AI prompt. */
  engravingSpot: string;
}

export const PIECES: PieceOption[] = [
  {
    id: "ring",
    label: "The Ring",
    tagline: "Worn closest, forever",
    description: "A crown for the hand — engagement, promise, or a gift to yourself.",
    noun: "ring",
    engravingSpot: "on the inner surface of the band",
  },
  {
    id: "necklace",
    label: "The Necklace",
    tagline: "Light at the collarbone",
    description: "A pendant suspended on a fine chain — the stone rests at the heart.",
    noun: "necklace",
    engravingSpot: "on the small clasp tag of the chain",
  },
  {
    id: "bracelet",
    label: "The Bracelet",
    tagline: "A circle of presence",
    description: "Stone-set designs for the wrist — from one bezel-set gem to a full line of light.",
    noun: "bracelet",
    engravingSpot: "on the polished clasp tag",
  },
];

/* ---------- bracelet designs (the five standardised silhouettes) ---------- */

export interface BraceletStyleOption {
  id: BraceletStyleId;
  label: string;
  tagline: string;
  /** The chart's caption, generalised so any gem colour reads correctly. */
  description: string;
  /**
   * Prompt fragment for the AI render. "{stones}" is replaced with the
   * client's per-stone carat, cut and gem (e.g. "0.5 carat round Ceylon sapphires");
   * "{alt}" (Mixed Shape only) with the second shape in the same gem.
   */
  prompt: string;
  /** How many stones the design carries — drives pricing and the 3D preview. */
  stoneCount: number;
}

export const BRACELET_STYLES: BraceletStyleOption[] = [
  {
    id: "single",
    label: "Bezel Set Single",
    tagline: "One stone, one chain",
    description: "A single stone in a sleek bezel setting on a delicate chain.",
    prompt:
      "a delicate fine cable-chain bracelet centred on a single {stones} held in a sleek round polished bezel setting",
    stoneCount: 1,
  },
  {
    id: "tennis",
    label: "Tennis Bracelet",
    tagline: "An unbroken line of light",
    description: "A classic line of stones in prong settings for timeless elegance.",
    prompt:
      "a classic tennis bracelet — one continuous flexible line of {stones}, each stone held in its own four-prong setting",
    stoneCount: 38,
  },
  {
    id: "station",
    label: "Station Bracelet",
    tagline: "Points along a fine line",
    description: "Multiple bezel-set stones spaced along a fine chain.",
    prompt:
      "a station bracelet — three bezel-set {stones} spaced along the front of a delicate fine cable chain",
    stoneCount: 3,
  },
  {
    id: "bar",
    label: "Bar Bracelet",
    tagline: "Sleek, modern, linear",
    description: "A row of stones set in a slim bar for a sleek and modern look.",
    prompt:
      "a bar bracelet — a slim polished horizontal bar channel-set with a neat row of {stones}, suspended between two fine chains",
    stoneCount: 13,
  },
  {
    id: "mixed",
    label: "Mixed Shape",
    tagline: "Two shapes, one rhythm",
    description: "Alternating round and marquise stones for a subtle touch of interest.",
    prompt:
      "a delicate fine chain bracelet with four spaced bezel-set stones alternating between {alt} lying lengthwise along the chain and {stones}",
    stoneCount: 4,
  },
];

/* ---------- pendant designs (the five standardised silhouettes) ----------
   The design IS the shape: each pendant locks its signature cut, exactly as
   drawn on the Maison's pendant chart. Clients still choose metal and colour. */

export interface PendantStyleOption {
  id: PendantStyleId;
  label: string;
  tagline: string;
  /** The chart's caption, generalised so any gem colour reads correctly. */
  description: string;
  /** Prompt fragment for the AI render — shape and setting language baked in. */
  prompt: string;
  /** The signature stone shape this design is drawn around. */
  cut: CutId;
}

export const PENDANT_STYLES: PendantStyleOption[] = [
  {
    id: "bezel",
    label: "Bezel Set",
    tagline: "Clean, modern, rimmed in metal",
    description: "A single round stone in a bezel setting for a clean and modern look.",
    prompt:
      "a single round stone fully encircled by a smooth polished round bezel rim, hanging from a small round bail loop",
    cut: "round",
  },
  {
    id: "prong",
    label: "Prong Set",
    tagline: "Four claws, full brilliance",
    description:
      "An oval stone in a classic four-prong setting that highlights the stone's natural brilliance.",
    prompt:
      "an upright oval stone held in a classic four-prong claw setting beneath a gracefully tapered bail",
    cut: "oval",
  },
  {
    id: "pear-drop",
    label: "Pear Drop",
    tagline: "A single drop of light",
    description: "A pear-shaped stone with a delicate setting for an elegant and feminine touch.",
    prompt:
      "a pear-shaped stone hanging point-up in a delicate three-prong setting beneath a slender tapered bail",
    cut: "pear",
  },
  {
    id: "bar",
    label: "Bar Set",
    tagline: "Minimal, sleek, architectural",
    description:
      "A rectangular stone set in a minimal bar design for a sleek and contemporary style.",
    prompt:
      "an upright rectangular step-cut stone held in a minimal bar setting that grips only its top and bottom edges, beneath a sleek flat bail",
    cut: "emerald",
  },
  {
    id: "solitaire-drop",
    label: "Solitaire Drop",
    tagline: "Small, subtle, timeless",
    description:
      "A small round stone with a subtle drop design for a timeless and versatile look.",
    prompt:
      "a small round stone in a tiny three-prong martini setting hanging from an elongated drop bail",
    cut: "round",
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

/* ---------- ring settings (the fourteen classic silhouettes) ----------

   Three Stone, Trilogy, Toi et Moi and Stackable were retired from the atelier
   at the client's request (Sept 2026). Nothing else has to move with them:
   sanitizeConfig() lands any stale id on Solitaire, and getCraftingPrices()
   skips the crafting_prices rows they leave behind, so no migration is needed.
   The WebGL parts they were built from (flanking and graduated side stones, the
   toi-et-moi pair, the thin eternity band) stay in BespokeJewel3D as a parts
   library — delete them only if these styles are certain never to return. */

/** How the WebGL preview assembles the silhouette from shared parts. */
export interface SettingThree {
  head: "prong" | "bezel" | "flush" | "tension" | "none";
  halos?: 0 | 1 | 2;
  sides?: "none" | "flank" | "graduated" | "toi";
  accents?: ("pave" | "channel" | "milgrain" | "eternity")[];
  band?: "round" | "wide" | "open" | "split" | "cathedral" | "bypass" | "signet" | "thin";
}

export interface SettingOption {
  id: SettingId;
  label: string;
  tagline: string;
  /** The chart's caption — kept word-for-word where possible. */
  description: string;
  /** Prompt fragment describing the setting for the AI render. */
  prompt: string;
  three: SettingThree;
}

export const SETTINGS: SettingOption[] = [
  {
    id: "solitaire",
    label: "Solitaire",
    tagline: "One stone, undivided light",
    description: "A single center stone on a plain band.",
    prompt:
      "a classic solitaire setting — the single center stone raised on a plain polished band in a delicate prong crown",
    three: { head: "prong" },
  },
  {
    id: "tension",
    label: "Tension",
    tagline: "Held by force alone",
    description: "The stone is held securely by the tension of the band.",
    prompt:
      "a modern tension setting — the center stone gripped in mid-air between the two open ends of a sleek broad band, appearing to float with no prongs",
    three: { head: "tension", band: "open" },
  },
  {
    id: "pave",
    label: "Pavé",
    tagline: "A band paved in starlight",
    description: "Small diamonds set closely together along the band.",
    prompt:
      "a pavé setting — the shoulders of the band micro-set with a continuous run of tiny sparkling accent diamonds",
    three: { head: "prong", accents: ["pave"] },
  },
  {
    id: "channel",
    label: "Channel Set",
    tagline: "Light, recessed in metal",
    description: "Diamonds are set into a channel within the band.",
    prompt:
      "a channel setting — a neat row of small accent diamonds recessed into a smooth channel cut within the band, flush between two polished metal rails",
    three: { head: "prong", accents: ["channel"] },
  },
  {
    id: "bezel",
    label: "Bezel Set",
    tagline: "Rimmed in precious metal",
    description: "The stone is surrounded by a metal rim.",
    prompt:
      "a bezel setting — the center stone fully encircled by a smooth polished metal rim on a clean band",
    three: { head: "bezel" },
  },
  {
    id: "halo",
    label: "Halo",
    tagline: "A crown of micro-diamonds",
    description: "A circle of small diamonds surrounds the center stone.",
    prompt:
      "a halo setting — the center stone encircled by a sparkling ring of small pavé micro-diamonds",
    three: { head: "prong", halos: 1 },
  },
  {
    id: "double-halo",
    label: "Double Halo",
    tagline: "Twice-crowned brilliance",
    description: "Two halos of diamonds surround the center stone.",
    prompt:
      "a double-halo setting — the center stone encircled by two concentric sparkling rings of small pavé micro-diamonds",
    three: { head: "prong", halos: 2 },
  },
  {
    id: "split-shank",
    label: "Split Shank",
    tagline: "Two paths to one stone",
    description: "The band splits into two as it approaches the stone.",
    prompt:
      "a split-shank setting — the band dividing into two slender parallel strands as it rises toward the center stone",
    three: { head: "prong", band: "split" },
  },
  {
    id: "cathedral",
    label: "Cathedral",
    tagline: "Arched toward the light",
    description: "Arched supports elevate the center stone.",
    prompt:
      "a cathedral setting — graceful arched supports rising from the shoulders of the band to elevate the center stone high above it",
    three: { head: "prong", band: "cathedral" },
  },
  {
    id: "vintage",
    label: "Vintage / Antique",
    tagline: "An heirloom, newly made",
    description: "Intricate detailing inspired by vintage eras.",
    prompt:
      "a vintage antique-style setting — intricate filigree scrollwork, milgrain-beaded edges and tiny accent diamonds in an ornate old-world design",
    three: { head: "prong", accents: ["milgrain", "pave"] },
  },
  {
    id: "milgrain",
    label: "Milgrain",
    tagline: "Beaded, whisper-fine edges",
    description: "Tiny beaded edges add a vintage-inspired touch.",
    prompt:
      "a milgrain setting — the edges of the band finished with rows of tiny hand-beaded milgrain detail framing the center stone",
    three: { head: "prong", accents: ["milgrain"] },
  },
  {
    id: "bypass",
    label: "Bypass",
    tagline: "A current around the stone",
    description: "The band curves around the center stone.",
    prompt:
      "a bypass setting — the two ends of the band sweeping past each other in a graceful curve that wraps around the center stone",
    three: { head: "prong", band: "bypass" },
  },
  {
    id: "flush",
    label: "Flush Set",
    tagline: "Set level, worn always",
    description: "The stone is set level with the band.",
    prompt:
      "a flush setting — the stone sunk into a broad domed band so its table sits perfectly level with the polished metal surface",
    three: { head: "flush", band: "wide" },
  },
  {
    id: "signet",
    label: "Signet Style",
    tagline: "Bold, classic, sealed",
    description: "A classic, bold look with a bezel-set stone.",
    prompt:
      "a signet-style ring — a bold classic domed signet form with the stone bezel-set flush into its broad polished face",
    three: { head: "flush", band: "signet" },
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
  },
  {
    id: "rose-gold",
    label: "Rose Gold",
    karat: "18K",
    description: "A romantic blush hue",
    hex3d: 0xe8a586,
    swatch: "radial-gradient(circle at 30% 30%, #f9d3c0, #e2a084 55%, #a5583b)",
    prompt: "romantic polished 18k rose gold with a soft blush tone",
  },
  {
    id: "white-gold",
    label: "White Gold",
    karat: "18K",
    description: "Cool, contemporary sheen",
    hex3d: 0xe8e8e4,
    swatch: "radial-gradient(circle at 30% 30%, #ffffff, #d9dadb 55%, #8f9194)",
    prompt: "bright rhodium-finished 18k white gold",
  },
  /* 14K carries less fine gold (58.5% against 75%), so its yellow and rose read
     a touch paler — the swatches and 3D tints are pulled back to match rather
     than reusing the 18K colours under a different label. */
  {
    id: "yellow-gold-14k",
    label: "Yellow Gold",
    karat: "14K",
    description: "Classic warmth, a lighter touch",
    hex3d: 0xe6cd8c,
    swatch: "radial-gradient(circle at 30% 30%, #f8ecc4, #e0bf6a 55%, #a07a2e)",
    prompt: "polished 14k yellow gold with a soft, slightly paler warmth",
  },
  {
    id: "rose-gold-14k",
    label: "Rose Gold",
    karat: "14K",
    description: "A deeper, coppery blush",
    hex3d: 0xe3a48a,
    swatch: "radial-gradient(circle at 30% 30%, #f7d0bd, #db9a7e 55%, #9c5238)",
    prompt: "polished 14k rose gold with a coppery blush tone",
  },
  {
    id: "white-gold-14k",
    label: "White Gold",
    karat: "14K",
    description: "Crisp and contemporary",
    hex3d: 0xe6e6e1,
    swatch: "radial-gradient(circle at 30% 30%, #ffffff, #d6d7d6 55%, #8c8e90)",
    prompt: "bright rhodium-finished 14k white gold",
  },
  {
    id: "platinum",
    label: "Platinum",
    karat: "950",
    description: "The rarest, forever metal",
    hex3d: 0xd8dcde,
    swatch: "radial-gradient(circle at 30% 30%, #f4f7f8, #c9cfd3 55%, #7e868b)",
    prompt: "dense lustrous 950 platinum with a cool silvery finish",
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
  {
    id: "marquise",
    label: "Marquise",
    facets: "58 facets",
    description: "A pointed ellipse that reads regal and large",
    prompt: "elongated pointed marquise cut",
  },
  {
    id: "pear",
    label: "Pear",
    facets: "58 facets",
    description: "A teardrop — one point, one soft curve",
    prompt: "teardrop pear cut",
  },
];

/* ---------- lookups & helpers ---------- */

export const pieceById = (id: PieceId) => PIECES.find((p) => p.id === id) ?? PIECES[0];
export const settingById = (id: SettingId) => SETTINGS.find((s) => s.id === id) ?? SETTINGS[0];
export const metalById = (id: MetalId) => METALS.find((m) => m.id === id) ?? METALS[0];
export const gemById = (id: GemId) => GEMS.find((g) => g.id === id) ?? GEMS[0];
export const cutById = (id: CutId) => CUTS.find((c) => c.id === id) ?? CUTS[0];
export const braceletStyleById = (id: BraceletStyleId) =>
  BRACELET_STYLES.find((b) => b.id === id) ?? BRACELET_STYLES[0];
export const pendantStyleById = (id: PendantStyleId) =>
  PENDANT_STYLES.find((p) => p.id === id) ?? PENDANT_STYLES[0];
export const fitById = (id: FitId) => FITS.find((f) => f.id === id) ?? FITS[1];

/* ------------------------------------------------------------------ pricing */

/**
 * Every atelier design, by one key per piece: `ring:halo`, `necklace:bezel`,
 * `bracelet:tennis`. Each design carries its own gold weight, labour and
 * mark-up in the back office — the client's "four variables for each design".
 */
export type DesignKey =
  | `ring:${SettingId}`
  | `necklace:${PendantStyleId}`
  | `bracelet:${BraceletStyleId}`;

/** Every design the atelier offers, in the order the back office lists them. */
export const DESIGNS: { key: DesignKey; piece: PieceId; id: string; label: string; stoneCount: number }[] = [
  ...SETTINGS.map((s) => ({
    key: `ring:${s.id}` as DesignKey,
    piece: "ring" as const,
    id: s.id,
    label: s.label,
    stoneCount: 1,
  })),
  ...PENDANT_STYLES.map((p) => ({
    key: `necklace:${p.id}` as DesignKey,
    piece: "necklace" as const,
    id: p.id,
    label: p.label,
    stoneCount: 1,
  })),
  ...BRACELET_STYLES.map((b) => ({
    key: `bracelet:${b.id}` as DesignKey,
    piece: "bracelet" as const,
    id: b.id,
    label: b.label,
    stoneCount: b.stoneCount,
  })),
];

/** The design a configuration is built on — which one depends on the piece. */
export function designKeyFor(config: RingConfig): DesignKey {
  if (config.piece === "bracelet") return `bracelet:${config.braceletStyle}`;
  if (config.piece === "necklace") return `necklace:${config.pendantStyle}`;
  return `ring:${config.setting}`;
}

/** Stones of the chosen carat the piece carries: 1, or the bracelet design's count. */
export function stoneCountFor(config: RingConfig): number {
  return config.piece === "bracelet" ? braceletStyleById(config.braceletStyle).stoneCount : 1;
}

/**
 * The atelier's price list, in RETAIL terms only — built on the server by
 * lib/pricing.ts from the back office's cost figures, then handed to the
 * browser.
 *
 * The cost formula is linear in carat, so every quote is exactly
 *   base[metal] + perCarat[gem] × carat × stones
 * where, for one design,
 *   base     = gold used × gold cost per gram × (1 + mark-up) + labour
 *   perCarat = stone cost per carat × (1 + mark-up)
 * That lets the slider quote live without a server round trip while the page
 * carries no cost price, no gram weight and no mark-up — what a visitor can
 * read out of the page source is a price list, never the house's margins.
 */
export type QuoteTable = Partial<
  Record<DesignKey, { base: Partial<Record<MetalId, number>>; perCarat: Partial<Record<GemId, number>> }>
>;

/**
 * The indicative quotation for a configuration, rounded to the nearest $50.
 *
 * The table is required rather than optional on purpose: the old version fell
 * back to compiled-in figures when a caller forgot to pass the admin's prices,
 * which is how the WhatsApp message came to quote a different number from the
 * screen. Now forgetting it is a type error.
 */
export function estimatePrice(config: RingConfig, quote: QuoteTable): number {
  const design = quote[designKeyFor(config)];
  const base = design?.base[config.metal] ?? 0;
  const perCarat = design?.perCarat[config.gem] ?? 0;
  return roundQuote(base + perCarat * config.carat * stoneCountFor(config));
}

/** Clamp/whitelist an arbitrary payload into a safe RingConfig (used server-side). */
export function sanitizeConfig(input: unknown): RingConfig {
  const body = (typeof input === "object" && input !== null ? input : {}) as Record<string, unknown>;
  const pick = <T extends { id: string }>(list: T[], v: unknown, fallback: string) =>
    (list.some((o) => o.id === v) ? v : fallback) as never;

  const piece = pick(PIECES, body.piece, "ring") as PieceId;
  const rule = caratRuleFor(piece);
  const caratNum = Number(body.carat);
  const carat = Number.isFinite(caratNum)
    ? Math.min(
        rule.max,
        Math.max(rule.min, Math.round(caratNum / rule.step) * rule.step),
      )
    : Math.min(rule.max, Math.max(rule.min, 1.0));

  const engraving =
    typeof body.engraving === "string"
      ? body.engraving.replace(/[^\p{L}\p{N} .,&'\-]/gu, "").slice(0, 28).trim()
      : "";

  const pendantStyle = pick(PENDANT_STYLES, body.pendantStyle, "bezel") as PendantStyleId;
  // The pendant design fixes the necklace's stone shape.
  const cut =
    piece === "necklace"
      ? pendantStyleById(pendantStyle).cut
      : (pick(CUTS, body.cut, "round") as CutId);

  return {
    piece,
    setting: pick(SETTINGS, body.setting, "solitaire"),
    metal: pick(METALS, body.metal, "yellow-gold"),
    gem: pick(GEMS, body.gem, "diamond"),
    cut,
    carat: Math.round(carat * 100) / 100,
    engraving,
    braceletStyle: pick(BRACELET_STYLES, body.braceletStyle, "tennis"),
    pendantStyle,
    fit: pick(FITS, body.fit, "classic"),
  };
}

/** Pre-filled WhatsApp enquiry text for the configured piece. */
/**
 * `quote` must be the same table the screen quoted from, so the figure a
 * visitor sends is the figure they were just shown — the one number a customer
 * will hold the house to. Required, so a caller cannot quietly omit it.
 */
export function buildWhatsAppMessage(config: RingConfig, quote: QuoteTable): string {
  const piece = pieceById(config.piece);
  const overCap = isAppointmentCarat(config);
  const rule = caratRuleFor(config.piece);
  const lines = [
    overCap
      ? `Hello Ceylon Gem Maison! I just designed a bespoke ${piece.noun} on your site and would like to arrange a private appointment:`
      : `Hello Ceylon Gem Maison! I just designed a bespoke ${piece.noun} on your site and would love to enquire:`,
    `• Piece: ${piece.label.replace(/^The /, "")}`,
  ];
  if (config.piece === "bracelet") {
    const style = braceletStyleById(config.braceletStyle);
    const fit = fitById(config.fit);
    lines.push(
      `• Design: ${style.label}`,
      `• Metal: ${metalById(config.metal).karat} ${metalById(config.metal).label}`,
      `• Stones: ${style.stoneCount} × ${config.carat.toFixed(2)} ct ${cutById(config.cut).label} ${gemById(config.gem).label}`,
      `• Fit: ${fit.label} (${fit.size})`,
    );
  } else if (config.piece === "necklace") {
    lines.push(
      `• Pendant: ${pendantStyleById(config.pendantStyle).label}`,
      `• Metal: ${metalById(config.metal).karat} ${metalById(config.metal).label}`,
      `• Stone: ${config.carat.toFixed(1)} ct ${cutById(config.cut).label} ${gemById(config.gem).label}`,
    );
  } else {
    lines.push(
      `• Setting: ${settingById(config.setting).label}`,
      `• Metal: ${metalById(config.metal).karat} ${metalById(config.metal).label}`,
      `• Stone: ${config.carat.toFixed(1)} ct ${cutById(config.cut).label} ${gemById(config.gem).label}`,
    );
  }
  if (config.engraving) lines.push(`• Engraving: "${config.engraving}"`);
  if (overCap) {
    lines.push(
      config.piece === "bracelet"
        ? `• Note: stones above ${rule.cap} ct each exceed the standard collection — I understand this becomes a private appointment.`
        : `• Note: a centre stone above ${rule.cap} ct exceeds the standard collection — I understand this becomes a private appointment.`,
      `• Estimate: by private consultation at the atelier`,
    );
  } else if (config.piece === "bracelet") {
    // Bracelets are priced by consultation — no figure anywhere the visitor sees.
    lines.push(`• Estimate: by consultation`);
  } else {
    lines.push(`• Estimated from: $${estimatePrice(config, quote).toLocaleString("en-US")}`);
  }
  return lines.join("\n");
}

/** Build the image-generation prompt for the configured piece. */
export function buildJewelPrompt(config: RingConfig): string {
  const piece = pieceById(config.piece);
  const setting = settingById(config.setting);
  const metal = metalById(config.metal);
  const gem = gemById(config.gem);
  const cut = cutById(config.cut);

  const subject = {
    ring: [
      `a single engagement ring.`,
      `The ring features ${setting.prompt}.`,
      `The band is crafted from ${metal.prompt}.`,
    ],
    necklace: [
      `a single pendant necklace on a delicate fine cable chain.`,
      `The pendant presents ${pendantStyleById(config.pendantStyle).prompt}.`,
      `The chain, bail and pendant setting are all crafted from ${metal.prompt}.`,
    ],
    bracelet: [
      // stone-set designs: the style template names its own stones
      `${(() => {
        const style = braceletStyleById(config.braceletStyle);
        const stones = `${config.carat.toFixed(2)} carat ${cut.prompt} ${gem.prompt}${style.stoneCount === 1 ? "" : " stones"}`;
        // Mixed Shape pairs the client's cut with a second shape in the same
        // gem — marquise, or round when marquise is the chosen cut (as in 3D).
        const alt = `${cutById(config.cut === "marquise" ? "round" : "marquise").prompt} ${gem.prompt} stones`;
        return style.prompt.replace("{stones}", stones).replace("{alt}", alt);
      })()}.`,
      `All the metalwork — chain, settings and clasp — is crafted from ${metal.prompt}.`,
    ],
  }[config.piece];

  const focus =
    config.piece === "bracelet"
      ? [
          `Photorealistic macro studio photography, razor-sharp focus on the gemstones and settings, high-end jewelry catalog style,`,
          `three-quarter hero angle showing the full sweep of the bracelet, delicate sparkle highlights on every stone and polished edge.`,
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
