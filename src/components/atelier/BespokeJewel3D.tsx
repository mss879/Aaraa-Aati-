"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import gsap from "gsap";
import {
  type PieceId,
  type RingConfig,
  braceletStyleById,
  caratRuleFor,
  fitById,
  metalById,
  gemById,
  pendantStyleById,
  pieceById,
  settingById,
} from "@/lib/ring-options";
import {
  CUT_SPEC,
  GIRDLE_R,
  GIRDLE_Y,
  type GemCut,
  createHead,
  createStoneGeometry,
  girdleRadiusAt,
} from "@/lib/three/gem-head";

/**
 * BespokeJewel3D
 * A live, configurable WebGL preview of the client's piece — ring, necklace
 * or bracelet share one scene, one set of materials and one render loop.
 *  - piece / setting / cut / bracelet-design changes rebuild the low-poly model
 *  - metal / gem changes GSAP-tween the physical material colors in place
 *  - carat changes tween the scale of every carat-bearing stone group
 * Drag to orbit; idles with a slow ambient sway.
 *
 * The eighteen ring settings are assembled from shared archetypes declared on
 * each setting's `three` block (head type, halo count, side stones, band
 * profile, accent treatment) so the chart silhouettes stay recognisable
 * without eighteen bespoke builders.
 *
 * Performance: DPR is capped (tighter on mobile) and steps down if frames run
 * long, geometry density drops on coarse-pointer devices, chains are a single
 * InstancedMesh, and rendering pauses entirely when the canvas is off-screen
 * or the tab is hidden.
 */

type Disposable = { dispose: () => void };

type Quality = {
  mobile: boolean;
  dprCap: number;
  bandRadial: number;
  bandTubular: number;
  chainLinks: number;
  linkRadial: number;
  linkTubular: number;
  prongSeg: number;
  envW: number;
  envH: number;
};

function detectQuality(): Quality {
  const coarse = window.matchMedia("(pointer: coarse)").matches;
  const small = Math.min(window.innerWidth, window.innerHeight) < 820;
  const mobile = coarse || small;
  return mobile
    ? { mobile, dprCap: 1.75, bandRadial: 20, bandTubular: 64, chainLinks: 48, linkRadial: 5, linkTubular: 10, prongSeg: 6, envW: 512, envH: 256 }
    : { mobile, dprCap: 2, bandRadial: 32, bandTubular: 90, chainLinks: 68, linkRadial: 6, linkTubular: 14, prongSeg: 8, envW: 1024, envH: 512 };
}

/** A group whose scale follows the carat slider (× its own base factor). */
type CaratGroup = { g: THREE.Group; base: number };

type ThreeState = {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
  envMap: THREE.Texture;
  metalMat: THREE.MeshPhysicalMaterial;
  gemMat: THREE.MeshPhysicalMaterial;
  accentMat: THREE.MeshPhysicalMaterial;
  modelGroup: THREE.Group;
  modelRoot: THREE.Group | null;
  caratGroups: CaratGroup[];
  quality: Quality;
  disposables: Disposable[];
  applyStage: (piece: PieceId) => void;
};

/* How each piece is presented: camera pull-back, lift, and idle "home" pose. */
const STAGE: Record<PieceId, { camZ: number; y: number; scale: number; tiltX: number; yawHome: number; sway: number }> = {
  ring: { camZ: 7.8, y: 0.18, scale: 1.05, tiltX: 0.52, yawHome: -0.3, sway: 0.38 },
  necklace: { camZ: 10.9, y: 0.3, scale: 1.0, tiltX: 0.1, yawHome: -0.16, sway: 0.22 },
  bracelet: { camZ: 8.7, y: 0.05, scale: 1.0, tiltX: 0.5, yawHome: -0.3, sway: 0.34 },
};

/* Ring band proportions. */
const RING_SPEC = { radius: 1.5, tube: 0.11, sideAngle: 0.38, paveCount: 12, paveSpread: Math.PI / 2.5 };
/* Bracelet loop radius. */
const BRACELET_RADIUS = 2.0;

/* Pendant heads read larger on a chain than on a band. */
const HEAD_BASE_SCALE: Record<PieceId, number> = { ring: 1, necklace: 1.12, bracelet: 1 };

/* Procedural studio env map (same lightbox recipe as the showroom ring). */
function createEnvMap(q: Quality): THREE.Texture {
  const canvas = document.createElement("canvas");
  canvas.width = q.envW;
  canvas.height = q.envH;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    const w = canvas.width;
    const h = canvas.height;
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, "#ffffff");
    grad.addColorStop(0.38, "#c8c8c8");
    grad.addColorStop(0.48, "#1a1a1c");
    grad.addColorStop(0.52, "#08080a");
    grad.addColorStop(0.68, "#2c2a26");
    grad.addColorStop(1, "#0F2748");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = "rgba(255,255,255,0.45)";
    ctx.fillRect(w * 0.12, 0, w * 0.068, h);
    ctx.fillRect(w * 0.44, 0, w * 0.098, h);
    ctx.fillRect(w * 0.76, 0, w * 0.078, h);
    ctx.fillStyle = "rgba(255,220,180,0.25)";
    ctx.fillRect(w * 0.29, 0, w * 0.049, h);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.mapping = THREE.EquirectangularReflectionMapping;
  return texture;
}

/** A bare centre stone — companions and bezel-set stones sit without claws. */
function makeStone(
  cut: GemCut,
  material: THREE.Material,
  disposables: Disposable[],
): THREE.Group {
  const group = new THREE.Group();
  const spec = CUT_SPEC[cut];
  const geo = createStoneGeometry(cut);
  disposables.push(geo);

  const stone = new THREE.Mesh(geo, material);
  stone.scale.set(spec.sx, 1, spec.sz); // the turn per cut is baked in as phiStart
  group.add(stone);
  return group;
}

/** Stone wrapped in a smooth metal rim — bracelets and the bezel setting share it. */
function makeBezelAssembly(
  state: ThreeState,
  cut: GemCut,
  disposables: Disposable[],
): THREE.Group {
  const { metalMat, gemMat } = state;
  const spec = CUT_SPEC[cut];
  const g = new THREE.Group();

  const cupGeo = new THREE.CylinderGeometry(GIRDLE_R * 0.82, GIRDLE_R * 0.48, 0.18, 14);
  disposables.push(cupGeo);
  const cup = new THREE.Mesh(cupGeo, metalMat);
  cup.position.y = 0.12;
  cup.scale.set(spec.sx, 1, spec.sz);
  g.add(cup);

  const rimGeo = new THREE.TorusGeometry(GIRDLE_R + 0.042, 0.05, 10, 30);
  disposables.push(rimGeo);
  const rim = new THREE.Mesh(rimGeo, metalMat);
  rim.rotation.x = Math.PI / 2;
  rim.position.y = GIRDLE_Y;
  rim.scale.set(spec.sx, spec.sz, 1); // local scale, applied before the tilt
  g.add(rim);

  g.add(makeStone(cut, gemMat, disposables));
  return g;
}

