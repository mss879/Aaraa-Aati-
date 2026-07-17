"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import gsap from "gsap";
import {
  type PieceId,
  type RingConfig,
  fitById,
  metalById,
  gemById,
  pieceById,
} from "@/lib/ring-options";

/**
 * BespokeJewel3D
 * A live, configurable WebGL preview of the client's piece — ring, necklace
 * or bracelet share one scene, one set of materials and one render loop.
 *  - piece / setting / cut changes rebuild the low-poly model with an elastic entrance
 *  - metal / gem changes GSAP-tween the physical material colors in place
 *  - carat changes tween the scale of the head (stone + crown) group
 * Drag to orbit; idles with a slow ambient sway.
 *
 * Performance: DPR is capped (tighter on mobile) and steps down if frames run
 * long, geometry density drops on coarse-pointer devices, the chain is a single
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
  headGroup: THREE.Group | null;
  headBaseScale: number;
  quality: Quality;
  disposables: Disposable[];
  applyStage: (piece: PieceId) => void;
};

/* How each piece is presented: camera pull-back, lift, and idle "home" pose. */
const STAGE: Record<PieceId, { camZ: number; y: number; scale: number; tiltX: number; yawHome: number; sway: number }> = {
  ring: { camZ: 7.8, y: 0.18, scale: 1.05, tiltX: 0.52, yawHome: -0.3, sway: 0.38 },
  necklace: { camZ: 10.9, y: 0.3, scale: 1.0, tiltX: 0.1, yawHome: -0.16, sway: 0.22 },
  bracelet: { camZ: 9.4, y: 0.05, scale: 1.0, tiltX: 0.5, yawHome: -0.3, sway: 0.34 },
};

/* Ring band proportions. */
const RING_SPEC = { radius: 1.5, tube: 0.11, trinityAngle: 0.38, paveCount: 12, paveSpread: Math.PI / 2.5 };
/* Bracelet loop radius — pure metal, styled by config.braceletStyle. */
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

/** Center-stone geometry per cut: a faceted crown + pavilion pair, plus an XZ footprint scale. */
function makeStone(
  cut: RingConfig["cut"],
  material: THREE.Material,
  disposables: Disposable[],
): { group: THREE.Group; girdle: number } {
  const group = new THREE.Group();

  // radial segment count + squash define the silhouette of each cut
  const spec = {
    round: { seg: 16, sx: 1, sz: 1, rotate: 0 },
    princess: { seg: 4, sx: 1.05, sz: 1.05, rotate: Math.PI / 4 },
    oval: { seg: 16, sx: 1.28, sz: 0.82, rotate: 0 },
    emerald: { seg: 8, sx: 1.24, sz: 0.78, rotate: Math.PI / 8 },
  }[cut];

  const crownGeo = new THREE.CylinderGeometry(0.22, 0.35, 0.14, spec.seg, 1);
  const pavilionGeo = new THREE.ConeGeometry(0.35, 0.38, spec.seg, 1);
  disposables.push(crownGeo, pavilionGeo);

  const crown = new THREE.Mesh(crownGeo, material);
  crown.position.y = 0.07;
  const pavilion = new THREE.Mesh(pavilionGeo, material);
  pavilion.position.y = -0.19;
  pavilion.rotation.x = Math.PI;

  group.add(crown, pavilion);
  group.scale.set(spec.sx, 1, spec.sz);
  group.rotation.y = spec.rotate;
  return { group, girdle: 0.35 * Math.max(spec.sx, spec.sz) };
}

