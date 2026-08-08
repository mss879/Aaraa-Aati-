import * as THREE from "three";

/**
 * gem-head
 * The crown assembly shared by the showroom ring and the atelier configurator:
 * basket seat, gallery rail, claw prongs and the centre stone.
 *
 * Everything lives in "head-local" space — the head is dropped onto a band or a
 * chain by translating this group, so the numbers below never change with the
 * piece. The girdle (the stone's widest point) is the datum: it sits at
 * GIRDLE_Y with radius GIRDLE_R, and every other measurement is derived from it.
 *
 * The prongs are the reason this module exists. A straight prong cannot both
 * clear the girdle and grip the crown — the crown slopes inward at ~43° while a
 * leaning post only manages ~9°, so it either skewers the stone or stands beside
 * it doing nothing. Real claws are curved: they rise on the OUTSIDE of the
 * girdle, then curl over the crown and bite it. That is what prongCurve builds.
 */

export type GemCut = "round" | "princess" | "oval" | "emerald" | "marquise" | "pear";

type Disposable = { dispose: () => void };

/** The stone's widest point — the datum every other measurement hangs off. */
export const GIRDLE_R = 0.35;
export const GIRDLE_Y = 0.26;

/** Radius of the prong wire. */
const PRONG_TUBE = 0.028;

/**
 * Where a claw tip comes to rest on the crown, and how hard it bites in.
 * The tip stops on the lower crown just above the girdle — the minimum grip
 * that secures the stone. Any higher and the claws start to cover the crown:
 * the girdle tops out at 0.272 and the table sits at 0.4, so 0.302 leaves the
 * tip (plus its bead cap) well clear of the table.
 */
const TIP_Y = 0.302;
const TIP_BITE = 0.3; // fraction of PRONG_TUBE the tip sits proud of the crown

/**
 * Half-silhouette of the centre stone as (radius, height) pairs, revolved to
 * build the gem. Read bottom-up: culet, pavilion, girdle, crown, table.
 *
 * The two entries at the same radius are deliberate — that vertical section is
 * the girdle band, the bright rim every real stone has. Without it the crown and
 * pavilion meet at a knife edge and the gem reads as two cones glued together.
 */
export const STONE_PROFILE: readonly (readonly [number, number])[] = [
  [0.004, -0.06], // culet — a hair off the axis so the pole normals stay sane
  [0.2, 0.12], // pavilion main break
  [0.32, 0.225], // lower-girdle facets
  [0.35, 0.248], // girdle, bottom edge
  [0.35, 0.272], // girdle, top edge
  [0.315, 0.315], // bezel facets
  [0.26, 0.365], // star break
  [0.2, 0.4], // table edge
  [0.0, 0.4], // table centre
];

type CutSpec = {
  /** Radial segments — also the facet count around the stone. */
  seg: number;
  /** Footprint stretch, so one profile serves all four cuts. */
  sx: number;
  sz: number;
  /**
   * Turns the polygon so its corners land where the claws are. Applied as the
   * lathe's phiStart, i.e. BEFORE the stretch — rotating the mesh afterwards
   * would swing an elongated cut's long axis off the band.
   */
  phiStart: number;
  prongs: number;
  prongPhase: number;
};

export const CUT_SPEC: Record<GemCut, CutSpec> = {
  round: { seg: 16, sx: 1, sz: 1, phiStart: 0, prongs: 6, prongPhase: 0 },
  princess: { seg: 4, sx: 1.05, sz: 1.05, phiStart: Math.PI / 4, prongs: 4, prongPhase: Math.PI / 4 },
  oval: { seg: 16, sx: 1.28, sz: 0.82, phiStart: 0, prongs: 6, prongPhase: 0 },
  // emerald cuts are corner-set in the trade, so four claws rather than six
  emerald: { seg: 8, sx: 1.24, sz: 0.78, phiStart: Math.PI / 8, prongs: 4, prongPhase: Math.PI / 4 },
  // marquise: a stretched hexagonal lens whose vertices land on ±X — the two
  // points of the boat shape. Six flat facet columns read as the cut.
  marquise: { seg: 6, sx: 1.55, sz: 0.62, phiStart: Math.PI / 6, prongs: 6, prongPhase: 0 },
  // pear: five-sided lathe with one vertex pulled onto +X as the drop's point;
  // the remaining vertices round off the bowl end.
  pear: { seg: 5, sx: 1.35, sz: 0.8, phiStart: Math.PI / 10, prongs: 5, prongPhase: Math.PI / 5 },
};

