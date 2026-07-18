export type ArticleSection = {
  heading: string;
  paragraphs: string[];
  list?: string[];
};

export type Article = {
  slug: string;
  title: string;
  seoTitle: string;
  description: string;
  category: string;
  date: string; // ISO
  displayDate: string;
  readTime: string;
  heroImage: string;
  heroAlt: string;
  intro: string[];
  sections: ArticleSection[];
  closing: string;
};

export const ARTICLES: Article[] = [
  {
    slug: "ceylon-sapphire-engagement-ring-singapore",
    title: "How to Judge a Ceylon Sapphire Like a Gemologist",
    seoTitle: "How to Judge a Ceylon Sapphire's Quality — A Gemologist's Method",
    description:
      "A gemologist's method for evaluating a Ceylon sapphire before you buy: judging hue, tone and saturation, spotting windows and zoning, and weighing colour against carat.",
    category: "Buying Guide",
    date: "2026-07-02",
    displayDate: "2 July 2026",
    readTime: "6 min read",
    heroImage: "/journal/journal-sapphire-ring.png",
    heroAlt:
      "Bespoke cushion-cut Ceylon blue sapphire ring with a diamond halo, presented in a Ceylon Gem Maison box",
    intro: [
      "More couples in Singapore are stepping away from the expected and choosing a sapphire to mark their engagement — and few stones carry the pedigree of a Ceylon sapphire. Mined in Sri Lanka's famed gem fields, these stones have crowned royal rings for centuries and are prized for a luminous, velvety blue that no laboratory can convincingly imitate.",
      "But buying a sapphire is not like buying a diamond. There is no universal grading scale, colour matters far more than carat, and two stones of identical weight can differ in value many times over. This guide distils what our gemologists tell private clients every week.",
    ],
    sections: [
      {
        heading: "Why Ceylon Sapphires Stand Apart",
        paragraphs: [
          "Sri Lanka — historically Ceylon — has produced sapphires for over two thousand years, and its gem fields around Ratnapura remain among the only sources of fine cornflower-blue stones of significant size. Ceylon sapphires are famed for their bright, medium-toned blue with a soft, velvety saturation. Where stones from other origins can lean inky or overly dark, a fine Ceylon stone stays vivid even in low evening light — exactly the conditions of a candlelit dinner in which an engagement ring should perform.",
        ],
      },
      {
        heading: "Colour First, Carat Second",
        paragraphs: [
          "With sapphires, colour accounts for the majority of a stone's value. Look for three things: hue (a pure blue, or blue with a whisper of violet), tone (not so dark that the stone reads black indoors), and saturation (vivid, without grey or brown masking).",
          "Only after colour should you weigh size. A vivid 1.5-carat stone will always outshine a dull 3-carat one — and because sapphires are denser than diamonds, a sapphire of the same carat weight looks slightly smaller, so judge by millimetre measurements rather than carat alone.",
        ],
      },
      {
        heading: "Cut, Clarity and Certification",
        paragraphs: [
          "Sapphires are cut for colour, not for maximum sparkle, so expect ovals and cushions rather than the strict symmetry of a round brilliant diamond. A well-cut stone returns colour evenly across the face with no washed-out 'window' at its centre.",
          "Insist on a certificate from a recognised independent gemmological laboratory stating origin and whether the stone has been heated. Unheated Ceylon sapphires command a premium; heated stones are entirely legitimate and beautiful, but the treatment must be disclosed. Every stone we set is certified and fully traceable to its source.",
        ],
      },
      {
        heading: "Settings That Flatter a Sapphire",
        paragraphs: [
          "The classic pairing is a diamond halo, which frames the blue and lends the finger presence — the style made famous by royal engagement rings. Three-stone settings flank the sapphire with diamonds for a more architectural look, while a clean solitaire in platinum or white gold lets an exceptional stone speak alone. Yellow and rose gold have returned strongly among our Singapore clients, warming the blue beautifully.",
        ],
      },
      {
        heading: "Commissioning Bespoke from Singapore",
        paragraphs: [
          "A bespoke commission is often no more expensive than a comparable boutique piece — you are simply paying for the stone and the craft rather than the retail premium. Our digital atelier lets you compose the ring online: choose the setting, metal, gemstone, cut and carat, and receive an indicative quotation instantly, so you can find the perfect balance between design and budget before speaking to a gemologist.",
          "From confirmation, allow four to six weeks for cutting, setting and finishing, followed by fully insured courier delivery to Singapore with all certification papers.",
        ],
      },
    ],
    closing:
      "A Ceylon sapphire engagement ring is a statement of individuality backed by two millennia of provenance. Choose colour first, insist on certification, and work with a house that controls the stone's journey from mine to setting — and the ring will outlive the moment it marks.",
  },
  {
    slug: "blue-sapphire-vs-diamond-engagement",
    title: "Blue Sapphire vs Diamond: Which Should Crown Your Ring?",
    seoTitle: "Blue Sapphire vs Diamond Engagement Rings — An Honest Comparison",
    description:
      "Durability, rarity, symbolism and price — a jeweller's honest comparison of blue sapphires and diamonds to help Singapore couples choose the right centre stone.",
    category: "Perspective",
    date: "2026-06-18",
    displayDate: "18 June 2026",
    readTime: "5 min read",
    heroImage: "/journal/journal-sapphire-vs-diamond.png",
    heroAlt:
      "A matched suite of blue sapphire and diamond cluster earrings and ring in white gold",
    intro: [
      "It is the quiet question behind many first consultations: must an engagement ring be a diamond? For most of the twentieth century the answer was assumed. Yet for centuries before that, the sapphire — not the diamond — was the stone of devotion, worn by royalty as a pledge of faithfulness.",
      "Both are magnificent choices. The honest answer is that they are different instruments, and the right one depends on what you want the ring to say.",
    ],
    sections: [
      {
        heading: "Durability: Built for a Lifetime, Both",
        paragraphs: [
          "Diamond is the hardest natural material at 10 on the Mohs scale; sapphire sits directly beneath it at 9. In practical terms both will survive decades of daily wear, and both should be professionally cleaned and inspected periodically. Only diamond can scratch sapphire — which is why we advise storing them apart.",
        ],
      },
      {
        heading: "Character: Fire versus Depth",
        paragraphs: [
          "A diamond performs with brilliance — white light returned in flashes of fire. A sapphire performs with colour: a deep, saturated blue that shifts subtly from daylight to candlelight. If you want a ring that announces itself across a room, the diamond is unmatched. If you want a ring people lean closer to look into, the sapphire wins.",
        ],
      },
      {
        heading: "Rarity and Value",
        paragraphs: [
          "Fine sapphires are considerably rarer than gem-quality diamonds, yet they typically cost meaningfully less per carat — a quirk of market history rather than merit. A vivid Ceylon sapphire allows a larger, more characterful centre stone at a given budget, or frees budget for finer craftsmanship in the setting.",
          "Unheated stones of fine colour have also shown enduring collectability: they are bought for love and kept for generations.",
        ],
      },
      {
        heading: "Symbolism",
        paragraphs: [
          "The sapphire has been the stone of sincerity and fidelity since antiquity — the reason it appears in some of the world's most famous engagement rings. The diamond's symbolism of permanence is more modern but no less real. Some of our favourite commissions refuse to choose: a sapphire centre within a diamond halo carries both meanings at once.",
        ],
      },
      {
        heading: "The Practical Verdict",
        paragraphs: [
          "Choose a diamond if maximum brilliance and tradition matter most. Choose a sapphire if colour, individuality and value speak to you. Choose both — sapphire heart, diamond frame — if you want the ring that history's romantics would have chosen.",
        ],
      },
    ],
    closing:
      "There is no wrong answer — only the stone that feels inevitable when you finally see it on the hand. Sit with both under honest light, and the ring will choose itself.",
  },
  {
    slug: "ethically-sourced-gemstones-journey",
    title: "From Ratnapura to Singapore: The Journey of an Ethical Gem",
    seoTitle: "How Ethically Sourced Ceylon Gemstones Reach Singapore",
    description:
      "Follow a Ceylon sapphire's journey from Sri Lanka's artisanal gem fields through cutting, certification and export to a finished bespoke piece delivered in Singapore.",
    category: "Provenance",
    date: "2026-06-05",
    displayDate: "5 June 2026",
    readTime: "6 min read",
    heroImage: "/journal/journal-ethical-journey.png",
    heroAlt:
      "Handcrafted rose gold pendant set with pavé diamonds, photographed in the atelier",
    intro: [
      "Every gemstone that leaves our atelier can answer a question most jewellery cannot: where, exactly, did you come from? Traceability is not a marketing line — it is the entire architecture of how we source, cut and export stones, refined over years of supplying world-class gemstones to discerning markets in the West and now to Singapore.",
      "This is the journey of a single stone, from pit to presentation box.",
    ],
    sections: [
      {
        heading: "The City of Gems",
        paragraphs: [
          "Ratnapura — literally 'City of Gems' in Sinhala — sits in a river valley whose gravels have yielded sapphires, rubies and cat's eyes for over two thousand years. Unlike industrial-scale mining elsewhere, Sri Lankan gem mining remains largely artisanal: small licensed pits worked by hand, regulated by the state, with mechanised extraction heavily restricted. The result is one of the lowest-impact gem industries on earth — and livelihoods that stay in the community.",
        ],
      },
      {
        heading: "Buying at the Source",
        paragraphs: [
          "Our gemologists buy rough and freshly cut stones directly at source — at the pit and in the morning gem markets — never from anonymous parcels of mixed origin. Buying at source does two things: it guarantees the stone's provenance from the first transaction, and it ensures the miner, not a chain of intermediaries, captures fair value.",
        ],
      },
      {
        heading: "The Cutter's Bench",
        paragraphs: [
          "A rough sapphire reveals its colour only once, and a hurried cut can waste both carats and character. Each stone is studied, oriented for colour, then cut and polished by hand. It is then submitted to an independent gemmological laboratory for certification of identity, origin and any treatment — the paperwork that accompanies the stone for the rest of its life, meeting the international quality standards our export clients have relied on for years.",
        ],
      },
      {
        heading: "Export, Legally and Transparently",
        paragraphs: [
          "Sri Lanka maintains a formal gem export regime, and every stone we ship travels with export authorisation and its certificate — a documented chain of custody from mine to maison. This is the discipline of years spent exporting to exacting Western buyers, applied to every private client.",
        ],
      },
      {
        heading: "Arriving in Singapore",
        paragraphs: [
          "The finished piece — designed with you through our digital atelier or in private consultation — is delivered to Singapore by fully insured courier, with certification, valuation documents and our lifetime warranty. You receive not just a jewel but its entire biography.",
          "When you wear a stone whose journey you can trace, provenance stops being an abstraction. It becomes part of the story you are giving.",
        ],
      },
    ],
    closing:
      "Ethical sourcing is ultimately a question you should be able to ask any jeweller: show me the journey. We built the maison so the answer is always yes.",
  },
];

export function getArticle(slug: string): Article | undefined {
  return ARTICLES.find((a) => a.slug === slug);
}
