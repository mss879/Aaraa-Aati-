/**
 * GemLineArt — the scattered cut-diagram cluster that fills the empty navy to
 * the right of a section header. Purely decorative: one inline SVG, no images,
 * no runtime cost, and `aria-hidden` because it says nothing a reader needs.
 *
 * Every stone is drawn from its real cut geometry rather than sketched, so the
 * facet lines land where a gemmologist would expect them — the eight kites of a
 * brilliant, the concentric steps of an emerald cut, the cross of a princess.
 * Each gem is authored in its own 0–100 box and placed by a <g transform>, which
 * is why the helpers below all work in that space.
 */

type Pt = readonly [number, number];

/** Vertices of a regular n-gon in the 0–100 box, first vertex at `rot` degrees. */
function ngon(n: number, r: number, rot = 0, cx = 50, cy = 50): Pt[] {
  return Array.from({ length: n }, (_, i) => {
    const a = ((rot + (i * 360) / n) * Math.PI) / 180;
    return [cx + r * Math.cos(a), cy + r * Math.sin(a)] as const;
  });
}

const closed = (pts: Pt[]) =>
  pts.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`).join(" ") + "Z";

/** An octagon with the long sides of a step cut: a w×h rectangle, corners cut by c. */
function stepOutline(w: number, h: number, c: number): Pt[] {
  const x0 = 50 - w / 2;
  const x1 = 50 + w / 2;
  const y0 = 50 - h / 2;
  const y1 = 50 + h / 2;
  return [
    [x0 + c, y0],
    [x1 - c, y0],
    [x1, y0 + c],
    [x1, y1 - c],
    [x1 - c, y1],
    [x0 + c, y1],
    [x0, y1 - c],
    [x0, y0 + c],
  ];
}

/**
 * Round brilliant: girdle, the upper-girdle ring, the octagonal table, and the
 * eight kites bridging them.
 *
 * Only the eight table vertices throw a radial. Adding the star facets' radials
 * as well — sixteen lines to the girdle — collapses the stone into a spoked
 * wheel; the intermediate ring carries that detail instead.
 */
function Brilliant() {
  const table = ngon(8, 19, 22.5);
  return (
    <g>
      <circle cx="50" cy="50" r="47" />
      <path d={closed(ngon(8, 33, 22.5))} />
      <path d={closed(table)} />
      {table.map(([x, y], i) => {
        const a = ((22.5 + i * 45) * Math.PI) / 180;
        return <line key={i} x1={x} y1={y} x2={50 + 47 * Math.cos(a)} y2={50 + 47 * Math.sin(a)} />;
      })}
    </g>
  );
}

/** Oval brilliant: the same three-ring scheme squashed onto an ellipse. */
function Oval() {
  const squash = (pts: Pt[]) => pts.map(([x, y]) => [x, 50 + (y - 50) * 0.68] as const);
  const table = squash(ngon(8, 19, 22.5));
  return (
    <g>
      <ellipse cx="50" cy="50" rx="47" ry="32" />
      <path d={closed(squash(ngon(8, 33, 22.5)))} />
      <path d={closed(table)} />
      {table.map(([x, y], i) => {
        const a = ((22.5 + i * 45) * Math.PI) / 180;
        return <line key={i} x1={x} y1={y} x2={50 + 47 * Math.cos(a)} y2={50 + 32 * Math.sin(a)} />;
      })}
    </g>
  );
}

/** Emerald cut: concentric step facets, parallel to the girdle, plus corner steps. */
function EmeraldCut() {
  const steps = [
    stepOutline(62, 88, 15),
    stepOutline(52, 78, 12.5),
    stepOutline(42, 68, 10),
    stepOutline(32, 58, 7.5),
  ];
  return (
    <g>
      {steps.map((s, i) => (
        <path key={i} d={closed(s)} />
      ))}
      {/* the corner facets, cutting across every step the way a step cut's do */}
      <line x1="19" y1="6" x2="35.5" y2="21" />
      <line x1="81" y1="6" x2="64.5" y2="21" />
      <line x1="19" y1="94" x2="35.5" y2="79" />
      <line x1="81" y1="94" x2="64.5" y2="79" />
    </g>
  );
}

/** Radiant cut: an emerald-cut outline lit with brilliant facets instead of steps. */
function Radiant() {
  const outer = stepOutline(66, 86, 16);
  const table = stepOutline(38, 54, 9);
  return (
    <g>
      <path d={closed(outer)} />
      <path d={closed(table)} />
      {table.map(([x, y], i) => {
        const [ox, oy] = outer[i];
        return <line key={i} x1={x} y1={y} x2={ox} y2={oy} />;
      })}
      <line x1="50" y1="23" x2="50" y2="77" />
      <line x1="31" y1="50" x2="69" y2="50" />
    </g>
  );
}

/** Princess cut: the square outline, its cross, and the inset table. */
function Princess() {
  return (
    <g>
      <path d={closed(stepOutline(84, 84, 0))} />
      <path d={closed(stepOutline(52, 52, 0))} />
      <line x1="8" y1="8" x2="92" y2="92" />
      <line x1="92" y1="8" x2="8" y2="92" />
    </g>
  );
}

/** Cushion cut: bowed sides, a bowed table, and the four corner facets. */
function Cushion() {
  const shell = (k: number) => {
    const r = 42 * k;
    const b = 12 * k; // how far the sides bow outward
    return [
      `M${50 - r} ${50 - r + b}`,
      `Q${50 - r - b} 50 ${50 - r} ${50 + r - b}`,
      `Q50 ${50 + r + b} ${50 + r} ${50 + r - b}`,
      `Q${50 + r + b} 50 ${50 + r} ${50 - r + b}`,
      `Q50 ${50 - r - b} ${50 - r} ${50 - r + b}`,
      "Z",
    ].join(" ");
  };
  return (
    <g>
      <path d={shell(1)} />
      <path d={shell(0.62)} />
      <line x1="14" y1="14" x2="34" y2="34" />
      <line x1="86" y1="14" x2="66" y2="34" />
      <line x1="14" y1="86" x2="34" y2="66" />
      <line x1="86" y1="86" x2="66" y2="66" />
    </g>
  );
}

/** Pear cut: a point at the top, a brilliant crown, a rounded shoulder below. */
function Pear() {
  return (
    <g>
      <path d="M50 4 Q68 30 78 52 Q88 76 68 90 Q50 100 32 90 Q12 76 22 52 Q32 30 50 4Z" />
      <path d="M50 26 Q62 42 66 58 Q70 76 58 83 Q50 88 42 83 Q30 76 34 58 Q38 42 50 26Z" />
      <line x1="50" y1="4" x2="50" y2="26" />
      <line x1="22" y1="52" x2="34" y2="58" />
      <line x1="78" y1="52" x2="66" y2="58" />
      <line x1="32" y1="90" x2="42" y2="83" />
      <line x1="68" y1="90" x2="58" y2="83" />
      <line x1="50" y1="88" x2="50" y2="100" />
    </g>
  );
}

/** A four-point sparkle, drawn as two crossed tapers. */
function Sparkle() {
  return (
    <path d="M50 6 Q56 44 94 50 Q56 56 50 94 Q44 56 6 50 Q44 44 50 6Z" />
  );
}

/**
 * Placements are hand-set rather than generated: the cluster has to read as a
 * scatter, and a loop over even angles reads as a pattern. `s` is the gem's size
 * in viewBox units, so each 0–100 gem is scaled by s/100.
 *
 * The box is landscape because the gap this fills is a wide, shallow band — the
 * navy between a section heading and the link on its right. A square cluster in
 * that slot has to grow tall enough to collide with the link below it.
 * Weighted to the right, thinning to sparkles on the left so it fades toward the
 * heading rather than stopping at an edge.
 */
const GEMS = [
  { C: Pear, x: 430, y: 8, s: 84, r: 0 },
  { C: EmeraldCut, x: 300, y: 30, s: 88, r: -4 },
  { C: Brilliant, x: 505, y: 98, s: 96, r: 0 },
  { C: Oval, x: 176, y: 132, s: 94, r: -18 },
  { C: Cushion, x: 352, y: 150, s: 88, r: 6 },
  { C: Radiant, x: 470, y: 200, s: 80, r: 10 },
  { C: Princess, x: 248, y: 212, s: 76, r: 0 },
] as const;

const SPARKLES = [
  { x: 396, y: 6, s: 22 },
  { x: 268, y: 118, s: 18 },
  { x: 148, y: 96, s: 16 },
  { x: 570, y: 40, s: 20 },
];

const DOTS = [
  { x: 340, y: 128, r: 2.5 },
  { x: 232, y: 176, r: 2 },
  { x: 596, y: 78, r: 2 },
  { x: 452, y: 268, r: 2.5 },
  { x: 132, y: 214, r: 2 },
];

export default function GemLineArt({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 620 300"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      {/* One stroke declaration for the whole cluster; the gems carry no fills. */}
      <g
        fill="none"
        stroke="currentColor"
        strokeWidth="1.1"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      >
        {GEMS.map(({ C, x, y, s, r }, i) => (
          <g key={i} transform={`translate(${x} ${y}) scale(${s / 100}) rotate(${r} 50 50)`}>
            <C />
          </g>
        ))}
      </g>
      {/* Sparkles and dots are filled, so they read as glints rather than outlines. */}
      <g fill="currentColor" stroke="none">
        {SPARKLES.map(({ x, y, s }, i) => (
          <g key={i} transform={`translate(${x} ${y}) scale(${s / 100})`} opacity="0.75">
            <Sparkle />
          </g>
        ))}
        {DOTS.map(({ x, y, r }, i) => (
          <circle key={i} cx={x} cy={y} r={r} opacity="0.6" />
        ))}
      </g>
    </svg>
  );
}
