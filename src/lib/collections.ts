/** The maison's collection pieces, shared by the collections gallery and enquiry flows. */

export type Category = "Rings" | "Necklaces" | "Earrings" | "Bracelets";

export type Piece = {
  slug: string;
  name: string;
  category: Category;
  image: string;
  description: string;
  /** Short materials / gem line shown under the name. */
  notes: string;
};

export const CATEGORIES: Category[] = [
  "Rings",
  "Necklaces",
  "Earrings",
  "Bracelets",
];

export const PIECES: Piece[] = [
  {
    slug: "celeste-diamond-ring",
    name: "Celeste Diamond Ring",
    category: "Rings",
    image: "/ring_celeste.png",
    description:
      "A cathedral-set round brilliant lifted high above a tapering band, cut to gather every light in the room.",
    notes: "18k Gold · Round Brilliant · D–F, VS",
  },
  {
    slug: "eternal-bloom-ring",
    name: "Eternal Bloom Ring",
    category: "Rings",
    image: "/ring_eternal.png",
    description:
      "Petals of pavé diamonds unfold around a centre stone — a bloom caught at the exact moment of opening.",
    notes: "18k Gold · Pavé Halo · Conflict-free",
  },
  {
    slug: "celest-gold-charm",
    name: "Celest Gold Charm",
    category: "Necklaces",
    image: "/necklace_celest.png",
    description:
      "A hand-polished charm on a whisper-fine chain, weighted to rest exactly at the collarbone.",
    notes: "18k Gold · Hand-polished · Adjustable 40–45cm",
  },
  {
    slug: "aurea-diamond-drops",
    name: "Aurea Diamond Drops",
    category: "Earrings",
    image: "/earring_aurea.png",
    description:
      "Articulated drops that move with the wearer, each stone set by eye to catch light mid-motion.",
    notes: "18k Gold · Articulated Drop · Ceylon-cut",
  },
  {
    slug: "golden-drop-earrings",
    name: "Golden Drop Earrings",
    category: "Earrings",
    image: "/earring_golden.png",
    description:
      "Sculpted teardrops of solid gold, burnished to a mirror finish in the Colombo workshop.",
    notes: "18k Gold · Mirror Finish · Handmade",
  },
  {
    slug: "stellar-link-bracelet",
    name: "Stellar Link Bracelet",
    category: "Bracelets",
    image: "/bracelet_stellar.png",
    description:
      "Interlocking links graded by hand so the bracelet drapes — never hangs — around the wrist.",
    notes: "18k Gold · Graduated Links · Secure Clasp",
  },
  {
    slug: "golden-maison-band",
    name: "Golden Maison Band",
    category: "Bracelets",
    image: "/bracelet_aura.png",
    description:
      "The house band: a seamless cuff drawn from a single grain of gold, worn alone or stacked.",
    notes: "18k Gold · Seamless Cuff · House Signature",
  },
];
