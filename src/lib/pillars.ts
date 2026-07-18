/**
 * Pillar-page content library.
 *
 * Each entry is one SEO pillar page targeting exactly ONE primary key phrase.
 * The angles are deliberately non-overlapping so no two pages compete for the
 * same query (no keyword cannibalization):
 *
 *  ceylon-sapphire-engagement-ring-singapore  → flagship engagement BUYING GUIDE
 *  ceylon-sapphire-ring-singapore             → CATEGORY page (all ring types/colours)
 *  bespoke-sapphire-engagement-ring-singapore → the bespoke PROCESS / service
 *  blue-sapphire-engagement-ring-singapore    → COLOUR authority (blue shades)
 *  sri-lankan-sapphire-ring-singapore         → ORIGIN / provenance / ethics
 *  custom-sapphire-ring-singapore             → CUSTOMISATION options & routes
 *  design-your-own-sapphire-ring-singapore    → the ONLINE design studio
 *  natural-blue-sapphire-ring-singapore       → AUTHENTICITY / certification / value
 *
 * Paragraph strings support inline links with [label](/path) syntax; the
 * template renders them as <Link>. Pages are pure server components.
 */

export type PillarSection = {
  id: string;
  heading: string;
  paragraphs?: string[];
  list?: string[];
  table?: { caption?: string; headers: string[]; rows: string[][] };
  /** Commentary rendered after the table (for sections where the table leads). */
  paragraphsAfter?: string[];
};

export type PillarFaq = { q: string; a: string };

export type Pillar = {
  slug: string;
  keyword: string;
  title: string;
  description: string;
  eyebrow: string;
  h1Top: string;
  h1Accent: string;
  subtitle: string;
  intro: string[];
  image: { src: string; alt: string };
  sections: PillarSection[];
  faqs: PillarFaq[];
  related: { slug: string; label: string; blurb: string }[];
  ctaHeading: string;
  ctaBody: string;
};