/**
 * The crown assembly for the configured setting: prong basket, bezel rim,
 * flush-sunk stone or a floating tension stone — plus one or two halos.
 */
function makeHead(state: ThreeState, config: RingConfig, disposables: Disposable[]): THREE.Group {
  const { metalMat, gemMat, accentMat, quality: q } = state;
  const three = settingById(config.setting).three;
  const spec = CUT_SPEC[config.cut];

  let head: THREE.Group;
  let girdleX = GIRDLE_R * spec.sx;
  let girdleZ = GIRDLE_R * spec.sz;

  if (three.head === "prong") {
    ({ head, girdleX, girdleZ } = createHead({
      cut: config.cut,
      metalMat,
      gemMat,
      prongSeg: q.prongSeg,
      disposables,
    }));
  } else if (three.head === "bezel") {
    head = makeBezelAssembly(state, config.cut, disposables);
    const seatGeo = new THREE.CylinderGeometry(0.2, 0.15, 0.1, 16);
    disposables.push(seatGeo);
    const seat = new THREE.Mesh(seatGeo, metalMat);
    seat.position.y = 0.02;
    head.add(seat);
    girdleX = (GIRDLE_R + 0.09) * spec.sx;
    girdleZ = (GIRDLE_R + 0.09) * spec.sz;
  } else if (three.head === "flush") {
    // Sunk so the table sits level with the surrounding metal, ringed by a
    // whisper of a rim where the surface was cut.
    head = new THREE.Group();
    const stone = makeStone(config.cut, gemMat, disposables);
    stone.scale.multiplyScalar(0.6);
    stone.position.y = -0.2;
    head.add(stone);
    const rimGeo = new THREE.TorusGeometry(GIRDLE_R * 0.6 + 0.035, 0.026, 8, 24);
    disposables.push(rimGeo);
    const rim = new THREE.Mesh(rimGeo, metalMat);
    rim.rotation.x = Math.PI / 2;
    rim.position.y = 0.03;
    rim.scale.set(spec.sx, spec.sz, 1);
    head.add(rim);
  } else if (three.head === "tension") {
    // No metal at all — the stone hangs in the band's gap, girdle at band level.
    head = new THREE.Group();
    const stone = makeStone(config.cut, gemMat, disposables);
    stone.position.y = -GIRDLE_Y;
    head.add(stone);
  } else {
    head = new THREE.Group(); // "none" — toi-et-moi and stackable build elsewhere
  }

  // --- halos: one or two circlets of micro-diamonds around the girdle ---
  const halos = three.halos ?? 0;
  const haloGemGeo = halos > 0 ? new THREE.IcosahedronGeometry(0.06, 1) : null;
  if (haloGemGeo) disposables.push(haloGemGeo);
  for (let h = 0; h < halos; h++) {
    const haloX = girdleX + 0.12 + h * 0.17;
    const haloZ = girdleZ + 0.12 + h * 0.17;
    const railGeo = new THREE.TorusGeometry(haloX, 0.028, 8, 40);
    disposables.push(railGeo);

    const rail = new THREE.Mesh(railGeo, metalMat);
    rail.position.y = 0.28;
    rail.rotation.x = Math.PI / 2;
    rail.scale.set(1, haloZ / haloX, 1); // squash to the stone's footprint, pre-tilt
    head.add(rail);

    const haloCount = 14 + h * 8;
    for (let i = 0; i < haloCount; i++) {
      const a = (i / haloCount) * Math.PI * 2;
      const g = new THREE.Mesh(haloGemGeo!, accentMat);
      g.position.set(Math.cos(a) * haloX, 0.3, Math.sin(a) * haloZ);
      head.add(g);
    }
  }

  return head;
}