/** The crown assembly: seat, collar, prongs, center stone — and a halo when set. */
function makeHead(state: ThreeState, config: RingConfig, disposables: Disposable[]): THREE.Group {
  const { metalMat, gemMat, accentMat, quality: q } = state;
  const head = new THREE.Group();

  const seatGeo = new THREE.CylinderGeometry(0.2, 0.15, 0.1, 16);
  disposables.push(seatGeo);
  const seat = new THREE.Mesh(seatGeo, metalMat);
  seat.position.y = 0.02;
  head.add(seat);

  const collarGeo = new THREE.TorusGeometry(0.25, 0.025, 8, 24);
  disposables.push(collarGeo);
  const collar = new THREE.Mesh(collarGeo, metalMat);
  collar.position.y = 0.12;
  collar.rotation.x = Math.PI / 2;
  head.add(collar);

  // princess crowns look right with 4 corner prongs; everything else takes 6
  const prongCount = config.cut === "princess" ? 4 : 6;
  const prongGeo = new THREE.CylinderGeometry(0.03, 0.02, 0.52, q.prongSeg);
  disposables.push(prongGeo);
  for (let i = 0; i < prongCount; i++) {
    const angle = (i / prongCount) * Math.PI * 2 + (prongCount === 4 ? Math.PI / 4 : 0);
    const prong = new THREE.Mesh(prongGeo, metalMat);
    prong.position.set(Math.cos(angle) * 0.28, 0.16, Math.sin(angle) * 0.28);
    prong.rotation.z = -Math.cos(angle) * 0.16;
    prong.rotation.x = Math.sin(angle) * 0.16;
    head.add(prong);
  }

  const { group: stone, girdle } = makeStone(config.cut, gemMat, disposables);
  stone.position.y = 0.26;
  head.add(stone);

  // --- halo: a circlet of micro-diamonds around the girdle of the center stone ---
  if (config.setting === "halo") {
    const haloGemGeo = new THREE.IcosahedronGeometry(0.06, 1);
    const haloRailGeo = new THREE.TorusGeometry(girdle + 0.12, 0.028, 8, 40);
    disposables.push(haloGemGeo, haloRailGeo);

    const rail = new THREE.Mesh(haloRailGeo, metalMat);
    rail.position.y = 0.28;
    rail.rotation.x = Math.PI / 2;
    head.add(rail);

    const haloCount = 14;
    for (let i = 0; i < haloCount; i++) {
      const a = (i / haloCount) * Math.PI * 2;
      const g = new THREE.Mesh(haloGemGeo, accentMat);
      g.position.set(Math.cos(a) * (girdle + 0.12), 0.3, Math.sin(a) * (girdle + 0.12));
      head.add(g);
    }
  }

  return head;
}

/** Ring: a solid polished torus band crowned by the head. */
function buildRing(state: ThreeState, config: RingConfig): THREE.Group {
  const { metalMat, gemMat, accentMat, quality: q } = state;
  const spec = RING_SPEC;
  const disposables: Disposable[] = [];
  const model = new THREE.Group();

  // --- band ---
  const bandGeo = new THREE.TorusGeometry(spec.radius, spec.tube, q.bandRadial, q.bandTubular);
  disposables.push(bandGeo);
  model.add(new THREE.Mesh(bandGeo, metalMat));

  // --- head — pivots where the stone meets the band ---
  const head = makeHead(state, config, disposables);
  head.position.set(0, spec.radius, 0);
  model.add(head);

  // --- trinity: two smaller companion stones seated on the shoulders of the band ---
  if (config.setting === "trinity") {
    const sideSeatGeo = new THREE.CylinderGeometry(0.12, 0.09, 0.08, 12);
    disposables.push(sideSeatGeo);
    for (const dir of [-1, 1]) {
      const angle = Math.PI / 2 + dir * spec.trinityAngle;
      const x = Math.cos(angle) * spec.radius;
      const y = Math.sin(angle) * spec.radius;

      const sideGroup = new THREE.Group();
      sideGroup.position.set(x, y, 0);
      sideGroup.rotation.z = angle - Math.PI / 2; // stand perpendicular to the band

      const sideSeat = new THREE.Mesh(sideSeatGeo, metalMat);
      sideSeat.position.y = 0.03;
      sideGroup.add(sideSeat);

      const { group: sideStone } = makeStone(config.cut, gemMat, disposables);
      sideStone.scale.multiplyScalar(0.52);
      sideStone.position.y = 0.16;
      sideGroup.add(sideStone);

      model.add(sideGroup);
    }
  }

  // --- pavé: accent diamonds running along the shoulders of the band ---
  if (config.setting === "pave") {
    const paveGemGeo = new THREE.IcosahedronGeometry(0.065, 1);
    const paveCupGeo = new THREE.CylinderGeometry(0.075, 0.065, 0.04, 8);
    disposables.push(paveGemGeo, paveCupGeo);

    for (let i = 0; i < spec.paveCount; i++) {
      const t = (i / (spec.paveCount - 1)) * 2 - 1;
      if (Math.abs(t) < 0.15) continue; // leave room for the crown seat
      const angle = t * spec.paveSpread + Math.PI / 2;

      const set = new THREE.Group();
      set.position.set(Math.cos(angle) * spec.radius, Math.sin(angle) * spec.radius, 0);
      set.rotation.z = angle - Math.PI / 2;

      const cup = new THREE.Mesh(paveCupGeo, metalMat);
      cup.position.y = 0.02;
      const gemMesh = new THREE.Mesh(paveGemGeo, accentMat);
      gemMesh.position.y = 0.045;
      set.add(cup, gemMesh);
      model.add(set);
    }
  }

  // carry over current carat scale so rebuilds don't "pop" the size
  head.scale.setScalar(Math.cbrt(config.carat) * HEAD_BASE_SCALE.ring);

  state.headGroup = head;
  state.disposables.push(...disposables);
  return model;
}

