"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import gsap from "gsap";
import {
  type RingConfig,
  metalById,
  gemById,
} from "@/lib/ring-options";

/**
 * BespokeRing3D
 * A live, configurable WebGL preview of the client's ring.
 *  - setting / cut changes rebuild the low-poly model with an elastic entrance
 *  - metal / gem changes GSAP-tween the physical material colors in place
 *  - carat changes tween the scale of the head (stone + crown) group
 * Drag to orbit; idles with a slow ambient spin like the showroom Ring3D.
 */

const BAND_RADIUS = 1.5;
const HEAD_Y = BAND_RADIUS; // the head group pivots where the stone meets the band

type ThreeState = {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
  envMap: THREE.Texture;
  metalMat: THREE.MeshPhysicalMaterial;
  gemMat: THREE.MeshPhysicalMaterial;
  accentMat: THREE.MeshPhysicalMaterial;
  ringGroup: THREE.Group;
  headGroup: THREE.Group | null;
  disposables: (THREE.BufferGeometry | THREE.Material | THREE.Texture)[];
};

/* Procedural studio env map (same lightbox recipe as the showroom ring). */
function createEnvMap(): THREE.Texture {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
    grad.addColorStop(0, "#ffffff");
    grad.addColorStop(0.38, "#c8c8c8");
    grad.addColorStop(0.48, "#1a1a1c");
    grad.addColorStop(0.52, "#08080a");
    grad.addColorStop(0.68, "#2c2a26");
    grad.addColorStop(1, "#121214");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "rgba(255,255,255,0.45)";
    ctx.fillRect(120, 0, 70, canvas.height);
    ctx.fillRect(450, 0, 100, canvas.height);
    ctx.fillRect(780, 0, 80, canvas.height);
    ctx.fillStyle = "rgba(255,220,180,0.25)";
    ctx.fillRect(300, 0, 50, canvas.height);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.mapping = THREE.EquirectangularReflectionMapping;
  return texture;
}