/** Ring: band profile, crown, side stones and accents per the setting's blueprint. */
function buildRing(state: ThreeState, config: RingConfig): THREE.Group {
  const { metalMat, gemMat, accentMat, quality: q } = state;
  const spec = RING_SPEC;
  const R = spec.radius;
  const disposables: Disposable[] = [];
  const model = new THREE.Group();
  const three = settingById(config.setting).three;
  const band = three.band ?? "round";

  /* --- band --- */
  if (band === "round" || band === "wide" || band === "thin" || band === "signet") {
    const tube = band === "thin" ? 0.06 : spec.tube;
    const bandGeo = new THREE.TorusGeometry(R, tube, q.bandRadial, q.bandTubular);
    disposables.push(bandGeo);
    const mesh = new THREE.Mesh(bandGeo, metalMat);
    if (band === "wide") mesh.scale.z = 2.0;
    if (band === "signet") mesh.scale.z = 1.5;
    model.add(mesh);

    if (band === "signet") {
      // the bold domed face the flush stone sinks into
      const domeGeo = new THREE.SphereGeometry(0.62, 24, 16);
      disposables.push(domeGeo);
      const dome = new THREE.Mesh(domeGeo, metalMat);
      dome.scale.set(1.05, 0.5, 0.85);
      dome.position.y = R - 0.02;
      model.add(dome);
    }
  } else if (band === "open") {
    // tension: a broad band whose two ends stop short of each other at the top
    const gap = 0.55;
    const bandGeo = new THREE.TorusGeometry(R, spec.tube, q.bandRadial, q.bandTubular, Math.PI * 2 - gap);
    const capGeo = new THREE.SphereGeometry(spec.tube, 12, 8);
    disposables.push(bandGeo, capGeo);
    const mesh = new THREE.Mesh(bandGeo, metalMat);
    mesh.rotation.z = Math.PI / 2 + gap / 2; // centre the gap on top
    mesh.scale.z = 1.8;
    model.add(mesh);
    for (const s of [-1, 1]) {
      const a = Math.PI / 2 + (s * gap) / 2;
      const cap = new THREE.Mesh(capGeo, metalMat);
      cap.position.set(Math.cos(a) * R, Math.sin(a) * R, 0);
      cap.scale.z = 1.8;
      model.add(cap);
    }
  } else if (band === "split") {
    // two slender strands running parallel, sleeved together at the base
    const strandGeo = new THREE.TorusGeometry(R, 0.055, q.bandRadial, q.bandTubular);
    const sleeveGeo = new THREE.CylinderGeometry(0.095, 0.095, 0.3, 10);
    disposables.push(strandGeo, sleeveGeo);
    for (const s of [-1, 1]) {
      const strand = new THREE.Mesh(strandGeo, metalMat);
      strand.position.z = s * 0.085;
      model.add(strand);
    }
    const sleeve = new THREE.Mesh(sleeveGeo, metalMat);
    sleeve.rotation.x = Math.PI / 2;
    sleeve.position.y = -R;
    model.add(sleeve);
  } else if (band === "cathedral") {
    const bandGeo = new THREE.TorusGeometry(R, spec.tube, q.bandRadial, q.bandTubular);
    disposables.push(bandGeo);
    model.add(new THREE.Mesh(bandGeo, metalMat));
    // arched supports springing from the shoulders up to the crown
    for (const s of [-1, 1]) {
      const a0 = Math.PI / 2 + s * 0.85;
      const curve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(Math.cos(a0) * R, Math.sin(a0) * R, 0),
        new THREE.Vector3(s * 0.55, R * 0.82 + 0.28, 0),
        new THREE.Vector3(s * 0.14, R + 0.16, 0),
      ]);
      const archGeo = new THREE.TubeGeometry(curve, 12, 0.05, 6, false);
      disposables.push(archGeo);
      model.add(new THREE.Mesh(archGeo, metalMat));
    }
  } else if (band === "bypass") {
    // two long arcs whose tips sweep past each other on either side of the stone
    const arcLen = Math.PI * 1.25;
    const arcGeo = new THREE.TorusGeometry(R, 0.1, q.bandRadial, q.bandTubular, arcLen);
    const capGeo = new THREE.SphereGeometry(0.1, 10, 8);
    disposables.push(arcGeo, capGeo);
    for (const s of [-1, 1]) {
      const end = Math.PI / 2 + s * 0.34;
      const mesh = new THREE.Mesh(arcGeo, metalMat);
      mesh.rotation.z = end - arcLen;
      mesh.position.z = s * 0.075;
      model.add(mesh);
      const cap = new THREE.Mesh(capGeo, metalMat);
      cap.position.set(Math.cos(end) * R, Math.sin(end) * R, s * 0.075);
      model.add(cap);
    }
  }

  /* --- crown --- */
  const head = makeHead(state, config, disposables);
  // flush stones ride the surface they sink into: the signet's dome crests
  // higher than a wide band's outer wall
  const headY =
    three.head === "flush" ? (band === "signet" ? R + 0.3 : R + 0.1) : R;
  head.position.set(0, headY, 0);
  model.add(head);
  if (three.head !== "none") {
    state.caratGroups.push({ g: head, base: three.head === "flush" ? 0.85 : HEAD_BASE_SCALE.ring });
  }

  /* --- side stones --- */
  if (three.sides === "flank" || three.sides === "graduated") {
    const sideScale = three.sides === "flank" ? 0.52 : 0.66;
    const sideSeatGeo = new THREE.CylinderGeometry(0.12, 0.09, 0.08, 12);
    disposables.push(sideSeatGeo);
    for (const dir of [-1, 1]) {
      const angle = Math.PI / 2 + dir * spec.sideAngle;
      const x = Math.cos(angle) * R;
      const y = Math.sin(angle) * R;

      const sideGroup = new THREE.Group();
      sideGroup.position.set(x, y, 0);
      sideGroup.rotation.z = angle - Math.PI / 2; // stand perpendicular to the band

      const sideSeat = new THREE.Mesh(sideSeatGeo, metalMat);
      sideSeat.position.y = 0.03;
      sideGroup.add(sideSeat);

      const sideStone = makeStone(config.cut, gemMat, disposables);
      sideStone.scale.multiplyScalar(sideScale);
      // the profile carries its own height — back it off to leave the girdle where it sat
      sideStone.position.y = 0.16 - sideScale * GIRDLE_Y;
      sideGroup.add(sideStone);

      model.add(sideGroup);
    }
  } else if (three.sides === "toi") {
    // two crowns leaning together — the chosen cut and its contrasting partner
    const altCut: GemCut = config.cut === "pear" ? "round" : "pear";
    const cuts: GemCut[] = [config.cut, altCut];
    [-1, 1].forEach((s, i) => {
      const { head: crown } = createHead({
        cut: cuts[i],
        metalMat,
        gemMat,
        prongSeg: q.prongSeg,
        disposables,
      });
      const a = Math.PI / 2 + s * 0.17;
      crown.position.set(Math.cos(a) * R, Math.sin(a) * R, 0);
      crown.rotation.z = a - Math.PI / 2;
      model.add(crown);
      state.caratGroups.push({ g: crown, base: 0.78 });
    });
  }

  /* --- accents --- */
  const accents = three.accents ?? [];

  if (accents.includes("pave")) {
    const paveGemGeo = new THREE.IcosahedronGeometry(0.065, 1);
    const paveCupGeo = new THREE.CylinderGeometry(0.075, 0.065, 0.04, 8);
    disposables.push(paveGemGeo, paveCupGeo);

    for (let i = 0; i < spec.paveCount; i++) {
      const t = (i / (spec.paveCount - 1)) * 2 - 1;
      if (Math.abs(t) < 0.15) continue; // leave room for the crown seat
      const angle = t * spec.paveSpread + Math.PI / 2;

      const set = new THREE.Group();
      set.position.set(Math.cos(angle) * R, Math.sin(angle) * R, 0);
      set.rotation.z = angle - Math.PI / 2;

      const cup = new THREE.Mesh(paveCupGeo, metalMat);
      cup.position.y = 0.02;
      const gemMesh = new THREE.Mesh(paveGemGeo, accentMat);
      gemMesh.position.y = 0.045;
      set.add(cup, gemMesh);
      model.add(set);
    }
  }

  if (accents.includes("channel")) {
    // two raised rails along the top arc with the stones recessed between them;
    // radii sit just proud of the band wall (R + tube) so both read clearly
    const span = spec.paveSpread * 2;
    const railGeo = new THREE.TorusGeometry(R + 0.105, 0.022, 6, 40, span);
    const channelGemGeo = new THREE.IcosahedronGeometry(0.06, 1);
    disposables.push(railGeo, channelGemGeo);
    for (const s of [-1, 1]) {
      const rail = new THREE.Mesh(railGeo, metalMat);
      rail.rotation.z = Math.PI / 2 - span / 2;
      rail.position.z = s * 0.075;
      model.add(rail);
    }
    for (let i = 0; i < 10; i++) {
      const t = (i / 9) * 2 - 1;
      if (Math.abs(t) < 0.18) continue;
      const angle = t * spec.paveSpread + Math.PI / 2;
      const gemMesh = new THREE.Mesh(channelGemGeo, accentMat);
      gemMesh.position.set(Math.cos(angle) * (R + 0.08), Math.sin(angle) * (R + 0.08), 0);
      model.add(gemMesh);
    }
  }

  if (accents.includes("milgrain")) {
    // rows of tiny beads tracing both edges of the band's top arc
    const beadGeo = new THREE.SphereGeometry(0.024, 6, 5);
    disposables.push(beadGeo);
    const perEdge = q.mobile ? 14 : 18;
    const beads = new THREE.InstancedMesh(beadGeo, metalMat, perEdge * 2);
    disposables.push(beads);
    const dummy = new THREE.Object3D();
    let idx = 0;
    for (const s of [-1, 1]) {
      for (let i = 0; i < perEdge; i++) {
        const t = (i / (perEdge - 1)) * 2 - 1;
        const angle = t * spec.paveSpread * 1.1 + Math.PI / 2;
        dummy.position.set(
          Math.cos(angle) * (R + 0.07),
          Math.sin(angle) * (R + 0.07),
          s * 0.095,
        );
        dummy.updateMatrix();
        beads.setMatrixAt(idx++, dummy.matrix);
      }
    }
    beads.instanceMatrix.needsUpdate = true;
    model.add(beads);
  }

  if (accents.includes("eternity")) {
    // the client's stones running the full way around — these follow the carat
    const n = q.mobile ? 18 : 24;
    const cupGeo = new THREE.CylinderGeometry(0.055, 0.048, 0.03, 8);
    const stoneGeo = new THREE.IcosahedronGeometry(0.055, 1);
    disposables.push(cupGeo, stoneGeo);
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2;
      const set = new THREE.Group();
      set.position.set(Math.cos(a) * R, Math.sin(a) * R, 0);
      set.rotation.z = a - Math.PI / 2;
      const cup = new THREE.Mesh(cupGeo, metalMat);
      cup.position.y = 0.05;
      const stone = new THREE.Mesh(stoneGeo, gemMat);
      stone.position.y = 0.075;
      set.add(cup, stone);
      model.add(set);
      state.caratGroups.push({ g: set, base: 1 });
    }
  }

  state.disposables.push(...disposables);
  return model;
}