export const PILLARS: Pillar[] = [
  /* ------------------------------------------------------------------ */
  /* 1 · Ceylon sapphire engagement ring Singapore — flagship guide      */
  /* ------------------------------------------------------------------ */
  {
    slug: "ceylon-sapphire-engagement-ring-singapore",
    keyword: "Ceylon sapphire engagement ring Singapore",
    title: "Ceylon Sapphire Engagement Rings in Singapore — Buyer's Guide",
    description:
      "The complete guide to buying a Ceylon sapphire engagement ring in Singapore: colours, the sapphire 4Cs, settings, certified stones, indicative SGD prices and how to commission yours.",
    eyebrow: "The Definitive Guide",
    h1Top: "Ceylon Sapphire Engagement Rings",
    h1Accent: "in Singapore",
    subtitle:
      "Everything you need to choose a Ceylon sapphire engagement ring with confidence — from colour and certification to settings, prices and the commissioning journey.",
    intro: [
      "A Ceylon sapphire engagement ring carries something a diamond alone cannot: a colour with a birthplace. The island once called Ceylon — today's Sri Lanka — has produced the world's most luminous blue sapphires for over two thousand years, and a ring built around one is as individual as the person who wears it.",
      "At Ceylon Gem Maison, we source these sapphires ethically at origin, cut them by hand, and set them for Singapore couples in our own atelier. This guide distils what we tell clients at every private consultation — so that whether you commission with us or elsewhere, you choose well.",
    ],
    image: {
      src: "/ring_model.png",
      alt: "Ceylon sapphire engagement ring with diamond accents, crafted in Singapore by Ceylon Gem Maison",
    },
    sections: [
      {
        id: "why-ceylon",
        heading: "Why a Ceylon sapphire for an engagement ring",
        paragraphs: [
          "Sapphires from Sri Lanka are prized for a very specific look: a bright, lively blue with high transparency, often described as cornflower or royal blue. Where sapphires from some origins can appear inky or over-dark indoors, a fine Ceylon stone keeps its light — it reads vividly blue across candlelight, office lighting and Singapore's fierce midday sun.",
          "Practicality matters just as much for a ring worn every day. Sapphire is a 9 on the Mohs hardness scale — second only to diamond among natural gems — so it shrugs off the knocks of daily wear and holds a polish for decades. Between durability, colour and the romance of a traceable origin, it is no accident that some of the world's most famous engagement rings are built around this stone.",
          "For the full story of where these gems come from and how they reach Singapore, read our dedicated guide to [Sri Lankan sapphire rings](/sri-lankan-sapphire-ring-singapore).",
        ],
      },
      {
        id: "choosing-colour",
        heading: "Choosing your blue — and beyond",
        paragraphs: [
          "Colour drives more of a sapphire's beauty (and price) than any other factor. Royal blue is deep, saturated and formal; cornflower blue is softer and more luminous; violet-blue leans romantic; and paler ice blues sparkle with an almost aquamarine freshness. There is no objectively 'best' shade — there is the shade that suits the wearer's hand, wardrobe and taste.",
          "Ceylon sapphires also come in colours beyond blue: soft pinks, sunny yellows, whites, and the fabled lotus-hued padparadscha. If the ring is for someone whose style is anything but conventional, a coloured sapphire makes an unforgettable centre stone.",
          "For a deep dive into blue shades, lighting behaviour and which metals flatter each tone, see our guide to [blue sapphire engagement rings](/blue-sapphire-engagement-ring-singapore).",
        ],
      },
      {
        id: "sapphire-4cs",
        heading: "The sapphire 4Cs — judged differently from diamonds",
        paragraphs: [
          "Diamond buyers memorise the 4Cs in a set order; sapphire buyers should re-rank them. With sapphires, colour is overwhelmingly first: an evenly saturated, vivid stone of medium tone commands more than a larger stone of washed-out or over-dark colour.",
        ],
        list: [
          "Colour — look for even saturation without dark 'extinction' zones or washed-out windows. Vivid medium tones are the sweet spot.",
          "Clarity — sapphires are 'Type II' gems: minor silk-like inclusions are normal and can even improve colour. Eye-clean is the standard, not loupe-clean.",
          "Cut — sapphires are cut for colour, not calibrated symmetry. A well-cut stone returns colour across the whole face; avoid stones with a see-through 'window' at the centre.",
          "Carat — sapphires are denser than diamonds, so a 1-carat sapphire looks slightly smaller than a 1-carat diamond. Judge by millimetre size on the hand, not carat alone.",
        ],
      },
      {
        id: "settings-metals",
        heading: "Settings and metals that flatter a sapphire",
        paragraphs: [
          "The classic pairing is a blue sapphire in a diamond halo — the surrounding white fire makes the blue read even more saturated. A solitaire on a fine band is the most modern, letting the stone speak alone; a trilogy (sapphire flanked by two diamonds) symbolises past, present and future and remains the most-commissioned style in our Singapore atelier.",
          "On metal: platinum and 18k white gold cool and brighten a blue stone; 18k yellow gold gives a regal, vintage warmth; rose gold flatters violet-leaning blues and pink sapphires beautifully. Prong settings show the most light; bezels offer the most protection for active hands.",
        ],
      },
      {
        id: "price-guide",
        heading: "What a Ceylon sapphire engagement ring costs in Singapore",
        paragraphs: [
          "Prices vary enormously with colour grade, treatment status and size — far more than diamonds, which are commodity-priced. The ranges below are an honest indicative guide for a complete ring (certified centre stone plus an 18k gold or platinum diamond-accented setting) to help you set a budget; your exact figure depends on the stone you fall in love with.",
        ],
        table: {
          caption: "Indicative complete-ring pricing (SGD) — final quotes are always stone-specific",
          headers: ["Centre stone", "Typical size", "Indicative ring price (SGD)"],
          rows: [
            ["Fine heated Ceylon blue sapphire", "1.0 – 1.5 ct", "3,500 – 7,500"],
            ["Fine heated Ceylon blue sapphire", "2.0 ct +", "7,000 – 15,000"],
            ["Unheated Ceylon sapphire, certified", "1.0 – 1.5 ct", "6,500 – 15,000"],
            ["Top unheated royal / cornflower blue", "2.0 ct +", "15,000 – 40,000 +"],
          ],
        },
      },
      {
        id: "certification",
        heading: "Certification: never buy blind",
        paragraphs: [
          "Every fine sapphire deserves an independent gemmological report confirming three things: that the stone is natural (not synthetic), what treatment — if any — it has undergone, and, where determinable, its origin. Heating is an accepted, permanent, centuries-old practice and most fine sapphires on the market are heated; what matters is honest disclosure and honest pricing.",
          "Unheated stones with a Ceylon origin opinion command a meaningful premium because they are rarer. We explain how to read a report, what the recognised laboratories are, and how to verify a stone yourself in our companion guide to [natural blue sapphire rings](/natural-blue-sapphire-ring-singapore).",
        ],
      },
      {
        id: "how-to-commission",
        heading: "How to commission yours",
        paragraphs: [
          "There are two ways to create a Ceylon sapphire engagement ring with us. The guided route: a private consultation — in person in Singapore or over video — where we curate loose, certified sapphires to your brief and design around your chosen stone; the full journey is described in our [bespoke sapphire engagement ring](/bespoke-sapphire-engagement-ring-singapore) guide.",
          "The independent route: our [online design atelier](/design-your-own-sapphire-ring-singapore) lets you configure the stone, cut, setting and metal on screen with live 3D and an instant quotation — day or night, no appointment needed.",
          "Either way, every ring is handcrafted, independently certifiable, and delivered fully insured anywhere in Singapore.",
        ],
      },
      {
        id: "buying-in-singapore",
        heading: "Buying in Singapore: what to expect",
        paragraphs: [
          "Singapore is one of Asia's best places to buy a sapphire: a trusted legal system, strong consumer protections, and direct flight lanes to Colombo mean serious houses can work directly with origin. When you buy from a maison that sources at origin, you skip the two or three intermediary margins built into typical retail pricing — which is why an origin-direct ring often costs less than a comparable stone in a mall showcase.",
          "We serve clients across Singapore with private appointments, side-by-side loose-stone viewings, secret ring-size assistance for surprise proposals, and insured doorstep delivery. Begin with a [consultation](/contact) or explore [the collection](/collections) to calibrate your taste.",
        ],
      },
    ],
    faqs: [
      {
        q: "How much does a Ceylon sapphire engagement ring cost in Singapore?",
        a: "As an honest guide: complete rings with a fine heated Ceylon sapphire of around one carat typically start near SGD 3,500–7,500, while certified unheated stones command SGD 6,500 upward, and top royal or cornflower blues above two carats can exceed SGD 15,000–40,000. Because sapphires are individual, we price each ring from its actual stone — our online atelier gives an instant quotation for any configuration.",
      },
      {
        q: "Are sapphires durable enough for everyday engagement rings?",
        a: "Yes. Sapphire measures 9 on the Mohs scale — the hardest natural gemstone after diamond. It resists scratching from virtually everything encountered in daily life and holds its polish for generations, which is precisely why royalty has used it in engagement rings for centuries.",
      },
      {
        q: "Is a heated Ceylon sapphire acceptable for an engagement ring?",
        a: "Absolutely — heating is a permanent, stable, industry-accepted enhancement practised for centuries, and most fine sapphires worldwide are heated. What matters is disclosure: a heated stone should be certified as such and priced accordingly. Unheated stones are rarer and carry a premium for that rarity.",
      },
      {
        q: "How long does it take to make a Ceylon sapphire engagement ring?",
        a: "A typical commission takes four to eight weeks from confirmed design to delivery, depending on stone sourcing and the complexity of the setting. If your proposal date is close, tell us early — express timelines are often possible.",
      },
      {
        q: "Can I view loose sapphires before committing?",
        a: "Yes — comparing two or three certified stones side by side is the single best way to understand colour and value, and we encourage it at every private consultation. You will see how saturation, tone and cut differ at each price point before anything is set.",
      },
      {
        q: "Sapphire or diamond — which is better for an engagement ring?",
        a: "Neither is 'better'; they say different things. A diamond is tradition and pure brilliance; a sapphire adds colour, individuality and — in the case of Ceylon stones — a traceable origin story, usually at a lower price per carat of visual impact. Our journal compares the two in depth to help you decide.",
      },
      {
        q: "Can the ring be resized later?",
        a: "Yes. Most of our settings can be resized by a skilled bench jeweller, and we offer aftercare for every ring we make. If you are proposing as a surprise, we can also advise on discreet ways to establish the ring size beforehand.",
      },
    ],
    related: [
      {
        slug: "bespoke-sapphire-engagement-ring-singapore",
        label: "The Bespoke Journey",
        blurb: "How a bespoke sapphire engagement ring is commissioned, step by step.",
      },
      {
        slug: "blue-sapphire-engagement-ring-singapore",
        label: "Choosing Your Blue",
        blurb: "Royal, cornflower, violet or teal — a complete guide to blue shades.",
      },
      {
        slug: "natural-blue-sapphire-ring-singapore",
        label: "Natural & Certified",
        blurb: "Treatments, laboratory reports and how to verify what you buy.",
      },
      {
        slug: "ceylon-sapphire-ring-singapore",
        label: "Beyond Engagement",
        blurb: "Eternity bands, cocktail rings and every other Ceylon sapphire ring.",
      },
    ],
    ctaHeading: "Begin your Ceylon sapphire engagement ring",
    ctaBody:
      "Design online with live 3D and instant pricing, or book a private consultation in Singapore and let us curate certified stones to your brief.",
  },

  /* ------------------------------------------------------------------ */
  /* 2 · Ceylon sapphire ring Singapore — category page                  */
  /* ------------------------------------------------------------------ */
  {
    slug: "ceylon-sapphire-ring-singapore",
    keyword: "Ceylon sapphire ring Singapore",
    title: "Ceylon Sapphire Rings in Singapore — Styles, Colours & Prices",
    description:
      "Explore every kind of Ceylon sapphire ring available in Singapore — engagement rings, eternity bands, cocktail and anniversary rings, men's designs — across blue, pink, yellow and padparadscha sapphires.",
    eyebrow: "The Complete Collection Guide",
    h1Top: "Ceylon Sapphire Rings",
    h1Accent: "in Singapore",
    subtitle:
      "From heirloom engagement rings to eternity bands, cocktail statements and men's designs — a guide to every Ceylon sapphire ring style, colour and occasion.",
    intro: [
      "A Ceylon sapphire ring is not one thing. The same island that supplies the world's finest blue engagement stones also yields pinks, yellows, whites, colour-shifting teals and the rare padparadscha — and each suits a different ring, a different hand, a different chapter of life.",
      "This guide maps the whole territory: the ring styles Ceylon sapphires are made into, the colours to know, the occasions they mark, and what each route costs in Singapore — whether you choose a finished piece from our collection or create something of your own.",
    ],
    image: {
      src: "/ring_celeste.png",
      alt: "Ceylon sapphire ring from the Ceylon Gem Maison collection in Singapore",
    },
    sections: [
      {
        id: "ring-styles",
        heading: "The ring styles: one stone, many lives",
        paragraphs: [
          "Engagement rings are the best-known home for a Ceylon sapphire — we cover choosing one exhaustively in our [Ceylon sapphire engagement ring guide](/ceylon-sapphire-engagement-ring-singapore) — but they are only the beginning.",
        ],
        list: [
          "Eternity & half-eternity bands — a continuous line of calibrated sapphires, worn alone, as a wedding band, or stacked. Quietly spectacular.",
          "Cocktail & dress rings — larger stones, bolder settings; the ring you build an outfit around. Ceylon yellows and teals excel here.",
          "Anniversary & milestone rings — sapphire is the gemstone of both the 5th and 45th wedding anniversaries, and September's birthstone.",
          "Men's rings — signets and architectural bands with a deep royal blue or teal stone; understated by day, unmistakable up close.",
          "Trilogy and toi-et-moi rings — two- and three-stone designs pairing sapphires with diamonds for contrast and meaning.",
        ],
      },
      {
        id: "colour-spectrum",
        heading: "Beyond blue: the Ceylon colour spectrum",
        paragraphs: [
          "Sri Lanka's gem gravels produce sapphire in almost every colour. Blue remains king — from pale ice through cornflower to royal — but connoisseurs increasingly seek the island's other hues, most of which cost less per carat than comparable blues while being rarer conversation pieces.",
        ],
        list: [
          "Cornflower & royal blue — the classic Ceylon signature; luminous rather than inky.",
          "Padparadscha — the celebrated lotus blend of pink and orange, among the rarest sapphires on earth.",
          "Pink sapphire — from tender blush to vivid magenta; a romantic engagement alternative.",
          "Yellow sapphire — sunlit and optimistic; magnificent in yellow gold cocktail rings.",
          "White sapphire — a diamond-look stone at a fraction of the price.",
          "Teal & parti sapphires — moody, modern, and beloved for unconventional rings.",
        ],
      },
      {
        id: "occasions",
        heading: "Occasions a sapphire ring was made for",
        paragraphs: [
          "September birthdays claim sapphire as their birthstone, and the 5th and 45th wedding anniversaries are traditionally marked with it. Beyond the calendar, clients commission Ceylon sapphire rings for graduations, first promotions, the birth of a child, and — often the most moving — the resetting of an inherited stone into a ring a new generation will actually wear.",
          "Because sapphire is hard enough for daily wear, these are not vault pieces. They are rings for living in.",
        ],
      },
      {
        id: "ways-to-buy",
        heading: "Two ways to own one",
        paragraphs: [
          "The immediate route: our [curated collection](/collections) of finished Ceylon sapphire rings, each built around a stone we selected at origin — ready to size, engrave and deliver insured anywhere in Singapore.",
          "The personal route: create your own. Configure a ring stone-by-stone in the [online design studio](/design-your-own-sapphire-ring-singapore), or go fully guided — our [custom sapphire ring guide](/custom-sapphire-ring-singapore) explains every option you can specify, from stone shape to hidden engravings.",
        ],
      },
      {
        id: "price-overview",
        heading: "What Ceylon sapphire rings cost in Singapore",
        paragraphs: [
          "Because styles and stones vary so widely, think in ranges. These indicative figures reflect complete rings in 18k gold from our Singapore atelier; individual stones can move any figure up or down.",
        ],
        table: {
          caption: "Indicative pricing by ring style (SGD)",
          headers: ["Ring style", "Indicative range (SGD)"],
          rows: [
            ["Sapphire eternity / stacking band", "1,800 – 6,000"],
            ["Solitaire dress ring, fine heated stone", "2,800 – 8,000"],
            ["Engagement ring, certified centre stone", "3,500 – 40,000 +"],
            ["Cocktail statement, 3 ct + centre", "8,000 – 30,000 +"],
            ["Men's signet with royal blue sapphire", "2,500 – 9,000"],
          ],
        },
      },
      {
        id: "caring",
        heading: "Caring for a sapphire ring in the tropics",
        paragraphs: [
          "Singapore's humidity is no threat to corundum, but daily life leaves a film of soap and sunscreen on any ring. Restore the fire with warm water, a drop of dish soap and a soft toothbrush; dry with a lint-free cloth. Store rings separately — sapphire will scratch gold and softer gems if tumbled together.",
          "Bring your ring back to us periodically: we check prong tension, refresh the polish and keep your piece proposal-bright for decades. Aftercare is part of every Ceylon Gem Maison commission.",
        ],
      },
    ],
    faqs: [
      {
        q: "What colours do Ceylon sapphire rings come in?",
        a: "Nearly every colour: the famous cornflower and royal blues, plus pink, yellow, white, teal, violet, parti (two-tone) and the extremely rare pink-orange padparadscha. Blues carry the strongest tradition; the other hues are rarer conversations and often better value per carat.",
      },
      {
        q: "Can I wear a Ceylon sapphire ring every day?",
        a: "Yes. At Mohs 9, sapphire is harder than steel, quartz dust and virtually everything else your hands meet daily. With a well-made setting and an occasional clean, a sapphire ring is genuinely an everyday piece.",
      },
      {
        q: "Is sapphire really September's birthstone?",
        a: "It is — and it also marks the 5th and 45th wedding anniversaries, which makes a Ceylon sapphire ring one of the most naturally gift-able fine jewels in the calendar.",
      },
      {
        q: "Do you make men's sapphire rings in Singapore?",
        a: "Yes. Deep royal blue and teal Ceylon stones in signet or architectural band settings are a growing part of our commissions. They can be designed online or through a private consultation like any other piece.",
      },
      {
        q: "Can a sapphire ring double as a wedding band?",
        a: "A sapphire half-eternity band is one of the most elegant wedding-band choices there is, and we regularly design them to sit flush against an existing engagement ring — matched in metal, height and curvature.",
      },
      {
        q: "How do I clean a sapphire ring at home?",
        a: "Warm water, a drop of mild dish soap, a soft brush, and a thorough rinse. Avoid harsh chemicals on the metal rather than the stone — sapphire itself is nearly indestructible in normal use. An annual professional check keeps the setting secure.",
      },
    ],
    related: [
      {
        slug: "ceylon-sapphire-engagement-ring-singapore",
        label: "Engagement Guide",
        blurb: "The definitive guide to choosing a Ceylon sapphire engagement ring.",
      },
      {
        slug: "custom-sapphire-ring-singapore",
        label: "Make It Yours",
        blurb: "Every element you can customise on a sapphire ring, explained.",
      },
      {
        slug: "sri-lankan-sapphire-ring-singapore",
        label: "The Origin Story",
        blurb: "Why Sri Lanka's gem island heritage matters to your ring.",
      },
    ],
    ctaHeading: "Find — or create — your Ceylon sapphire ring",
    ctaBody:
      "Browse the finished collection, or design a ring around the exact stone, colour and setting you have in mind. Instant online pricing; insured delivery across Singapore.",
  },

  /* ------------------------------------------------------------------ */
  /* 3 · Bespoke sapphire engagement ring Singapore — process page       */
  /* ------------------------------------------------------------------ */
  {
    slug: "bespoke-sapphire-engagement-ring-singapore",
    keyword: "bespoke sapphire engagement ring Singapore",
    title: "Bespoke Sapphire Engagement Rings in Singapore — The Process",
    description:
      "How a bespoke sapphire engagement ring is made in Singapore: consultation, certified stone curation, design, handcrafting, timeline and cost — the complete commissioning journey with Ceylon Gem Maison.",
    eyebrow: "The Commissioning Journey",
    h1Top: "Bespoke Sapphire Engagement Rings",
    h1Accent: "in Singapore",
    subtitle:
      "A ring no one else will ever own — designed around your story and a hand-selected Ceylon sapphire. Here is exactly how the bespoke journey works, from first conversation to the box in your pocket.",
    intro: [
      "Bespoke does not mean complicated, and it does not have to mean expensive. It means the ring begins with a blank page and a conversation — your story, her taste, your budget — instead of a showcase of someone else's decisions.",
      "This page walks through our entire bespoke process for sapphire engagement rings in Singapore: what happens at each stage, how long it takes, what it costs relative to retail, and the questions to settle before you begin.",
    ],
    image: {
      src: "/artisan_crafting.png",
      alt: "Master jeweller handcrafting a bespoke sapphire engagement ring at the Ceylon Gem Maison atelier",
    },
    sections: [
      {
        id: "bespoke-vs-custom",
        heading: "Bespoke, semi-custom, off-the-shelf: know the difference",
        paragraphs: [
          "Off-the-shelf is a finished ring, sized to fit. Semi-custom modifies an existing design — a different stone here, a different metal there. Fully bespoke starts from nothing: the stone is curated to your brief, the design drawn for you alone, and the ring made once, for one person.",
          "All three are legitimate. Semi-custom suits tight timelines; our guide to [custom sapphire rings](/custom-sapphire-ring-singapore) covers those options element by element. This page is about the full journey — and if you'd rather explore designs independently first, the [online design studio](/design-your-own-sapphire-ring-singapore) is a pressure-free place to begin.",
        ],
      },
      {
        id: "the-journey",
        heading: "The bespoke journey, step by step",
        list: [
          "1 · Consultation — in person in Singapore or over video. We listen: the story, style cues (her existing jewellery says a lot), lifestyle, timeline and budget. No obligation, no charge.",
          "2 · Stone curation — we shortlist certified Ceylon sapphires to your brief, sourced at origin. You compare them side by side, in person where possible, and choose the one that speaks.",
          "3 · Design — sketches first, then a precise 3D model of your ring around your stone. You review renders from every angle.",
          "4 · Refinement & approval — we iterate until it is exactly right. Nothing is made until you approve the final model and quotation.",
          "5 · Handcrafting — casting in 18k gold or platinum, hand-setting, hand-finishing. Your sapphire is set by a master setter, not a production line.",
          "6 · Delivery — independently certifiable, presented proposal-ready, and delivered fully insured to your door in Singapore — or held for collection at your appointment.",
        ],
      },
      {
        id: "timeline",
        heading: "How long a bespoke ring takes",
        paragraphs: [
          "The honest answer: four to eight weeks from approved design, with stone curation adding days to a couple of weeks depending on how specific the brief is. Complex settings, engraving and unusual sizes sit at the longer end.",
          "Proposing sooner than that? Tell us the date at the first conversation. Express crafting is often possible, and for very tight timelines we can propose with a temporary presentation setting while the final ring is completed — the proposal is never hostage to the workshop.",
        ],
      },
      {
        id: "cost",
        heading: "What bespoke costs — and where the money goes",
        paragraphs: [
          "A persistent myth says bespoke carries a heavy premium over retail. Sourced correctly, the opposite is usually true: because we buy sapphires at origin in Sri Lanka rather than through layers of dealers, the same certified stone typically costs less in a bespoke commission with us than in a showcase ring that has crossed three margins to reach the mall.",
          "Budget-wise, expect roughly 60–75% of a bespoke ring's cost to sit in the centre stone, with the remainder in precious metal, accent diamonds and craftsmanship. That ratio is worth remembering: upgrading the stone transforms the ring; upgrading everything else refines it.",
          "Working figures for complete bespoke sapphire engagement rings in Singapore start around SGD 3,500 and rise with the stone — our [engagement ring buying guide](/ceylon-sapphire-engagement-ring-singapore) includes a full indicative price table.",
        ],
      },
      {
        id: "heirlooms",
        heading: "Heirloom stones, reimagined",
        paragraphs: [
          "Some of the most meaningful commissions begin with a stone that already exists — a grandmother's sapphire in a setting no one wears. We assess the stone's condition, re-polish if needed, and design a contemporary ring that lets an inherited gem live a second life at the centre of a new story.",
          "Bring the piece to a consultation; we will tell you honestly what the stone is, what it needs, and what it could become.",
        ],
      },
      {
        id: "proposal-planning",
        heading: "Planning the proposal around a bespoke ring",
        paragraphs: [
          "Surprise proposals and bespoke rings coexist beautifully with a little planning. We help clients establish ring size discreetly (a borrowed ring, a traced band, a conspiring friend), keep correspondence unmarked, and time delivery to the day. Every bespoke ring leaves us proposal-ready — presentation box, certificate, and insurance documentation in order.",
          "And if the design should really be a joint decision, consider proposing with a certified loose sapphire — the stone chosen, the ring designed together afterwards. It is a growing choice among Singapore couples, and the design session becomes a memory of its own.",
        ],
      },
    ],
    faqs: [
      {
        q: "Does a bespoke sapphire engagement ring cost more than buying retail?",
        a: "Usually not — often the reverse. Origin-direct stone sourcing removes intermediary margins, so more of your budget goes into the sapphire itself rather than the supply chain. You also pay for nothing you didn't choose: every element of the design is deliberate.",
      },
      {
        q: "How long does the bespoke process take in Singapore?",
        a: "Typically four to eight weeks from approved design, plus stone-curation time up front. With a firm proposal date we can often compress the schedule, and a temporary presentation setting is always available as a backstop for very tight timelines.",
      },
      {
        q: "Do I need to arrive with a design in mind?",
        a: "No — most clients don't. Bring whatever you have: photographs she has admired, her existing jewellery style, a Pinterest board, or nothing but the story. Translating fragments into a coherent design is precisely what the consultation is for.",
      },
      {
        q: "How do payments work for a bespoke commission?",
        a: "Terms are agreed transparently at consultation before anything is made — typically a deposit to begin crafting with the balance on completion. You approve the final design and full quotation in writing first; there are no surprises after.",
      },
      {
        q: "Can you keep the ring a secret from my partner?",
        a: "Discretion is standard practice: unmarked communication on request, secret size establishment, and delivery timed and addressed however the surprise requires.",
      },
      {
        q: "What if my partner would rather design it with me?",
        a: "Propose with the certified loose sapphire and design the ring together afterwards. The stone carries the surprise; the design becomes a shared experience. Many couples tell us the co-design sessions were among their favourite parts of getting engaged.",
      },
      {
        q: "Can I make changes mid-process?",
        a: "Design changes are welcome — and free-flowing — up to final approval; that is what the refinement stage exists for. After crafting begins, changes depend on the stage reached, and we will always tell you honestly what is possible.",
      },
    ],
    related: [
      {
        slug: "design-your-own-sapphire-ring-singapore",
        label: "Prefer To Drive?",
        blurb: "Design independently online with live 3D and instant pricing.",
      },
      {
        slug: "ceylon-sapphire-engagement-ring-singapore",
        label: "The Stone Itself",
        blurb: "Colours, certification and prices — the full engagement ring guide.",
      },
      {
        slug: "custom-sapphire-ring-singapore",
        label: "Customisation Options",
        blurb: "Every element you can specify, from stone shape to hidden details.",
      },
    ],
    ctaHeading: "Begin your bespoke commission",
    ctaBody:
      "Book a no-obligation consultation — in person in Singapore or over video — and we will curate certified Ceylon sapphires to your story and budget.",
  },

  /* ------------------------------------------------------------------ */
  /* 4 · Blue sapphire engagement ring Singapore — colour authority      */
  /* ------------------------------------------------------------------ */
  {
    slug: "blue-sapphire-engagement-ring-singapore",
    keyword: "blue sapphire engagement ring Singapore",
    title: "Blue Sapphire Engagement Rings in Singapore — Shades & Styles",
    description:
      "Royal blue, cornflower, violet or teal? A Singapore guide to blue sapphire engagement rings: every shade explained, how each behaves in real light, metal pairings, famous rings and indicative prices.",
    eyebrow: "The Colour Guide",
    h1Top: "Blue Sapphire Engagement Rings",
    h1Accent: "in Singapore",
    subtitle:
      "Blue is not one colour. From regal royal to luminous cornflower and moody teal — how to choose the blue that will still stop your heart in thirty years.",
    intro: [
      "Ask ten people to picture a blue sapphire engagement ring and you will get ten different blues. The choice of shade shapes everything: how the ring reads across a dinner table, which metals flatter it, what it costs, and the personality it projects from the hand.",
      "This guide is devoted entirely to that choice. For certification, treatments and how to verify what you are buying, see our [natural blue sapphire guide](/natural-blue-sapphire-ring-singapore); for the broader buying journey, the [Ceylon sapphire engagement ring guide](/ceylon-sapphire-engagement-ring-singapore) covers settings, prices and process end to end.",
    ],
    image: {
      src: "/hero/poster.jpg",
      alt: "Royal blue sapphire engagement ring photographed on silk in Singapore",
    },
    sections: [
      {
        id: "the-shades",
        heading: "The blues, decoded",
        list: [
          "Royal blue — deep, saturated, formal. The blue of state occasions and the world's most photographed engagement rings. Commands the strongest prices alongside cornflower.",
          "Cornflower blue — the celebrated Ceylon signature: a soft, luminous, slightly powdery blue that seems lit from within. Romantic where royal blue is regal.",
          "Violet-blue — blue with a whisper of purple that flatters warm skin tones and glows in evening light. Often exceptional value.",
          "Teal & steel blue — blue-green and grey-blue stones beloved for unconventional, modern rings. Distinctive and increasingly sought after.",
          "Ice blue — pale, bright, almost aquamarine freshness with lively sparkle. The most understated way to wear colour.",
        ],
      },
      {
        id: "light-behaviour",
        heading: "How each blue behaves in real light",
        paragraphs: [
          "A sapphire lives most of its life indoors — and this is where shade choice earns its keep. Very dark stones can slide toward black under warm restaurant lighting; over-pale stones can wash out under office fluorescents. The connoisseur's target is a vivid blue of medium tone that stays recognisably, unmistakably blue in every room.",
          "Fine Ceylon stones are prized for precisely this stability: their higher transparency keeps light moving through the stone, so the colour stays alive where darker-origin sapphires go quiet. When comparing stones, always view them under at least three lights — daylight, warm indoor and cool white — before deciding.",
        ],
      },
      {
        id: "symbolism",
        heading: "Why blue: symbolism and the royal precedent",
        paragraphs: [
          "Blue sapphire has meant fidelity, wisdom and constancy since antiquity — mediaeval courts held that its colour would dim in the presence of deceit, which made it the definitive stone of promises. It remains the gem of the 5th and 45th wedding anniversaries and September's birthstone.",
          "The modern era's most influential engagement ring — the 12-carat blue sapphire chosen by Diana, Princess of Wales, now worn by the Princess of Wales — is widely reported to be a Ceylon stone. One ring made blue sapphire shorthand for a love story that outlasts fashion.",
        ],
      },
      {
        id: "pairings",
        heading: "Metals and settings for every blue",
        paragraphs: [
          "White metals — platinum and 18k white gold — cool and intensify a blue stone; they are the default for royal blue and ice blue alike. Yellow gold warms a cornflower stone into something gloriously vintage. Rose gold is the secret weapon for violet-blues and teals, pulling out their warmth.",
          "Setting-wise, a diamond halo amplifies saturation by contrast — the classic treatment for royal blue. Solitaires suit stones confident enough to stand alone; trilogy designs add symbolism and finger presence. East-west and bezel settings modernise teal and steel stones beautifully.",
        ],
      },
      {
        id: "cuts",
        heading: "Cuts and shapes that flatter blue",
        paragraphs: [
          "Oval is the reigning shape for blue sapphire engagement rings — it maximises face-up size, flatters the finger and hides minor colour zoning. Cushion cuts give a pillowy, heritage softness; rounds read most classic; emerald cuts turn a top-colour stone into architecture, but demand high clarity and even saturation since they hide nothing.",
          "Because sapphires are cut for colour rather than to standardised proportions, judge each stone individually: look for colour returned evenly across the whole face, without a washed-out window at the centre or dark extinction at the edges.",
        ],
      },
      {
        id: "price-by-shade",
        heading: "How shade moves the price",
        table: {
          caption: "Relative value by blue shade (equal size, clarity and treatment)",
          headers: ["Shade", "Character", "Relative price"],
          rows: [
            ["Royal blue", "Deep, saturated, formal", "Highest"],
            ["Cornflower blue", "Luminous, soft, signature Ceylon", "Highest"],
            ["Violet-blue", "Romantic, warm-toned", "Mid to high"],
            ["Teal / steel", "Modern, unconventional", "Accessible"],
            ["Ice blue", "Pale, bright, subtle", "Accessible"],
          ],
        },
        paragraphsAfter: [
          "Two practical consequences. First: if maximum blue for the budget is the goal, a slightly lighter cornflower stone often out-glows a darker royal stone that costs the same. Second: teal and ice stones let you buy meaningfully larger — a route to serious presence without serious escalation.",
        ],
      },
    ],
    faqs: [
      {
        q: "Which blue sapphire shade is most valuable?",
        a: "Vivid royal blue and fine cornflower blue sit at the top of the market when saturation is even and tone is medium — neither inky nor pale. Between those two, value is a matter of taste rather than hierarchy; both are considered the pinnacle blues.",
      },
      {
        q: "Will a blue sapphire look dark or black indoors?",
        a: "An over-dark stone can — which is why tone matters more than depth on paper. A well-chosen medium-tone stone, particularly a transparent Ceylon blue, stays visibly blue under restaurant light, office light and daylight alike. Always assess a stone under multiple light sources.",
      },
      {
        q: "What blue sapphire is in the famous royal engagement ring?",
        a: "The 12-carat oval blue sapphire chosen by Diana, Princess of Wales in 1981 — now worn by Catherine, Princess of Wales — is widely reported to be of Ceylon (Sri Lankan) origin, set in a diamond halo. It remains the most influential coloured-stone engagement ring ever made.",
      },
      {
        q: "What does a blue sapphire engagement ring symbolise?",
        a: "Fidelity, wisdom, truth and constancy — a symbolism unbroken since antiquity. It is also September's birthstone and the gem of the 5th and 45th anniversaries, layering personal calendar meaning onto the romance.",
      },
      {
        q: "Which metal suits a blue sapphire best?",
        a: "Platinum and white gold intensify blue and read most contemporary; yellow gold turns cornflower stones warmly vintage; rose gold flatters violet and teal stones. There is no wrong answer — bring the wearer's existing jewellery into the decision, since metal preference is usually already visible on their hand.",
      },
      {
        q: "Do blue sapphires fade over time?",
        a: "No. Sapphire's colour is structural, created by trace elements locked in the crystal — it does not fade with sunlight, water or age. The blue your ring has on day one is the blue it will have in fifty years.",
      },
    ],
    related: [
      {
        slug: "natural-blue-sapphire-ring-singapore",
        label: "Verify Before You Buy",
        blurb: "Natural vs synthetic, treatments and certification, explained.",
      },
      {
        slug: "ceylon-sapphire-engagement-ring-singapore",
        label: "The Full Buying Guide",
        blurb: "Settings, prices and the commissioning journey end to end.",
      },
      {
        slug: "sri-lankan-sapphire-ring-singapore",
        label: "Why Origin Matters",
        blurb: "The island heritage behind the world's most luminous blues.",
      },
    ],
    ctaHeading: "Find your blue",
    ctaBody:
      "Compare certified royal, cornflower and teal sapphires side by side — online with instant pricing, or in person at a private Singapore consultation.",
  },

  /* ------------------------------------------------------------------ */
  /* 5 · Sri Lankan sapphire ring Singapore — origin page                */
  /* ------------------------------------------------------------------ */
  {
    slug: "sri-lankan-sapphire-ring-singapore",
    keyword: "Sri Lankan sapphire ring Singapore",
    title: "Sri Lankan Sapphire Rings in Singapore — Direct From Origin",
    description:
      "Why Sri Lankan sapphires are the world's most storied gems — Ratnapura's 2,000-year mining heritage, ethical artisanal sourcing, origin certification, and how origin-direct rings reach Singapore.",
    eyebrow: "The Origin Story",
    h1Top: "Sri Lankan Sapphire Rings",
    h1Accent: "in Singapore",
    subtitle:
      "Two thousand years of gem heritage, some of the world's most ethical mining, and a direct route from the island's gravels to your hand in Singapore.",
    intro: [
      "Every sapphire has a birthplace, and no birthplace carries more history than Sri Lanka. Traders have carried the island's blue stones west since Roman antiquity; Marco Polo wrote of them; crowns across Europe and Asia are set with them. When you wear a Sri Lankan sapphire ring, you wear the oldest continuously worked gem heritage on earth.",
      "This page is about that provenance — where the stones come from, why the island's mining is among the most ethical in the gem world, and why buying origin-direct in Singapore changes both the price and the story of your ring.",
    ],
    image: {
      src: "/journal/journal-ethical-journey.png",
      alt: "The ethical journey of a Sri Lankan sapphire from mine to a finished ring in Singapore",
    },
    sections: [
      {
        id: "ceylon-sri-lanka",
        heading: "Ceylon and Sri Lanka: one island, two names",
        paragraphs: [
          "'Ceylon' is the island's colonial-era name, retired officially in 1972 when it became Sri Lanka — yet the gem trade never let it go. 'Ceylon sapphire' remains the international term of art for a Sri Lankan stone, carrying centuries of accumulated reputation the way 'Champagne' does for wine.",
          "In practice the terms are interchangeable: every Ceylon sapphire is Sri Lankan, and laboratory reports will state 'Sri Lanka (Ceylon)' as the origin opinion. We use both across this site, and our [Ceylon sapphire ring guide](/ceylon-sapphire-ring-singapore) surveys the styles those stones become.",
        ],
      },
      {
        id: "gem-island",
        heading: "Ratnapura and the island of gems",
        paragraphs: [
          "Sri Lanka's gem wealth concentrates around Ratnapura — literally 'City of Gems' in Sinhala — where rivers have been eroding gem-bearing rock for millions of years and concentrating sapphires into gravel beds called illam. The island has worked these gravels for over two millennia and they are still producing: alongside blue sapphire come pinks, yellows, the rare padparadscha, star sapphires and cat's-eye chrysoberyl.",
          "That geological generosity is why so many of history's celebrated blues — including stones in the British Crown Jewels and the engagement ring worn by two Princesses of Wales — trace to this one island.",
        ],
      },
      {
        id: "ethical-mining",
        heading: "Artisanal mining: the ethical advantage",
        paragraphs: [
          "Sri Lankan sapphire mining looks nothing like industrial extraction. The typical operation is a hand-dug pit worked by a small licensed crew with rope, timber shoring and pans — a method essentially unchanged for centuries. Heavy machinery is heavily restricted, pits are modest and back-filled, and mined land routinely returns to paddy and garden.",
          "The human economics matter too: traditional profit-sharing distributes proceeds among the crew rather than wage-labour alone, and the country bans the export of rough stones in many categories precisely so that cutting — where much of a gem's value is added — stays with Sri Lankan hands. For buyers who care where beautiful things come from, it is as close to a clear conscience as mining gets.",
        ],
      },
      {
        id: "direct-from-source",
        heading: "Origin-direct: what it changes for you",
        paragraphs: [
          "Most sapphires reach Southeast Asian showcases through a chain — miner, local dealer, foreign wholesaler, exporter, importer, retailer — and every link adds margin without adding beauty. Ceylon Gem Maison's difference is structural: years of professional experience exporting Sri Lankan gems means we select stones at origin and bring them directly to Singapore.",
          "Two consequences. Price: removing intermediary margins means the same certified stone typically costs meaningfully less. Traceability: we can tell you where your sapphire was unearthed and follow its journey from gravel to finished ring — a story most retailers simply cannot access. That chain of custody pairs naturally with independent certification, covered in our [natural sapphire guide](/natural-blue-sapphire-ring-singapore).",
        ],
      },
      {
        id: "origin-comparison",
        heading: "Sri Lanka against the world's sapphire origins",
        table: {
          caption: "The classic sapphire origins compared",
          headers: ["Origin", "Known for", "Availability today", "Value position"],
          rows: [
            [
              "Sri Lanka (Ceylon)",
              "Luminous cornflower & royal blues, high clarity, full colour range",
              "Actively producing",
              "The connoisseur's value: top quality, sane prices",
            ],
            [
              "Kashmir",
              "Velvety 'sleepy' blue of legend",
              "Essentially exhausted; auction rarities",
              "Extreme collector prices",
            ],
            [
              "Burma (Myanmar)",
              "Deep royal blue",
              "Limited; sourcing concerns persist",
              "Very high",
            ],
            [
              "Madagascar",
              "Wide range, some Ceylon-like material",
              "Abundant since the 1990s",
              "Accessible; shorter heritage",
            ],
          ],
        },
        paragraphsAfter: [
          "Kashmir and Burmese stones are auction-house territory; Madagascar supplies excellent commercial material without the pedigree. Sri Lanka occupies the enviable middle: living heritage, active ethical production, and top-tier colour still attainable by real-world budgets — which is why it anchors everything we make.",
        ],
      },
      {
        id: "island-to-singapore",
        heading: "From the island to your hand in Singapore",
        paragraphs: [
          "The journey of one of our rings: a stone selected at origin in Sri Lanka; precision cutting and polishing by hand; independent gemmological certification; then design and setting for a Singapore client — either through a [private consultation](/contact) or our online atelier — and finally insured delivery to your door.",
          "Four hours of flight separate Colombo and Changi, and that proximity is Singapore's quiet advantage as a sapphire-buying city: few places on earth sit closer to the source of the world's finest blues.",
        ],
      },
    ],
    faqs: [
      {
        q: "Is a Sri Lankan sapphire the same as a Ceylon sapphire?",
        a: "Yes — identical. Ceylon is simply the island's former name, kept alive by the gem trade because of its centuries-old reputation. Laboratory reports typically write the origin as 'Sri Lanka (Ceylon)'.",
      },
      {
        q: "Why are Sri Lankan sapphires so highly regarded?",
        a: "A rare combination: exceptional material (luminous, transparent blues with lively colour in any light), unmatched heritage (two thousand years of continuous production), and active supply — unlike Kashmir, whose fabled mines are exhausted. The world's most famous engagement sapphire is widely reported to be Sri Lankan.",
      },
      {
        q: "Are Sri Lankan sapphires ethically mined?",
        a: "Sri Lanka is widely considered the gem world's ethical benchmark: small licensed artisanal pits, restricted machinery, land restoration, and traditional profit-sharing among crews. No system is perfect, which is why we select at origin ourselves and can speak to the journey of the stones we sell.",
      },
      {
        q: "How is a sapphire's origin actually verified?",
        a: "Gemmological laboratories determine origin from a stone's internal characteristics — inclusion patterns, growth structures and trace-element chemistry act as a geological fingerprint. Fine stones should carry a report stating both origin opinion and treatment status.",
      },
      {
        q: "Do Sri Lankan sapphires cost more than other origins?",
        a: "They carry a heritage premium over Madagascar material but remain far more attainable than Kashmir or Burmese stones of comparable quality. Buying origin-direct in Singapore — without intermediary margins — narrows the gap further, which is the structural advantage of how we source.",
      },
      {
        q: "Can I trace the specific stone in my ring?",
        a: "With us, yes: because we select at origin, we can share the provenance journey of your sapphire — something conventional retail supply chains generally cannot offer. Ask during your consultation and we will walk you through your stone's story.",
      },
    ],
    related: [
      {
        slug: "ceylon-sapphire-engagement-ring-singapore",
        label: "For The Proposal",
        blurb: "The complete Ceylon sapphire engagement ring buying guide.",
      },
      {
        slug: "natural-blue-sapphire-ring-singapore",
        label: "Certification",
        blurb: "How laboratories verify origin, treatment and authenticity.",
      },
      {
        slug: "ceylon-sapphire-ring-singapore",
        label: "The Ring Styles",
        blurb: "Every ring a Sri Lankan sapphire can become.",
      },
    ],
    ctaHeading: "Own a piece of the island's story",
    ctaBody:
      "Every Ceylon Gem Maison ring begins in Sri Lanka's gem gravels and ends on a Singapore hand — with the journey documented in between. Start yours.",
  },

  /* ------------------------------------------------------------------ */
  /* 6 · Custom sapphire ring Singapore — customisation options          */
  /* ------------------------------------------------------------------ */
  {
    slug: "custom-sapphire-ring-singapore",
    keyword: "custom sapphire ring Singapore",
    title: "Custom Sapphire Rings in Singapore — Options, Cost & Timeline",
    description:
      "Everything you can customise on a sapphire ring in Singapore — stone, shape, setting, metal, engraving — three routes to a custom ring, honest cost anatomy and timelines from Ceylon Gem Maison.",
    eyebrow: "The Customisation Guide",
    h1Top: "Custom Sapphire Rings",
    h1Accent: "in Singapore",
    subtitle:
      "Stone, shape, setting, metal, message: a practical guide to every element you can specify on a custom sapphire ring — and the three routes to getting one made.",
    intro: [
      "Custom is a spectrum, not a switch. At one end, a collection ring with your choice of stone; at the other, a fully bespoke commission that begins as a sketch. Knowing which elements matter most to you — and which route delivers them — is the difference between a ring that fits the brief and a ring that is the brief.",
      "This guide inventories every customisable element of a sapphire ring, compares the three routes we offer Singapore clients, and breaks down where the money actually goes.",
    ],
    image: {
      src: "/ring_eternal.png",
      alt: "Custom sapphire ring design with pavé band crafted in Singapore",
    },
    sections: [
      {
        id: "what-you-can-customise",
        heading: "Every element you can customise",
        list: [
          "The sapphire — colour (blue, pink, yellow, teal, white, padparadscha), shade intensity, shape, carat weight, clarity grade, and heated vs unheated certification.",
          "The cut — oval, cushion, round, emerald, pear, marquise or a freeform cut for a one-off stone.",
          "The setting — solitaire, halo, hidden halo, trilogy, east-west, bezel, cathedral, vintage clusters.",
          "The metal — platinum, or 18k white, yellow and rose gold; mixed-metal designs for contrast.",
          "The band — width, profile, pavé or plain, twisted or knife-edge, and fit against a future wedding band.",
          "The details — hand engraving, hidden birthstones, fingerprint or handwriting engraving inside the band, milgrain, filigree.",
        ],
      },
      {
        id: "three-routes",
        heading: "Three routes to a custom sapphire ring",
        paragraphs: [
          "Route one — design it yourself, online. Our [online design studio](/design-your-own-sapphire-ring-singapore) lets you configure piece, stone, cut and metal with live 3D and an instant quotation. Fastest to explore, zero pressure, available at 2am.",
          "Route two — guided bespoke. A private consultation, curated certified stones, and a designer translating your story into a one-off piece. The full journey is mapped in our [bespoke engagement ring guide](/bespoke-sapphire-engagement-ring-singapore) — the deepest customisation with the least effort on your part.",
          "Route three — customise a collection piece. Fall for a design in [the collection](/collections) but want a different stone, metal or size? Most collection rings can be re-issued to your specification — the shortest timeline of the three.",
        ],
      },
      {
        id: "cost-anatomy",
        heading: "The honest anatomy of a custom ring's cost",
        paragraphs: [
          "Custom pricing is simpler than it looks once you know the shares. In a typical sapphire ring from our atelier, the centre stone carries roughly 60–75% of the cost; precious metal and accent diamonds perhaps 15–25%; and craftsmanship the remainder. Three practical rules follow:",
        ],
        list: [
          "Upgrading the stone transforms the ring; everything else refines it. Put marginal budget into the sapphire first.",
          "Metal choice moves price modestly — platinum runs above 18k gold — but never dominates. Choose metal for the wearer, not the invoice.",
          "Intricate settings cost genuine artisan hours. A clean solitaire maximises stone-per-dollar; a hand-engraved vintage cluster buys artistry you can see.",
        ],
      },
      {
        id: "timelines",
        heading: "Timelines by route",
        table: {
          caption: "Typical timelines for a custom sapphire ring in Singapore",
          headers: ["Route", "Typical timeline"],
          rows: [
            ["Customised collection piece", "2 – 4 weeks"],
            ["Online design studio commission", "3 – 6 weeks after atelier confirmation"],
            ["Fully bespoke commission", "4 – 8 weeks from approved design"],
          ],
        },
        paragraphsAfter: [
          "All timelines compress when the brief is decisive and stretch when stone sourcing is highly specific — an unheated padparadscha of exact dimensions takes longer to find than a fine heated blue. Working to a proposal date? Say so at the start; we schedule backwards from the day that matters.",
        ],
      },
      {
        id: "beyond-engagement",
        heading: "Custom is not only for proposals",
        paragraphs: [
          "Roughly half the custom work in our atelier is not an engagement ring at all: anniversary eternity bands matched to a decade-old engagement ring, teal-sapphire signets for men, cocktail rings built around an inherited stone, push presents, self-purchases to mark a promotion. The full landscape of styles is surveyed in our [Ceylon sapphire ring guide](/ceylon-sapphire-ring-singapore).",
          "The process is identical whatever the occasion — only the story changes.",
        ],
      },
      {
        id: "mistakes",
        heading: "Five custom-ring mistakes to avoid",
        list: [
          "Choosing carat before colour — a smaller vivid stone out-glows a larger dull one at the same price, every time.",
          "Designing for the showcase, not the hand — try widths and profiles against the wearer's finger and existing stack early.",
          "Skipping certification to save cost — an uncertified 'bargain' stone is a question mark wearing a price tag.",
          "Forgetting the wedding band — decide now whether the engagement ring must sit flush with a band later; it shapes the design.",
          "Briefing with adjectives only — 'elegant and timeless' means ten different rings to ten designers. Bring pictures, even imperfect ones.",
        ],
      },
    ],
    faqs: [
      {
        q: "Is a custom sapphire ring more expensive than buying ready-made?",
        a: "Not inherently. You are paying for the same three inputs — stone, metal, craftsmanship — and because our stones are sourced at origin, custom work with us often undercuts comparable retail pieces. Custom simply moves the decisions to you, so every dollar lands on something you chose.",
      },
      {
        q: "What is a sensible minimum budget for a custom sapphire ring in Singapore?",
        a: "Meaningful custom work begins around SGD 1,800–2,500 for bands and simpler dress rings, with custom engagement rings typically from SGD 3,500 upward depending on the centre stone. An honest budget conversation at the start lets us direct every dollar where it shows most.",
      },
      {
        q: "Can I use my own stone or family gold in a custom ring?",
        a: "Heirloom sapphires and gemstones, yes — we assess condition, re-polish where needed and design around them; it is some of our favourite work. Reusing old gold is generally less practical than it sounds (alloys behave unpredictably when recast), but we will advise honestly on your specific pieces.",
      },
      {
        q: "How many design revisions do I get?",
        a: "The refinement stage exists precisely for iteration — we work until the design is right, and nothing is crafted before your written approval of the final model and quotation. In practice most designs settle within two or three rounds.",
      },
      {
        q: "How does the instant online quotation work?",
        a: "The design studio prices your configuration — stone type, carat, cut, metal, setting — in real time from the same cost base as our atelier work, so the figure you see is a genuine working quote, refined (not replaced) when our gemmologists confirm your exact stone.",
      },
      {
        q: "Do you make custom men's sapphire rings?",
        a: "Yes — signets, architectural bands and understated single-stone designs, most often in deep royal blue or teal. The same three routes apply: design online, commission bespoke, or adapt a collection design.",
      },
    ],
    related: [
      {
        slug: "design-your-own-sapphire-ring-singapore",
        label: "Start Online",
        blurb: "The self-serve design studio with live 3D and instant quotes.",
      },
      {
        slug: "bespoke-sapphire-engagement-ring-singapore",
        label: "Go Fully Bespoke",
        blurb: "The guided commissioning journey, from consultation to delivery.",
      },
      {
        slug: "ceylon-sapphire-ring-singapore",
        label: "Style Directory",
        blurb: "Every sapphire ring style, colour and occasion in one guide.",
      },
    ],
    ctaHeading: "Build your custom sapphire ring",
    ctaBody:
      "Start with an instant online design and quotation, or bring us the idea — a photo, an heirloom, a feeling — and we will make it a ring.",
  },

  /* ------------------------------------------------------------------ */
  /* 7 · Design your own sapphire ring Singapore — online studio         */
  /* ------------------------------------------------------------------ */
  {
    slug: "design-your-own-sapphire-ring-singapore",
    keyword: "design your own sapphire ring Singapore",
    title: "Design Your Own Sapphire Ring Online in Singapore",
    description:
      "Design your own sapphire ring online in Singapore: choose the stone, cut, setting and metal in a live 3D studio with instant SGD pricing, then let our atelier craft and deliver it insured.",
    eyebrow: "The Online Atelier",
    h1Top: "Design Your Own Sapphire Ring",
    h1Accent: "Online in Singapore",
    subtitle:
      "A live 3D design studio with instant, transparent SGD pricing — configure your Ceylon sapphire ring at midnight in your living room, and let our atelier make it real.",
    intro: [
      "The traditional way to commission a ring means appointments, showrooms and quotations that arrive days later. We built a second way: an online atelier where you design the ring yourself — stone, cut, setting, metal — and watch the price update instantly with every choice.",
      "No appointment, no sales pressure, no obligation. Design at your own pace, save what you love, and only when you are ready does a human gemmologist step in to bring it to life. Here is exactly how it works.",
    ],
    image: {
      src: "/journal/journal-sapphire-ring.png",
      alt: "Designing a sapphire ring online in the Ceylon Gem Maison digital atelier from Singapore",
    },
    sections: [
      {
        id: "how-it-works",
        heading: "How the design studio works",
        list: [
          "1 · Choose your canvas — engagement ring, dress ring, band or another piece entirely.",
          "2 · Choose your sapphire — colour first (royal blue to padparadscha), then carat weight and quality tier. Every option is a genuine Ceylon stone category we source at origin.",
          "3 · Shape the design — cut, setting style and metal, visualised in live 3D as you decide.",
          "4 · Watch the price — an instant SGD quotation recalculates with every choice. Move the carat up, swap platinum for rose gold, and see precisely what each decision costs.",
          "5 · Preview and submit — generate a photoreal AI preview of your design, then submit it to the atelier. A gemmologist reviews every configuration and confirms your exact stone before anything is made.",
        ],
      },
      {
        id: "why-design-online",
        heading: "Why design online rather than in a showroom",
        paragraphs: [
          "Transparency, chiefly. Showroom pricing is opaque by design; the studio's instant quotation makes the cost of every choice visible, so you learn the market as you play — how much a half-carat step really costs, what unheated certification adds, why platinum runs above gold. Ten minutes of experimenting teaches more than most sales conversations.",
          "Then there is honesty of taste: without a consultant watching, people design what they actually love. Iterate freely at midnight, share drafts with a co-conspirator, sleep on it. The studio holds no opinions and applies no pressure — and when you do want human judgement, our [bespoke service](/bespoke-sapphire-engagement-ring-singapore) is one message away.",
        ],
      },
      {
        id: "screen-to-stone",
        heading: "From screen to stone: what happens after you submit",
        paragraphs: [
          "A design submission is the beginning of the craft, not the end of a checkout. Our gemmologists source candidate stones matching your configuration from our origin supply in Sri Lanka, confirm the final specification and quotation with you, and only then does the piece enter the workshop — cast, set and finished by hand like every Ceylon Gem Maison commission.",
          "Timeline from confirmation to delivery typically runs three to six weeks, with every ring independently certifiable and delivered fully insured anywhere in Singapore. The online start changes how the journey begins — never the standard to which it is made.",
        ],
      },
      {
        id: "design-tips",
        heading: "Design tips from the atelier",
        list: [
          "Design around the hand, not the screen: slender fingers flatter ovals and smaller widths; broader hands carry cushions and bolder bands beautifully.",
          "Spend on colour before carat — the studio makes it easy to compare a vivid smaller stone against a paler larger one at the same price. Trust the vivid one.",
          "Check the stack: if a wedding band will join later, favour settings that sit flush or plan a contoured band now.",
          "Consider lifestyle: bezels and lower profiles for hands-on professions; cathedral prongs where maximum light matters.",
          "Save versions as you go and compare them side by side — your third design is usually the one.",
        ],
      },
      {
        id: "pricing-transparency",
        heading: "How the instant pricing works",
        paragraphs: [
          "The studio prices from the same cost base as our private commissions: current origin stone pricing by colour, carat and quality tier, live precious-metal weight for your chosen design, and a fixed, honest making charge. Nothing is padded for negotiation because nothing is negotiated — the price you see is the working price.",
          "When our gemmologists confirm the exact stone for your ring, the quotation is refined to that specific gem — and you approve the final figure before crafting begins. For what drives sapphire prices generally, our [engagement ring guide](/ceylon-sapphire-engagement-ring-singapore) includes a full indicative price table.",
        ],
      },
    ],
    faqs: [
      {
        q: "Is the instant online price the final price?",
        a: "It is a genuine working quotation from our real cost base — not a teaser. The final figure is confirmed when a gemmologist matches your configuration to a specific certified stone, and you approve it in writing before anything is crafted. Movements at that stage are typically small and can go in either direction.",
      },
      {
        q: "Do I need any design experience to use the studio?",
        a: "None. Every choice is a guided selection — colour, carat, cut, setting, metal — with live 3D showing the result as you go. If you can shortlist what you find beautiful, you can design a ring.",
      },
      {
        q: "Can I change my design after submitting it?",
        a: "Yes — submission opens a conversation, not a contract. Until you approve the final specification and quotation, the design remains fully editable, and our gemmologists often suggest refinements of their own.",
      },
      {
        q: "How accurate is the 3D preview compared to the finished ring?",
        a: "The 3D model is dimensionally faithful to what the workshop crafts, and the AI preview adds photoreal materials. A handmade ring — and a natural stone — will always carry more life than any screen, which is the pleasant direction for reality to differ.",
      },
      {
        q: "Does it cost anything to design and get a quote?",
        a: "Nothing. Designing, pricing and previewing are free and unlimited, with no account or deposit needed to explore. You commit only when you approve a final specification for crafting.",
      },
      {
        q: "Can I get human help mid-design?",
        a: "At any point — send us your draft and a gemmologist or designer will pick it up with you, online or at a private Singapore consultation. Many clients start solo online and finish the last details with us; the two routes are one atelier.",
      },
    ],
    related: [
      {
        slug: "custom-sapphire-ring-singapore",
        label: "What You Can Change",
        blurb: "The full inventory of customisable elements, route by route.",
      },
      {
        slug: "bespoke-sapphire-engagement-ring-singapore",
        label: "Prefer To Be Guided?",
        blurb: "The consultation-led bespoke journey, step by step.",
      },
      {
        slug: "ceylon-sapphire-engagement-ring-singapore",
        label: "Know The Stone",
        blurb: "Colours, certification and prices before you start designing.",
      },
    ],
    ctaHeading: "Open the design studio",
    ctaBody:
      "Configure your sapphire, setting and metal in live 3D — with an instant quotation at every step. Free to explore, crafted only when you say so.",
  },

  /* ------------------------------------------------------------------ */
  /* 8 · Natural blue sapphire ring Singapore — authenticity page        */
  /* ------------------------------------------------------------------ */
  {
    slug: "natural-blue-sapphire-ring-singapore",
    keyword: "natural blue sapphire ring Singapore",
    title: "Natural Blue Sapphire Rings in Singapore — Certified & Verified",
    description:
      "How to buy a genuinely natural blue sapphire ring in Singapore: natural vs lab-grown, heated vs unheated, reading certification, verification checks and why natural stones hold value.",
    eyebrow: "The Authenticity Guide",
    h1Top: "Natural Blue Sapphire Rings",
    h1Accent: "in Singapore",
    subtitle:
      "Natural, lab-grown, heated, unheated — the words on a sapphire's label change its value tenfold. Here is how to know exactly what you are buying, and prove it.",
    intro: [
      "Two blue sapphires can look identical under a showcase light and differ in value by a factor of ten. The difference lives in three words on the certificate: natural or synthetic; heated or unheated; and the origin opinion. No purchase in fine jewellery rewards a little knowledge more richly.",
      "This guide gives you that knowledge: what 'natural' legally and gemmologically means, how treatments work and how they are disclosed, how to read a laboratory report, and the checks that protect you when buying a natural blue sapphire ring in Singapore.",
    ],
    image: {
      src: "/journal/journal-sapphire-vs-diamond.png",
      alt: "Certified natural blue sapphire ring beside its gemmological report in Singapore",
    },
    sections: [
      {
        id: "what-natural-means",
        heading: "Natural, lab-grown, imitation: three different things",
        paragraphs: [
          "A natural sapphire crystallised in the earth over millions of years and was mined, cut and polished — nothing more. A lab-grown (synthetic) sapphire is real corundum chemically, but made in weeks in a furnace; it carries none of a natural stone's rarity and a small fraction of its value. An imitation — blue glass, synthetic spinel — merely mimics the colour and is worth essentially nothing.",
          "All three are legal to sell when honestly labelled; the harm is in blurred labels. 'Created sapphire', 'cultured sapphire' and suspiciously perfect stones at too-good prices are the phrases and patterns that warrant a direct question: is this stone natural, and which laboratory says so?",
        ],
      },
      {
        id: "heated-unheated",
        heading: "Heated and unheated: the honest hierarchy",
        paragraphs: [
          "Most natural sapphires on the world market are heated — held at high temperature to deepen and even their blue. The practice is centuries old, permanent, stable and universally accepted with one non-negotiable condition: disclosure. A certified heated natural sapphire is a genuine, beautiful gem at an honest price point.",
          "An unheated sapphire left the ground already beautiful — no furnace, no assistance. That natural perfection is rare, and the market prices it accordingly: expect a substantial premium for an unheated stone of equal beauty, with fine unheated Ceylon blues among the most collected. Neither choice is wrong; paying an unheated price for a heated stone is. This is precisely what certification exists to prevent.",
          "Beware, however, of treatments beyond heat: diffusion (colour added from outside), fracture-filling and dyeing dramatically reduce value and must be explicitly disclosed. A proper laboratory report will state them plainly.",
        ],
      },
      {
        id: "certification",
        heading: "Reading a sapphire certificate",
        paragraphs: [
          "An independent gemmological report is non-negotiable for any fine sapphire. The three findings that matter: identification (natural corundum, not synthetic), treatment status ('no indications of heating' is the unheated grail; 'indications of heating' is the honest standard), and — for fine stones — an origin opinion such as 'Sri Lanka (Ceylon)'.",
          "Internationally respected coloured-stone laboratories issue such reports, and any serious jeweller in Singapore will happily supply certification with the stone — or have a specific stone certified for you before purchase. Treat reluctance to certify as an answer in itself. Every fine stone we sell is independently certifiable, a natural extension of the origin-direct sourcing described in our [Sri Lankan sapphire guide](/sri-lankan-sapphire-ring-singapore).",
        ],
      },
      {
        id: "verify-yourself",
        heading: "Checks you can make yourself",
        list: [
          "Look for life, not perfection: natural sapphires almost always carry fine silk-like inclusions under a loupe. A flawless, inclusion-free stone at a friendly price is usually a furnace's work.",
          "Watch the colour behave: rotate the stone through daylight, warm and cool light. Natural Ceylon blue stays lively and blue; many synthetics read strangely uniform, like coloured glass.",
          "Check the temperature: sapphire conducts heat away from the skin — a real stone feels cold to the lip a beat longer than glass imitations.",
          "Match the certificate: verify the report's stated carat weight and measurements against the stone, and use the laboratory's own online verification where offered.",
          "Interrogate the price: fine natural sapphire has a real market floor. A '2-carat royal blue' at a tenth of market price is answering your question for you.",
        ],
      },
      {
        id: "value",
        heading: "Why natural sapphires hold their value",
        paragraphs: [
          "Scarcity is the engine: the earth is not making more, the celebrated origins are depleting — Kashmir is finished, Burma constrained — and demand for certified unheated Ceylon stones has risen for decades. Fine natural sapphires have accordingly proven durable stores of value, with top unheated blues repeatedly setting records at international auction.",
          "Buy the ring for love, not as an investment portfolio — but between two beautiful rings, the one holding a certified natural stone holds tomorrow's value in a way no synthetic ever will. Insure it properly: your certificate and our documentation support an accurate valuation for any Singapore insurer.",
        ],
      },
      {
        id: "buying-checklist",
        heading: "The Singapore buyer's checklist",
        list: [
          "Ask directly: natural or lab-grown? Heated or unheated? Which laboratory certifies it?",
          "See the certificate before the invoice — and verify it online where the laboratory allows.",
          "View under multiple lights, ideally beside a second stone for calibration.",
          "Confirm what the price includes: stone, setting, certification, insurance for delivery.",
          "Prefer origin-direct sellers who can speak to the stone's journey — fewer hands, fewer stories, better prices.",
          "Get the paperwork: certificate, detailed receipt, and a valuation for insurance.",
        ],
      },
    ],
    faqs: [
      {
        q: "How can I tell a natural blue sapphire from a synthetic one?",
        a: "Reliably, only a gemmological laboratory can — which is why certification is non-negotiable. At home, the signals are inclusions (natural stones carry fine silk under a loupe; synthetics look eerily clean), colour behaviour across different lights, and price (natural sapphire has a real market floor that synthetics undercut dramatically).",
      },
      {
        q: "Are heated sapphires fake?",
        a: "Not at all — a heated natural sapphire is a genuine, earth-mined gem whose colour was improved by a centuries-old, permanent, universally accepted process. It is honestly priced below unheated equivalents. Only undisclosed treatment is dishonest; that is what certification protects against.",
      },
      {
        q: "Do your sapphire rings come with certification?",
        a: "Every fine stone we sell is independently certifiable, and we supply reports from recognised gemmological laboratories with our rings. Because we source at origin, the certificate is corroborated by a supply chain we can actually describe, stone by stone.",
      },
      {
        q: "Is an unheated sapphire worth the premium?",
        a: "If provenance purity and long-term value matter to you, yes — unheated stones are the rarer article and historically the stronger store of value. If visual beauty per dollar is the goal, a fine certified heated stone delivers more colour for the budget. Both are honest purchases when certified.",
      },
      {
        q: "Can a natural sapphire scratch or wear down over time?",
        a: "At Mohs 9, sapphire is second in hardness only to diamond — everyday life cannot meaningfully scratch it, and its colour is permanent. Settings, not stones, are what need occasional professional attention.",
      },
      {
        q: "How should I insure a natural sapphire ring in Singapore?",
        a: "With a proper valuation: your laboratory certificate plus our documentation establish the replacement value most Singapore insurers require, whether under a home-contents rider or a standalone jewellery policy. Reappraise every few years as the natural-sapphire market moves.",
      },
      {
        q: "Are natural blue sapphires a good investment?",
        a: "Fine certified natural stones — especially unheated Ceylon blues — have a long record of holding and growing value as supply tightens. But buy jewellery first and asset second: the dependable return is the decades on a hand, with value retention as the quiet bonus.",
      },
    ],
    related: [
      {
        slug: "sri-lankan-sapphire-ring-singapore",
        label: "Provenance",
        blurb: "The origin-direct supply chain behind every certified stone.",
      },
      {
        slug: "blue-sapphire-engagement-ring-singapore",
        label: "Choose Your Blue",
        blurb: "Royal to teal — every shade of blue sapphire explained.",
      },
      {
        slug: "ceylon-sapphire-engagement-ring-singapore",
        label: "The Buying Guide",
        blurb: "Settings, prices and the full commissioning journey.",
      },
    ],
    ctaHeading: "Buy natural. Buy certified. Buy once.",
    ctaBody:
      "Every Ceylon Gem Maison sapphire is natural, origin-sourced and independently certifiable — see the stones, and the paperwork, for yourself.",
  },
];

export function getPillar(slug: string): Pillar | undefined {
  return PILLARS.find((p) => p.slug === slug);
}