/** Outer radius of the stone at height `y`, as a fraction of the girdle radius. */
export function stoneRadiusAt(y: number): number {
  let r = 0;
  for (let i = 0; i < STONE_PROFILE.length - 1; i++) {
    const [ar, ay] = STONE_PROFILE[i];
    const [br, by] = STONE_PROFILE[i + 1];
    const lo = Math.min(ay, by);
    const hi = Math.max(ay, by);
    if (y < lo - 1e-9 || y > hi + 1e-9) continue;
    // the girdle band is vertical — take its radius straight, no divide by zero
    const t = Math.abs(by - ay) < 1e-9 ? 0 : (y - ay) / (by - ay);
    r = Math.max(r, ar + t * (br - ar));
  }
  return r / GIRDLE_R;
}

/**
 * Distance from the stone's axis out to its girdle outline along a head-space
 * direction — cast against the real transformed polygon rather than assumed to
 * be a circle. This is what keeps the claws off an oval's long axis, where a
 * fixed-radius prong ring buries itself four prong-diameters deep.
 */
export function girdleRadiusAt(theta: number, spec: CutSpec): number {
  const dx = Math.cos(theta);
  const dz = Math.sin(theta);

  // one girdle vertex, laid out exactly as the lathe and the mesh scale will
  const vertex = (i: number): [number, number] => {
    const phi = spec.phiStart + (i / spec.seg) * Math.PI * 2;
    return [Math.sin(phi) * GIRDLE_R * spec.sx, Math.cos(phi) * GIRDLE_R * spec.sz];
  };

  let best = 0;
  for (let i = 0; i < spec.seg; i++) {
    const [px, pz] = vertex(i);
    const [qx, qz] = vertex(i + 1);

    // ray t·d from the axis against edge p→q
    const ex = qx - px;
    const ez = qz - pz;
    const den = dx * ez - dz * ex;
    if (Math.abs(den) < 1e-9) continue;
    const u = (dz * px - dx * pz) / den;
    if (u < -1e-6 || u > 1 + 1e-6) continue;
    const t = (px * ez - pz * ex) / den;
    if (t > best) best = t;
  }

  return best > 0 ? best : GIRDLE_R * Math.max(spec.sx, spec.sz);
}

/**
 * The path of one claw, drawn in the +X radial half-plane for a stone whose
 * girdle sits `g` out along that direction. Low tension keeps Catmull-Rom from
 * overshooting into the stone on the final curl.
 */
function prongCurve(g: number): THREE.CatmullRomCurve3 {
  const tipR = stoneRadiusAt(TIP_Y) * g + PRONG_TUBE * TIP_BITE;
  return new THREE.CatmullRomCurve3(
    [
      new THREE.Vector3(0.155, -0.005, 0), // foot, buried in the seat
      new THREE.Vector3(0.78 * g, 0.09, 0), // flares out clear of the pavilion
      new THREE.Vector3(g + PRONG_TUBE, 0.24, 0), // hugs the girdle from OUTSIDE
      new THREE.Vector3(g + PRONG_TUBE * 0.65, 0.278, 0), // curl begins at the girdle's top edge
      new THREE.Vector3(tipR, TIP_Y, 0), // claw tip, biting the lower crown
    ],
    false,
    "catmullrom",
    0.25,
  );
}