/* The necklace drape, front-on: t = 0 sits at the bottom center where the pendant hangs. */
const NECK_POINTS: [number, number, number][] = [
  [0, -1.66, 0.3],
  [0.62, -1.4, 0.22],
  [1.18, -0.74, 0.1],
  [1.52, 0.2, 0],
  [1.3, 1.1, -0.12],
  [0.56, 1.66, -0.22],
  [0, 1.8, -0.26],
  [-0.56, 1.66, -0.22],
  [-1.3, 1.1, -0.12],
  [-1.52, 0.2, 0],
  [-1.18, -0.74, 0.1],
  [-0.62, -1.4, 0.22],
];

/**
 * Necklace: instanced chain links along a drape curve, one of the five
 * standardised pendant designs at the throat. The design fixes the stone
 * shape (bezel→round, prong→oval, pear drop→pear, bar→step-cut, solitaire
 * drop→small round) and every elongated stone hangs upright, per the chart.
 */
function buildNecklace(state: ThreeState, config: RingConfig): THREE.Group {
  const { metalMat, gemMat, quality: q } = state;
  const disposables: Disposable[] = [];
  const model = new THREE.Group();
  const pendant = pendantStyleById(config.pendantStyle);

  const curve = new THREE.CatmullRomCurve3(
    NECK_POINTS.map((p) => new THREE.Vector3(...p)),
    true,
    "centripetal",
  );

  // --- chain: one InstancedMesh of interlocking links, alternating 90° rolls ---
  const linkGeo = new THREE.TorusGeometry(0.085, 0.024, q.linkRadial, q.linkTubular);
  disposables.push(linkGeo);
  const chain = new THREE.InstancedMesh(linkGeo, metalMat, q.chainLinks);
  disposables.push(chain);

  const dummy = new THREE.Object3D();
  dummy.up.set(0, 0, 1); // curve tangents get vertical at the sides — keep lookAt stable
  const tangent = new THREE.Vector3();
  for (let i = 0; i < q.chainLinks; i++) {
    const t = i / q.chainLinks;
    const p = curve.getPointAt(t);
    curve.getTangentAt(t, tangent);
    dummy.position.copy(p);
    dummy.lookAt(p.x + tangent.x, p.y + tangent.y, p.z + tangent.z);
    dummy.rotateX(Math.PI / 2); // thread the link onto the chain direction
    dummy.rotateY((i % 2) * (Math.PI / 2)); // alternate links like a real cable chain
    dummy.updateMatrix();
    chain.setMatrixAt(i, dummy.matrix);
  }
  chain.instanceMatrix.needsUpdate = true;
  model.add(chain);

  const bottom = new THREE.Vector3(...NECK_POINTS[0]);

  // --- bail + drop stem, proportioned per design: the bezel hangs close on a
  // small loop, the solitaire drop hangs long — its "drop" IS the design ---
  const stemLen =
    pendant.id === "solitaire-drop" ? 0.5 : pendant.id === "bezel" ? 0.18 : 0.3;
  const bailGeo = new THREE.TorusGeometry(0.11, 0.032, 8, 20);
  const stemGeo = new THREE.CylinderGeometry(0.024, 0.032, stemLen, 8);
  disposables.push(bailGeo, stemGeo);

  const bail = new THREE.Mesh(bailGeo, metalMat);
  bail.position.set(bottom.x, bottom.y - 0.14, bottom.z);
  model.add(bail);

  const stem = new THREE.Mesh(stemGeo, metalMat);
  stem.position.set(bottom.x, bottom.y - 0.22 - stemLen / 2, bottom.z + 0.02);
  model.add(stem);

  // --- pendant: outer group tilts the table toward the camera; the inner spin
  // turns elongated cuts so they hang upright, points and long axes vertical ---
  const head = new THREE.Group();
  const spin = new THREE.Group();
  spin.rotation.y = Math.PI / 2;
  head.add(spin);

  let base = HEAD_BASE_SCALE.necklace;
  if (pendant.id === "bezel") {
    spin.add(makeBezelAssembly(state, "round", disposables));
  } else if (pendant.id === "prong") {
    const { head: crown } = createHead({
      cut: "oval",
      metalMat,
      gemMat,
      prongSeg: q.prongSeg,
      disposables,
      prongs: 4,
      prongPhase: Math.PI / 4,
    });
    spin.add(crown);
  } else if (pendant.id === "pear-drop") {
    // three claws: one on the point (up, at the bail), two on the bowl
    const { head: crown } = createHead({
      cut: "pear",
      metalMat,
      gemMat,
      prongSeg: q.prongSeg,
      disposables,
      prongs: 3,
      prongPhase: 0,
    });
    spin.add(crown);
  } else if (pendant.id === "bar") {
    // minimal bar setting: metal grips only the two short ends of the stone
    const stone = makeStone("emerald", gemMat, disposables);
    spin.add(stone);
    const capGeo = new THREE.BoxGeometry(0.1, 0.36, 0.34);
    disposables.push(capGeo);
    for (const s of [-1, 1]) {
      const cap = new THREE.Mesh(capGeo, metalMat);
      cap.position.set(s * (GIRDLE_R * 1.24 + 0.03), 0.2, 0);
      spin.add(cap);
    }
  } else {
    // solitaire drop: a deliberately small stone in a three-prong martini
    const { head: crown } = createHead({
      cut: "round",
      metalMat,
      gemMat,
      prongSeg: q.prongSeg,
      disposables,
      prongs: 3,
      prongPhase: 0,
    });
    spin.add(crown);
    base = 0.78;
  }

  head.position.set(bottom.x, bottom.y - 0.39 - stemLen, bottom.z + 0.02);
  head.rotation.x = Math.PI / 2; // stone table toward the camera, setting behind
  model.add(head);
  state.caratGroups.push({ g: head, base });

  state.disposables.push(...disposables);
  return model;
}