/** Center-stone geometry per cut: a faceted crown + pavilion pair, plus an XZ footprint scale. */
function makeStone(
  cut: RingConfig["cut"],
  material: THREE.Material,
  disposables: ThreeState["disposables"],
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

/** Build the full ring for the given setting/cut into a fresh group. */
function buildRing(state: ThreeState, config: RingConfig) {
  const { metalMat, gemMat, accentMat } = state;
  const disposables: ThreeState["disposables"] = [];
  const ring = new THREE.Group();

  // --- band ---
  const bandGeo = new THREE.TorusGeometry(BAND_RADIUS, 0.11, 32, 90);
  disposables.push(bandGeo);
  ring.add(new THREE.Mesh(bandGeo, metalMat));

  // --- head (seat, collar, prongs, center stone) — pivots at the top of the band ---
  const head = new THREE.Group();
  head.position.set(0, HEAD_Y, 0);

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
  const prongGeo = new THREE.CylinderGeometry(0.03, 0.02, 0.52, 8);
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

  ring.add(head);

  // --- trinity: two smaller companion stones seated on the shoulders of the band ---
  if (config.setting === "trinity") {
    const sideSeatGeo = new THREE.CylinderGeometry(0.12, 0.09, 0.08, 12);
    disposables.push(sideSeatGeo);
    for (const dir of [-1, 1]) {
      const angle = Math.PI / 2 + dir * 0.38; // ± ~22° from the top of the band
      const x = Math.cos(angle) * BAND_RADIUS;
      const y = Math.sin(angle) * BAND_RADIUS;

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

      ring.add(sideGroup);
    }
  }

  // --- pavé: accent diamonds running along the shoulders of the band ---
  if (config.setting === "pave") {
    const paveGemGeo = new THREE.IcosahedronGeometry(0.065, 1);
    const paveCupGeo = new THREE.CylinderGeometry(0.075, 0.065, 0.04, 8);
    disposables.push(paveGemGeo, paveCupGeo);

    const paveCount = 12;
    const spread = Math.PI / 2.5;
    for (let i = 0; i < paveCount; i++) {
      const t = (i / (paveCount - 1)) * 2 - 1;
      if (Math.abs(t) < 0.15) continue; // leave room for the crown seat
      const angle = t * spread + Math.PI / 2;

      const set = new THREE.Group();
      set.position.set(Math.cos(angle) * BAND_RADIUS, Math.sin(angle) * BAND_RADIUS, 0);
      set.rotation.z = angle - Math.PI / 2;

      const cup = new THREE.Mesh(paveCupGeo, metalMat);
      cup.position.y = 0.02;
      const gemMesh = new THREE.Mesh(paveGemGeo, accentMat);
      gemMesh.position.y = 0.045;
      set.add(cup, gemMesh);
      ring.add(set);
    }
  }

  // carry over current carat scale so rebuilds don't "pop" the size
  head.scale.setScalar(Math.cbrt(config.carat));

  state.headGroup = head;
  state.disposables.push(...disposables);
  return ring;
}

export default function BespokeRing3D({ config }: { config: RingConfig }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef<ThreeState | null>(null);

  /* ---------- one-time scene setup ---------- */
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      38,
      container.clientWidth / Math.max(container.clientHeight, 1),
      0.1,
      100,
    );
    camera.position.set(0, 0, 7.8);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.4;
    container.appendChild(renderer.domElement);

    const envMap = createEnvMap();
    scene.environment = envMap;

    scene.add(new THREE.AmbientLight(0xffffff, 0.6));
    const mainLight = new THREE.DirectionalLight(0xffffff, 2.2);
    mainLight.position.set(5, 10, 5);
    scene.add(mainLight);

    const fire1 = new THREE.PointLight(0x00ffff, 5.0, 5);
    const fire2 = new THREE.PointLight(0xff00ff, 5.0, 5);
    const fire3 = new THREE.PointLight(0xffdf80, 4.0, 4);
    fire3.position.set(0, 1, 2);
    scene.add(fire1, fire2, fire3);

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

    const ringGroup = new THREE.Group();
    ringGroup.scale.setScalar(1.05);
    ringGroup.position.y = 0.18; // lift clear of the spec readout overlay
    scene.add(ringGroup);

    const state: ThreeState = {
      scene,
      camera,
      renderer,
      envMap,
      metalMat,
      gemMat,
      accentMat,
      ringGroup,
      headGroup: null,
      disposables: [],
    };
    stateRef.current = state;

    /* drag-to-orbit with inertial damping.
       Home pose presents the crown TO the camera (positive X tilt) with a
       slight three-quarter turn — the stone must always face the client. */
    const HOME_TILT_X = 0.52;
    const HOME_Y = -0.3;
    let isDragging = false;
    let hasInteracted = false; // once the client grabs the ring, it's theirs — no snap-back
    let prev = { x: 0, y: 0 };
    let targetRotY = HOME_Y;
    let targetRotX = HOME_TILT_X;
    // Start ON the hero pose — no easing in from an awkward angle.
    ringGroup.rotation.set(HOME_TILT_X, HOME_Y, 0);

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

    let raf = 0;
    const clock = new THREE.Clock();
    const animate = () => {
      raf = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();
      if (!isDragging && !hasInteracted) {
        // Gentle showcase sway around the hero pose — only until the client
        // takes over. After a drag, the ring holds whatever angle they chose.
        const sway = HOME_Y + Math.sin(t * 0.45) * 0.38;
        targetRotY += (sway - targetRotY) * 0.03;
        targetRotX += (HOME_TILT_X - targetRotX) * 0.045;
      }
      ringGroup.rotation.x += (targetRotX - ringGroup.rotation.x) * 0.1;
      ringGroup.rotation.y += (targetRotY - ringGroup.rotation.y) * 0.1;
      ringGroup.rotation.z += (Math.cos(t * 0.12) * 0.03 - ringGroup.rotation.z) * 0.1;

      fire1.position.set(1.5 * Math.cos(t * 1.6), 2, 1.5 * Math.sin(t * 1.6));
      fire2.position.set(-1.5 * Math.cos(t * 1.9), 2, -1.5 * Math.sin(t * 1.9));

      renderer.render(scene, camera);
    };
    animate();

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
      ro.disconnect();
      container.removeEventListener("mousedown", mouseDown);
      window.removeEventListener("mousemove", mouseMove);
      window.removeEventListener("mouseup", mouseUp);
      container.removeEventListener("touchstart", touchStart);
      window.removeEventListener("touchmove", touchMove);
      window.removeEventListener("touchend", touchEnd);
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
    state.ringGroup.clear();
    state.disposables.forEach((d) => d.dispose());
    state.disposables = [];

    const ring = buildRing(state, config);
    state.ringGroup.add(ring);

    // elastic entrance so each silhouette change feels like a reveal
    gsap.fromTo(
      ring.scale,
      { x: 0.55, y: 0.55, z: 0.55 },
      { x: 1, y: 1, z: 1, duration: 1.1, ease: "elastic.out(1, 0.55)" },
    );
    gsap.fromTo(ring.rotation, { y: -0.6 }, { y: 0, duration: 1.1, ease: "power3.out" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config.setting, config.cut]);

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
    const s = Math.cbrt(config.carat);
    gsap.to(state.headGroup.scale, { x: s, y: s, z: s, duration: 0.55, ease: "power3.out" });
  }, [config.carat]);

  return (
    <div
      ref={containerRef}
      className="h-full w-full cursor-grab select-none active:cursor-grabbing"
      style={{ WebkitTapHighlightColor: "transparent" }}
      aria-label="Interactive 3D preview of your bespoke ring — drag to rotate"
      role="img"
    />
  );
}