/** The centre stone: one revolved silhouette, flat-shaded into facets. */
export function createStoneGeometry(cut: GemCut): THREE.LatheGeometry {
  const spec = CUT_SPEC[cut];
  const points = STONE_PROFILE.map(([r, y]) => new THREE.Vector2(r, y));
  return new THREE.LatheGeometry(points, spec.seg, spec.phiStart);
}

/**
 * Builds seat, gallery rail, claws and stone. Every geometry created here is
 * pushed onto `disposables` — the caller owns the lifetime.
 */
export function createHead(opts: {
  cut: GemCut;
  metalMat: THREE.Material;
  gemMat: THREE.Material;
  /** Radial segments per prong tube: 6 on phones, 8 on desktop. */
  prongSeg: number;
  disposables: Disposable[];
  /** Override the cut's default claw count/placement (pendant settings). */
  prongs?: number;
  prongPhase?: number;
}): { head: THREE.Group; girdleX: number; girdleZ: number } {
  const { cut, metalMat, gemMat, prongSeg, disposables } = opts;
  const spec = {
    ...CUT_SPEC[cut],
    prongs: opts.prongs ?? CUT_SPEC[cut].prongs,
    prongPhase: opts.prongPhase ?? CUT_SPEC[cut].prongPhase,
  };
  const head = new THREE.Group();

  // --- seat: fills the junction where the head meets the band ---
  const seatGeo = new THREE.CylinderGeometry(0.2, 0.15, 0.1, 16);
  disposables.push(seatGeo);
  const seat = new THREE.Mesh(seatGeo, metalMat);
  seat.position.y = 0.02;
  head.add(seat);

  // --- gallery rail: the claws thread through it, as they do on a real basket ---
  const railGeo = new THREE.TorusGeometry(GIRDLE_R * 0.96, 0.022, 8, 28);
  disposables.push(railGeo);
  const rail = new THREE.Mesh(railGeo, metalMat);
  rail.position.y = 0.175;
  rail.rotation.x = Math.PI / 2;
  rail.scale.set(spec.sx, spec.sz, 1); // local scale, applied before the tilt
  head.add(rail);

  // --- claws ---
  const beadGeo = new THREE.SphereGeometry(PRONG_TUBE * 1.05, 8, 6);
  disposables.push(beadGeo);

  // an elongated cut only has two distinct girdle radii, so cache by radius
  const shafts = new Map<string, { geo: THREE.TubeGeometry; tip: THREE.Vector3 }>();

  for (let i = 0; i < spec.prongs; i++) {
    const angle = (i / spec.prongs) * Math.PI * 2 + spec.prongPhase;
    const g = girdleRadiusAt(angle, spec);
    const key = g.toFixed(3);

    let shaft = shafts.get(key);
    if (!shaft) {
      const curve = prongCurve(g);
      const geo = new THREE.TubeGeometry(curve, 18, PRONG_TUBE, prongSeg, false);
      disposables.push(geo);
      shaft = { geo, tip: curve.getPoint(1) };
      shafts.set(key, shaft);
    }

    // the curve is drawn along +X; rotation.y maps +X to (cos φ, 0, −sin φ)
    const prong = new THREE.Mesh(shaft.geo, metalMat);
    prong.rotation.y = -angle;
    head.add(prong);

    // TubeGeometry ends are open — cap the tip with the bead a real claw has
    const bead = new THREE.Mesh(beadGeo, metalMat);
    bead.position.set(Math.cos(angle) * shaft.tip.x, shaft.tip.y, Math.sin(angle) * shaft.tip.x);
    head.add(bead);
  }

  // --- centre stone: already sitting at the right height in profile space ---
  const stoneGeo = createStoneGeometry(cut);
  disposables.push(stoneGeo);
  const stone = new THREE.Mesh(stoneGeo, gemMat);
  stone.scale.set(spec.sx, 1, spec.sz); // the turn is already baked in as phiStart
  head.add(stone);

  return { head, girdleX: GIRDLE_R * spec.sx, girdleZ: GIRDLE_R * spec.sz };
}