/**
 * Bracelet: the five standardised stone-set designs, matched to the Maison's
 * chart. All layout is solved from the stone's real footprint at the chosen
 * per-stone carat — the chain terminates flush against every setting, the
 * tennis line always closes into touching girdles, and the bar holds exactly
 * as many stones as its channel fits — so no weight ever leaves a gap.
 * (This is why bracelets REBUILD on carat change instead of tweening.)
 *
 * Every pavilion is enclosed in metal (bezel cup or four-prong basket): from
 * the presentation tilt the eye meets tables and metalwork, never the bare
 * glass cones that used to read as spikes along the line.
 */
function buildBracelet(state: ThreeState, config: RingConfig): THREE.Group {
  const { metalMat, gemMat, quality: q } = state;
  const R = BRACELET_RADIUS;
  const disposables: Disposable[] = [];
  const model = new THREE.Group();
  const style = braceletStyleById(config.braceletStyle);

  /* Per-stone carat sets the stone size through a tamed cube-root curve, so
     0.10 ct still reads on the wrist and 1.00 ct still fits the design. */
  const rule = caratRuleFor("bracelet");
  const t =
    (Math.cbrt(config.carat) - Math.cbrt(rule.min)) /
    (Math.cbrt(rule.max) - Math.cbrt(rule.min));
  const sizeF = 0.78 + 0.55 * Math.min(1, Math.max(0, t));

  /* half-width of a cut along the chain direction at stone scale s — cast
     against the real girdle polygon, so princess measures its flat side and
     marquise its point */
  const tangentHalf = (cut: GemCut, s: number) => girdleRadiusAt(0, CUT_SPEC[cut]) * s;

  /* angular distance between two loop angles */
  const angDist = (a: number, b: number) =>
    Math.abs(((a - b + Math.PI * 3) % (Math.PI * 2)) - Math.PI);

  /* --- delicate cable chain; `holes` are the arcs the settings occupy, so
     links terminate flush against every rim (links behind a transparent stone
     read as metal floating inside the gem) --- */
  const LINK_R = 0.048;
  const LINK_TUBE = 0.013;
  const addChain = (holes: { a: number; half: number }[]) => {
    const linkGeo = new THREE.TorusGeometry(LINK_R, LINK_TUBE, q.linkRadial, q.linkTubular);
    disposables.push(linkGeo);
    const spacing = (LINK_R + LINK_TUBE) * 2 * 0.62; // interlocked cable look
    const count = Math.round((Math.PI * 2 * R) / spacing);
    const angles: number[] = [];
    for (let i = 0; i < count; i++) {
      const a = (i / count) * Math.PI * 2;
      if (holes.some((h) => angDist(a, h.a) < h.half)) continue;
      angles.push(a);
    }

    const chain = new THREE.InstancedMesh(linkGeo, metalMat, angles.length);
    disposables.push(chain);
    const dummy = new THREE.Object3D();
    dummy.up.set(0, 0, 1); // tangents live in the XY plane — keep lookAt stable
    angles.forEach((a, i) => {
      const px = Math.cos(a) * R;
      const py = Math.sin(a) * R;
      dummy.position.set(px, py, 0);
      dummy.lookAt(px - Math.sin(a), py + Math.cos(a), 0);
      dummy.rotateX(Math.PI / 2); // thread the link onto the chain direction
      dummy.rotateY((i % 2) * (Math.PI / 2)); // alternate links like a real cable chain
      dummy.updateMatrix();
      chain.setMatrixAt(i, dummy.matrix);
    });
    chain.instanceMatrix.needsUpdate = true;
    model.add(chain);

    // --- lobster clasp at the base: a small teardrop body and its jump ring ---
    const bodyGeo = new THREE.SphereGeometry(0.085, 10, 8);
    const ringGeo = new THREE.TorusGeometry(0.04, 0.013, 6, 14);
    disposables.push(bodyGeo, ringGeo);
    const body = new THREE.Mesh(bodyGeo, metalMat);
    body.scale.set(0.62, 1.05, 0.45);
    body.position.set(0.06, -R + 0.01, 0);
    body.rotation.z = Math.PI / 2 - 0.35;
    model.add(body);
    const ring = new THREE.Mesh(ringGeo, metalMat);
    ring.position.set(-0.1, -R + 0.02, 0);
    ring.rotation.z = 0.4;
    model.add(ring);
  };

  /* Wrap an assembly so its origin is the stone's girdle centre and its table
     points RADIALLY out of the loop — crowns away from the wrist, exactly as
     the piece is worn (and how the ring presents its stones). Cups and
     pavilions sit inside the loop, toward the skin. */
  const radialWrap = (inner: THREE.Group): THREE.Group => {
    inner.position.y = -GIRDLE_Y; // girdle to the wrapper origin
    const w = new THREE.Group();
    w.add(inner);
    return w;
  };

  /* seat a wrapped stone on the loop, `lift` radially outward; local x stays
     tangential, so elongated cuts (marquise) lie lengthwise along the chain */
  const placeOut = (g: THREE.Group, a: number, lift = 0) => {
    g.position.set(Math.cos(a) * (R + lift), Math.sin(a) * (R + lift), 0);
    g.rotation.z = a - Math.PI / 2;
  };

  /* Bezel: rim hugging the girdle + a cup deep enough to swallow the pavilion. */
  const bezelCupGeo = new THREE.CylinderGeometry(GIRDLE_R, GIRDLE_R * 0.42, 0.32, 14);
  const bezelRimGeo = new THREE.TorusGeometry(GIRDLE_R + 0.03, 0.045, 10, 30);
  disposables.push(bezelCupGeo, bezelRimGeo);
  const makeBezel = (cut: GemCut): THREE.Group => {
    const cs = CUT_SPEC[cut];
    const g = new THREE.Group();
    const cup = new THREE.Mesh(bezelCupGeo, metalMat);
    cup.position.y = GIRDLE_Y - 0.19; // top rim tucked under the girdle
    cup.scale.set(cs.sx, 1, cs.sz);
    g.add(cup);
    const rim = new THREE.Mesh(bezelRimGeo, metalMat);
    rim.rotation.x = Math.PI / 2;
    rim.position.y = GIRDLE_Y;
    rim.scale.set(cs.sx, cs.sz, 1); // local scale, applied before the tilt
    g.add(rim);
    g.add(makeStone(cut, gemMat, disposables));
    return g;
  };
  /* half-extent of a bezel along the chain: rim outer edge, not just girdle */
  const bezelHalf = (cut: GemCut, s: number) =>
    (GIRDLE_R + 0.03 + 0.045) * CUT_SPEC[cut].sx * s;

  if (style.id === "tennis") {
    /* An unbroken line: the stone count is derived from the stone's width so
       girdles always close up touching, whatever the carat — smaller stones
       simply mean more of them, as on a real tennis bracelet. */
    const s = 0.4 * sizeF;
    const dia = 2 * tangentHalf(config.cut, s);
    const n = Math.max(16, Math.round((Math.PI * 2 * R) / dia));
    const boxHalf = 0.09; // the clasp box replaces the line at the base

    /* square four-prong basket, flat sides facing down the line; the 45° turn
       is baked into thetaStart so the footprint stretch stays axis-aligned
       (a rotated-then-scaled cup shears into diagonal blades) */
    const cupGeo = new THREE.CylinderGeometry(
      GIRDLE_R * 0.98, GIRDLE_R * 0.4, 0.34, 4, 1, false, Math.PI / 4,
    );
    const beadGeo = new THREE.SphereGeometry(0.034, 6, 5);
    disposables.push(cupGeo, beadGeo);
    const makeBasket = (cut: GemCut): THREE.Group => {
      const cs = CUT_SPEC[cut];
      const g = new THREE.Group();
      const cup = new THREE.Mesh(cupGeo, metalMat);
      cup.position.y = GIRDLE_Y - 0.185;
      cup.scale.set(cs.sx, 1, cs.sz);
      g.add(cup);
      if (!q.mobile) {
        // claw beads at the basket corners, gripping over the girdle
        const d = GIRDLE_R * Math.SQRT1_2;
        for (const px of [-1, 1]) {
          for (const pz of [-1, 1]) {
            const bead = new THREE.Mesh(beadGeo, metalMat);
            bead.position.set(px * d * cs.sx, GIRDLE_Y + 0.02, pz * d * cs.sz);
            g.add(bead);
          }
        }
      }
      g.add(makeStone(cut, gemMat, disposables));
      return g;
    };

    // the slim rail glimpsed between baskets, scaled with the stones
    const railGeo = new THREE.TorusGeometry(R, 0.055 * sizeF, q.mobile ? 8 : 12, q.bandTubular);
    disposables.push(railGeo);
    model.add(new THREE.Mesh(railGeo, metalMat));

    for (let i = 0; i < n; i++) {
      const a = -Math.PI / 2 + (i / n) * Math.PI * 2;
      if (angDist(a, -Math.PI / 2) < boxHalf) continue;
      const g = radialWrap(makeBasket(config.cut));
      g.scale.setScalar(s);
      placeOut(g, a, 0.02);
      model.add(g);
    }

    // --- the classic box clasp with its safety tongue ---
    const boxGeo = new THREE.BoxGeometry(0.34, 0.2, 0.18);
    const tongueGeo = new THREE.BoxGeometry(0.1, 0.08, 0.06);
    disposables.push(boxGeo, tongueGeo);
    const box = new THREE.Mesh(boxGeo, metalMat);
    box.position.set(0, -R, 0);
    model.add(box);
    const tongue = new THREE.Mesh(tongueGeo, metalMat);
    tongue.position.set(0.22, -R, 0);
    model.add(tongue);
  } else if (style.id === "single") {
    const s = 0.62 * sizeF;
    addChain([{ a: Math.PI / 2, half: (bezelHalf(config.cut, s) - 0.03) / R }]);
    const g = radialWrap(makeBezel(config.cut));
    g.scale.setScalar(s);
    placeOut(g, Math.PI / 2);
    model.add(g);
  } else if (style.id === "station") {
    // three stations spaced across the front, the rest left as plain chain
    const s = 0.5 * sizeF;
    const offs = [-0.7, 0, 0.7];
    const half = (bezelHalf(config.cut, s) - 0.03) / R;
    addChain(offs.map((o) => ({ a: Math.PI / 2 + o, half })));
    for (const off of offs) {
      const g = radialWrap(makeBezel(config.cut));
      g.scale.setScalar(s);
      placeOut(g, Math.PI / 2 + off);
      model.add(g);
    }
  } else if (style.id === "bar") {
    // the chain parts at the top and a slim rounded bar bridges the gap,
    // channel-set with exactly the row of stones its length can hold
    const gapHalf = 0.42;
    addChain([{ a: Math.PI / 2, half: gapHalf }]);

    const endX = R * Math.sin(gapHalf);
    const barY = R * Math.cos(gapHalf) + 0.06;
    const barR = 0.078;
    const barLen = endX * 2;
    const barGeo = new THREE.CylinderGeometry(barR, barR, barLen - barR * 2, 12);
    const capGeo = new THREE.SphereGeometry(barR, 10, 8);
    disposables.push(barGeo, capGeo);
    const bar = new THREE.Mesh(barGeo, metalMat);
    bar.rotation.z = Math.PI / 2;
    bar.position.set(0, barY, 0);
    model.add(bar);
    for (const sgn of [-1, 1]) {
      const cap = new THREE.Mesh(capGeo, metalMat);
      cap.position.set(sgn * (barLen / 2 - barR), barY, 0);
      model.add(cap);
    }

    const s = 0.26 * sizeF;
    const d = 2 * tangentHalf(config.cut, s) + 0.008;
    const nStones = Math.max(3, Math.floor((barLen - barR * 4) / d));
    for (let i = 0; i < nStones; i++) {
      const x = (i - (nStones - 1) / 2) * d;
      const g = radialWrap(makeStone(config.cut, gemMat, disposables));
      g.scale.setScalar(s);
      // tables just proud of the bar's outer face; pavilions sunk into the channel
      g.position.set(x, barY + barR - 0.06 * s, 0);
      model.add(g);
    }
  } else {
    // mixed: four spaced bezels across the front — marquise lying lengthwise
    // along the chain, alternating with the client's chosen shape
    const s = 0.46 * sizeF;
    const offs = [-0.95, -0.32, 0.32, 0.95];
    const altCut: GemCut = config.cut === "marquise" ? "round" : "marquise";
    const cuts = offs.map((_, i) => (i % 2 ? config.cut : altCut));
    addChain(
      offs.map((o, i) => ({
        a: Math.PI / 2 + o,
        half: (bezelHalf(cuts[i], s) - 0.03) / R,
      })),
    );
    offs.forEach((off, i) => {
      const g = radialWrap(makeBezel(cuts[i]));
      g.scale.setScalar(s);
      placeOut(g, Math.PI / 2 + off);
      model.add(g);
    });
  }

  state.disposables.push(...disposables);
  return model;
}