/**
 * Bracelet: pure precious metal, no stone — four silhouettes driven by
 * config.braceletStyle: cable chain, solid bangle, curb chain, twisted rope.
 */
function buildBracelet(state: ThreeState, config: RingConfig): THREE.Group {
  const { metalMat, quality: q } = state;
  const R = BRACELET_RADIUS;
  const disposables: Disposable[] = [];
  const model = new THREE.Group();
  const style = config.braceletStyle;

  if (style === "bangle") {
    // --- one unbroken mirror-polished band, broadened into a cuff profile ---
    const geo = new THREE.TorusGeometry(R, 0.14, q.bandRadial, q.bandTubular);
    disposables.push(geo);
    const bangle = new THREE.Mesh(geo, metalMat);
    bangle.scale.z = 2.3;
    model.add(bangle);
  } else if (style === "rope") {
    // --- three strands wound about the loop, phase-shifted 120° apart ---
    const STRANDS = 3;
    const TWISTS = 9;
    const wind = 0.09;
    const samples = q.mobile ? 100 : 160;
    for (let s = 0; s < STRANDS; s++) {
      const phase = (s / STRANDS) * Math.PI * 2;
      const pts: THREE.Vector3[] = [];
      for (let i = 0; i < samples; i++) {
        const th = (i / samples) * Math.PI * 2;
        const r = R + wind * Math.cos(TWISTS * th + phase);
        pts.push(new THREE.Vector3(Math.cos(th) * r, Math.sin(th) * r, wind * Math.sin(TWISTS * th + phase)));
      }
      const curve = new THREE.CatmullRomCurve3(pts, true, "centripetal");
      const geo = new THREE.TubeGeometry(curve, q.mobile ? 110 : 180, 0.062, q.mobile ? 5 : 7, true);
      disposables.push(geo);
      model.add(new THREE.Mesh(geo, metalMat));
    }
  } else {
    // --- cable & curb: one InstancedMesh of interlocking links around the loop ---
    const curb = style === "curb";
    const linkGeo = new THREE.TorusGeometry(curb ? 0.14 : 0.115, curb ? 0.042 : 0.034, q.linkRadial, q.linkTubular);
    disposables.push(linkGeo);
    const count = curb ? Math.round(q.chainLinks * 1.15) : q.chainLinks;
    const chain = new THREE.InstancedMesh(linkGeo, metalMat, count);
    disposables.push(chain);

    const dummy = new THREE.Object3D();
    dummy.up.set(0, 0, 1); // tangents live in the XY plane — keep lookAt stable
    for (let i = 0; i < count; i++) {
      const a = (i / count) * Math.PI * 2;
      const px = Math.cos(a) * R;
      const py = Math.sin(a) * R;
      dummy.position.set(px, py, 0);
      dummy.lookAt(px - Math.sin(a), py + Math.cos(a), 0);
      dummy.rotateX(Math.PI / 2); // thread the link onto the chain direction
      if (curb) {
        dummy.rotateY(i % 2 ? Math.PI / 6 : -Math.PI / 6); // twisted links lying flush
        dummy.scale.set(1, 1, 0.45); // flattened curb profile
      } else {
        dummy.rotateY((i % 2) * (Math.PI / 2)); // alternate links like a real cable chain
        dummy.scale.set(1, 1, 1);
      }
      dummy.updateMatrix();
      chain.setMatrixAt(i, dummy.matrix);
    }
    chain.instanceMatrix.needsUpdate = true;
    model.add(chain);

    // --- clasp: a slightly larger polished link at the base of the loop ---
    const claspGeo = new THREE.TorusGeometry(0.17, 0.045, 8, 20);
    disposables.push(claspGeo);
    const clasp = new THREE.Mesh(claspGeo, metalMat);
    clasp.position.set(0, -R, 0);
    model.add(clasp);
  }

  state.headGroup = null; // pure metal — nothing for carat to scale
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

/** Necklace: instanced chain links along a drape curve, pendant head at the throat. */
function buildNecklace(state: ThreeState, config: RingConfig): THREE.Group {
  const { metalMat, gemMat, accentMat, quality: q } = state;
  const disposables: Disposable[] = [];
  const model = new THREE.Group();

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

  // --- bail + drop stem connecting chain to pendant ---
  const bailGeo = new THREE.TorusGeometry(0.11, 0.032, 8, 20);
  const stemGeo = new THREE.CylinderGeometry(0.024, 0.032, 0.3, 8);
  disposables.push(bailGeo, stemGeo);

  const bail = new THREE.Mesh(bailGeo, metalMat);
  bail.position.set(bottom.x, bottom.y - 0.14, bottom.z);
  model.add(bail);

  const stem = new THREE.Mesh(stemGeo, metalMat);
  stem.position.set(bottom.x, bottom.y - 0.4, bottom.z + 0.02);
  model.add(stem);

  // --- pendant head: the ring's crown, rotated to face the viewer ---
  const head = makeHead(state, config, disposables);
  head.position.set(bottom.x, bottom.y - 0.72, bottom.z + 0.02);
  head.rotation.x = Math.PI / 2; // stone table toward the camera, prongs behind
  model.add(head);

  // --- trinity: two smaller companions set along the chain beside the pendant ---
  if (config.setting === "trinity") {
    const sideSeatGeo = new THREE.CylinderGeometry(0.1, 0.08, 0.06, 12);
    disposables.push(sideSeatGeo);
    for (const t of [0.06, 0.94]) {
      const p = curve.getPointAt(t);
      const sideGroup = new THREE.Group();
      sideGroup.position.set(p.x, p.y, p.z + 0.08);
      sideGroup.rotation.x = Math.PI / 2;
      sideGroup.scale.setScalar(0.55);

      const sideSeat = new THREE.Mesh(sideSeatGeo, metalMat);
      sideGroup.add(sideSeat);

      const { group: sideStone } = makeStone(config.cut, gemMat, disposables);
      sideStone.position.y = 0.1;
      sideGroup.add(sideStone);

      model.add(sideGroup);
    }
  }

  // --- pavé: accent diamonds set into the chain as it approaches the pendant ---
  if (config.setting === "pave") {
    const paveGemGeo = new THREE.IcosahedronGeometry(0.06, 1);
    const paveCupGeo = new THREE.CylinderGeometry(0.07, 0.06, 0.04, 8);
    disposables.push(paveGemGeo, paveCupGeo);

    for (const side of [1, -1]) {
      for (let i = 0; i < 5; i++) {
        const t = 0.03 + i * 0.02;
        const p = curve.getPointAt(side === 1 ? t : 1 - t);
        const set = new THREE.Group();
        set.position.set(p.x, p.y, p.z + 0.06);
        set.rotation.x = Math.PI / 2;

        const cup = new THREE.Mesh(paveCupGeo, metalMat);
        const gemMesh = new THREE.Mesh(paveGemGeo, accentMat);
        gemMesh.position.y = 0.04;
        set.add(cup, gemMesh);
        model.add(set);
      }
    }
  }

  head.scale.setScalar(Math.cbrt(config.carat) * HEAD_BASE_SCALE.necklace);

  state.headGroup = head;
  state.disposables.push(...disposables);
  return model;
}

function buildModel(state: ThreeState, config: RingConfig): THREE.Group {
  state.headBaseScale = HEAD_BASE_SCALE[config.piece];
  if (config.piece === "necklace") return buildNecklace(state, config);
  if (config.piece === "bracelet") return buildBracelet(state, config);
  return buildRing(state, config);
}

export default function BespokeJewel3D({ config }: { config: RingConfig }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef<ThreeState | null>(null);

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
      headGroup: null,
      headBaseScale: 1,
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

  /* ---------- rebuild model when the silhouette changes ---------- */
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

    // elastic entrance so each silhouette change feels like a reveal
    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      gsap.fromTo(
        model.scale,
        { x: s * 0.55, y: s * 0.55, z: s * 0.55 },
        { x: s, y: s, z: s, duration: 1.1, ease: "elastic.out(1, 0.55)" },
      );
      gsap.fromTo(model.rotation, { y: -0.6 }, { y: 0, duration: 1.1, ease: "power3.out" });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config.piece, config.setting, config.cut, config.braceletStyle]);

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

  /* ---------- tween carat (head scale) ---------- */
  useEffect(() => {
    const state = stateRef.current;
    if (!state?.headGroup) return;
    const s = Math.cbrt(config.carat) * state.headBaseScale;
    gsap.to(state.headGroup.scale, { x: s, y: s, z: s, duration: 0.55, ease: "power3.out" });
  }, [config.carat]);

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