function buildModel(state: ThreeState, config: RingConfig): THREE.Group {
  state.caratGroups = [];
  const model =
    config.piece === "necklace"
      ? buildNecklace(state, config)
      : config.piece === "bracelet"
        ? buildBracelet(state, config)
        : buildRing(state, config);

  // apply the current carat immediately so rebuilds don't "pop" the size
  const caratScale = Math.cbrt(config.carat);
  for (const { g, base } of state.caratGroups) {
    g.scale.multiplyScalar(caratScale * base);
  }
  return model;
}

export default function BespokeJewel3D({ config }: { config: RingConfig }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef<ThreeState | null>(null);
  const silhouetteRef = useRef("");

  /* ---------- one-time scene setup ---------- */
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const quality = detectQuality();
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      38,
      container.clientWidth / Math.max(container.clientHeight, 1),
      0.1,
      100,
    );

    let dpr = Math.min(window.devicePixelRatio || 1, quality.dprCap);
    const renderer = new THREE.WebGLRenderer({
      antialias: !quality.mobile || dpr < 1.5, // high-DPR mobile screens hide aliasing anyway
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(dpr);
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.4;
    container.appendChild(renderer.domElement);

    const envMap = createEnvMap(quality);
    scene.environment = envMap;

    scene.add(new THREE.AmbientLight(0xffffff, 0.6));
    const mainLight = new THREE.DirectionalLight(0xffffff, 2.2);
    mainLight.position.set(5, 10, 5);
    scene.add(mainLight);

    const fire1 = new THREE.PointLight(0x00ffff, 5.0, 5);
    const fire2 = new THREE.PointLight(0xff00ff, 5.0, 5);
    const fire3 = new THREE.PointLight(0xffdf80, 4.0, 4);
    fire3.position.set(0, 1, 2);
    scene.add(fire1, fire3);
    if (!quality.mobile) scene.add(fire2); // one fewer per-fragment light on phones

    const metal = metalById(config.metal);
    const gem = gemById(config.gem);

    const metalMat = new THREE.MeshPhysicalMaterial({
      color: metal.hex3d,
      roughness: 0.05,
      metalness: 0.98,
      clearcoat: 1.0,
      clearcoatRoughness: 0.03,
      reflectivity: 1.0,
      envMap,
    });

    const gemMat = new THREE.MeshPhysicalMaterial({
      color: gem.hex3d,
      roughness: 0.0,
      metalness: 0.0,
      transmission: gem.transmission,
      ior: gem.ior,
      thickness: 0.55,
      transparent: true,
      side: THREE.DoubleSide,
      flatShading: true,
      specularIntensity: 1.0,
      specularColor: new THREE.Color(0xffffff),
      envMap,
    });

    const accentMat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      roughness: 0.0,
      metalness: 0.0,
      transmission: 0.96,
      ior: 2.417,
      thickness: 0.3,
      transparent: true,
      side: THREE.DoubleSide,
      flatShading: true,
      envMap,
    });

    const modelGroup = new THREE.Group();
    scene.add(modelGroup);

    /* drag-to-orbit with inertial damping.
       Home pose presents the crown TO the camera — the stone must always face
       the client. Each piece has its own camera distance, lift and home pose. */
    let stage = STAGE[config.piece];
    camera.position.set(0, 0, stage.camZ);
    modelGroup.position.y = stage.y;
    modelGroup.scale.setScalar(stage.scale);

    let isDragging = false;
    let hasInteracted = false; // once the client grabs the piece, it's theirs — no snap-back
    let prev = { x: 0, y: 0 };
    let targetRotY = stage.yawHome;
    let targetRotX = stage.tiltX;
    // Start ON the hero pose — no easing in from an awkward angle.
    modelGroup.rotation.set(stage.tiltX, stage.yawHome, 0);

    const state: ThreeState = {
      scene,
      camera,
      renderer,
      envMap,
      metalMat,
      gemMat,
      accentMat,
      modelGroup,
      modelRoot: null,
      caratGroups: [],
      quality,
      disposables: [],
      applyStage: (piece: PieceId) => {
        const next = STAGE[piece];
        if (next === stage) return;
        stage = next;
        const d = reduceMotion ? 0 : 0.9;
        gsap.to(camera.position, { z: stage.camZ, duration: d, ease: "power3.inOut" });
        gsap.to(modelGroup.position, { y: stage.y, duration: d, ease: "power3.inOut" });
        gsap.to(modelGroup.scale, { x: stage.scale, y: stage.scale, z: stage.scale, duration: d, ease: "power3.inOut" });
        if (!hasInteracted) {
          targetRotX = stage.tiltX;
          targetRotY = stage.yawHome;
        }
      },
    };
    stateRef.current = state;

    const onDown = (x: number, y: number) => {
      isDragging = true;
      hasInteracted = true;
      prev = { x, y };
    };
    const onMove = (x: number, y: number) => {
      if (!isDragging) return;
      targetRotY += (x - prev.x) * 0.007;
      targetRotX += (y - prev.y) * 0.007;
      targetRotX = Math.max(-1.2, Math.min(1.2, targetRotX));
      prev = { x, y };
    };
    const mouseDown = (e: MouseEvent) => onDown(e.clientX, e.clientY);
    const mouseMove = (e: MouseEvent) => onMove(e.clientX, e.clientY);
    const mouseUp = () => (isDragging = false);
    const touchStart = (e: TouchEvent) => e.touches[0] && onDown(e.touches[0].clientX, e.touches[0].clientY);
    const touchMove = (e: TouchEvent) => e.touches[0] && onMove(e.touches[0].clientX, e.touches[0].clientY);
    const touchEnd = () => (isDragging = false);

    container.addEventListener("mousedown", mouseDown);
    window.addEventListener("mousemove", mouseMove);
    window.addEventListener("mouseup", mouseUp);
    container.addEventListener("touchstart", touchStart, { passive: true });
    window.addEventListener("touchmove", touchMove, { passive: true });
    window.addEventListener("touchend", touchEnd);

    /* render loop — pausable, with adaptive resolution */
    const clock = new THREE.Clock();
    let raf = 0;
    let running = false;
    let inView = true;
    let pageVisible = document.visibilityState !== "hidden";
    let lastT = 0;
    let frameAcc = 0;
    let frameCount = 0;

    const animate = () => {
      raf = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();
      const dt = t - lastT;
      lastT = t;

      // If sustained frame times run long, shed resolution before shedding beauty.
      if (dt > 0 && dt < 0.25) {
        frameAcc += dt;
        frameCount++;
        if (frameCount >= 120) {
          if (frameAcc / frameCount > 0.026 && dpr > 1) {
            dpr = Math.max(1, dpr - 0.25);
            renderer.setPixelRatio(dpr);
          }
          frameAcc = 0;
          frameCount = 0;
        }
      }

      if (!isDragging && !hasInteracted) {
        // Gentle showcase sway around the hero pose — only until the client
        // takes over. After a drag, the piece holds whatever angle they chose.
        const sway = stage.yawHome + (reduceMotion ? 0 : Math.sin(t * 0.45) * stage.sway);
        targetRotY += (sway - targetRotY) * 0.03;
        targetRotX += (stage.tiltX - targetRotX) * 0.045;
      }
      modelGroup.rotation.x += (targetRotX - modelGroup.rotation.x) * 0.1;
      modelGroup.rotation.y += (targetRotY - modelGroup.rotation.y) * 0.1;
      const wobble = reduceMotion ? 0 : Math.cos(t * 0.12) * 0.03;
      modelGroup.rotation.z += (wobble - modelGroup.rotation.z) * 0.1;

      fire1.position.set(1.5 * Math.cos(t * 1.6), 2, 1.5 * Math.sin(t * 1.6));
      fire2.position.set(-1.5 * Math.cos(t * 1.9), 2, -1.5 * Math.sin(t * 1.9));

      renderer.render(scene, camera);
    };

    const syncRunning = () => {
      const should = inView && pageVisible;
      if (should && !running) {
        running = true;
        lastT = clock.getElapsedTime(); // don't count the paused gap as a slow frame
        raf = requestAnimationFrame(animate);
      } else if (!should && running) {
        running = false;
        cancelAnimationFrame(raf);
      }
    };
    syncRunning();

    const io = new IntersectionObserver(
      ([entry]) => {
        inView = entry.isIntersecting;
        syncRunning();
      },
      { threshold: 0.01 },
    );
    io.observe(container);

    const onVisibility = () => {
      pageVisible = document.visibilityState !== "hidden";
      syncRunning();
    };
    document.addEventListener("visibilitychange", onVisibility);

    const ro = new ResizeObserver(() => {
      const w = container.clientWidth;
      const h = Math.max(container.clientHeight, 1);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    });
    ro.observe(container);

    return () => {
      cancelAnimationFrame(raf);
      running = false;
      io.disconnect();
      ro.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      container.removeEventListener("mousedown", mouseDown);
      window.removeEventListener("mousemove", mouseMove);
      window.removeEventListener("mouseup", mouseUp);
      container.removeEventListener("touchstart", touchStart);
      window.removeEventListener("touchmove", touchMove);
      window.removeEventListener("touchend", touchEnd);
      gsap.killTweensOf([camera.position, modelGroup.position, modelGroup.scale]);
      state.disposables.forEach((d) => d.dispose());
      metalMat.dispose();
      gemMat.dispose();
      accentMat.dispose();
      envMap.dispose();
      renderer.dispose();
      if (container.contains(renderer.domElement)) container.removeChild(renderer.domElement);
      stateRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ---------- rebuild model when the silhouette changes ----------
     Bracelets also rebuild on carat: their whole layout (stone counts, chain
     terminations) is solved from the stone size, so a tweened scale would
     re-open the gaps the solver closed. */
  const braceletCarat = config.piece === "bracelet" ? config.carat : 0;
  useEffect(() => {
    const state = stateRef.current;
    if (!state) return;

    // tear down previous model
    state.modelGroup.clear();
    state.disposables.forEach((d) => d.dispose());
    state.disposables = [];

    const model = buildModel(state, config);
    state.modelGroup.add(model);
    state.modelRoot = model;
    state.applyStage(config.piece);

    // bracelets scale subtly with the chosen wrist fit
    const s = config.piece === "bracelet" ? fitById(config.fit).scale3d : 1;
    model.scale.setScalar(s);

    // elastic entrance so each silhouette change feels like a reveal —
    // but not while the carat slider merely re-solves the same silhouette
    const silhouette = `${config.piece}/${config.setting}/${config.cut}/${config.braceletStyle}`;
    const silhouetteChanged = silhouetteRef.current !== silhouette;
    silhouetteRef.current = silhouette;
    if (silhouetteChanged && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      gsap.fromTo(
        model.scale,
        { x: s * 0.55, y: s * 0.55, z: s * 0.55 },
        { x: s, y: s, z: s, duration: 1.1, ease: "elastic.out(1, 0.55)" },
      );
      gsap.fromTo(model.rotation, { y: -0.6 }, { y: 0, duration: 1.1, ease: "power3.out" });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config.piece, config.setting, config.cut, config.braceletStyle, braceletCarat]);

  /* ---------- tween metal color ---------- */
  useEffect(() => {
    const state = stateRef.current;
    if (!state) return;
    const c = new THREE.Color(metalById(config.metal).hex3d);
    gsap.to(state.metalMat.color, { r: c.r, g: c.g, b: c.b, duration: 0.7, ease: "power2.out" });
  }, [config.metal]);

  /* ---------- tween gemstone color & optics ---------- */
  useEffect(() => {
    const state = stateRef.current;
    if (!state) return;
    const gem = gemById(config.gem);
    const c = new THREE.Color(gem.hex3d);
    gsap.to(state.gemMat.color, { r: c.r, g: c.g, b: c.b, duration: 0.7, ease: "power2.out" });
    gsap.to(state.gemMat, {
      transmission: gem.transmission,
      ior: gem.ior,
      duration: 0.7,
      ease: "power2.out",
    });
  }, [config.gem]);

  /* ---------- tween carat (every carat-bearing stone group) ----------
     Bracelets are excluded: carat re-solves their whole layout above. */
  useEffect(() => {
    const state = stateRef.current;
    if (config.piece === "bracelet") return;
    if (!state?.caratGroups.length) return;
    const caratScale = Math.cbrt(config.carat);
    for (const { g, base } of state.caratGroups) {
      const s = caratScale * base;
      gsap.to(g.scale, { x: s, y: s, z: s, duration: 0.55, ease: "power3.out" });
    }
  }, [config.carat, config.piece]);

  /* ---------- tween wrist fit (whole-bracelet scale) ---------- */
  useEffect(() => {
    const state = stateRef.current;
    if (!state?.modelRoot || config.piece !== "bracelet") return;
    const s = fitById(config.fit).scale3d;
    gsap.to(state.modelRoot.scale, { x: s, y: s, z: s, duration: 0.55, ease: "power3.out" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config.fit]);

  return (
    <div
      ref={containerRef}
      className="h-full w-full cursor-grab select-none active:cursor-grabbing"
      style={{ WebkitTapHighlightColor: "transparent" }}
      aria-label={`Interactive 3D preview of your bespoke ${pieceById(config.piece).noun} — drag to rotate`}
      role="img"
    />
  );
}
