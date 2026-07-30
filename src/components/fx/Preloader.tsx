"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import gsap from "gsap";

/**
 * Preloader — "Particle Lockup".
 * Ink particles swirl out of chaos and settle into ONE slide — the Ceylon Gem
 * Maison lockup, sampled pixel-for-pixel from the real artwork, set above the
 * word WELCOME — hold it still, then dissolve as the veil hands off to the hero.
 *
 * Choreography is fixed at 1s appear / 0.5s still / 1.5s dissolve (APPEAR,
 * STILL, DISAPPEAR below). There is deliberately no second composition and no
 * morph between them: the lockup and the word arrive together, as one image.
 *
 * Palette notes:
 *  - The veil is white and every particle is the one theme blue (#2e5be0). Only
 *    the artwork's SHAPE is sampled, not its colour — the real lockup is a blue
 *    gem beside a navy wordmark, which reads as two competing blues once it is
 *    broken into particles.
 *  - Blending is straight alpha, NOT additive: additive cannot darken a white
 *    ground, so the old glow/twinkle/flare tricks would have been invisible.
 *    Shimmer therefore lives in opacity and point size instead of brightness.
 *  - The hero underneath is #0A1F3D. The veil cross-fades to that navy while the
 *    particles scatter, so a white ground never cuts straight to a dark hero.
 *
 * Performance notes:
 *  - Raw WebGL, one gl.POINTS draw call; every particle's motion (swirl,
 *    convergence, shimmer, exit scatter) is computed in the vertex shader from
 *    static attributes — zero per-frame CPU work besides five uniforms.
 *  - Adaptive particle count, device-pixel-ratio capped at 2.
 *  - No depth buffer, no textures, no extra dependencies.
 *  - The GL context is explicitly released and the overlay unmounted on exit.
 *  - prefers-reduced-motion (or a missing WebGL context, or artwork that will
 *    not decode) falls back to the static logo on a white veil.
 */

const VERT = `
attribute vec3 aStart;
attribute vec3 aTarget; // the slide: lockup over WELCOME, normalised so max|x| = 1
attribute vec3 aData;   // x: size(px)  y: phase  z: shimmer speed
attribute vec4 aArt;    // rgb: this facet's sapphire tone   a: 1 on the gem, 0 elsewhere
uniform float uProgress;
uniform float uTime;
uniform float uExpand;
uniform float uFade;
uniform float uAspect;
uniform float uFit;
uniform float uDpr;
uniform float uMarkScale;
uniform float uGemReveal;
uniform vec3 uInk;
varying vec3 vColor;
varying float vAlpha;

void main() {
  float ph = aData.y;

  // Staggered convergence to the slide: each particle locks in at its own moment.
  float t = clamp((uProgress - ph * 0.35) / 0.65, 0.0, 1.0);
  t = t * t * (3.0 - 2.0 * t);

  // Chaos cloud slowly swirls; its influence dies as the particle converges.
  float ang = uTime * (0.18 + 0.22 * fract(ph * 7.31));
  float c = cos(ang);
  float s = sin(ang);
  vec2 sp = mat2(c, -s, s, c) * aStart.xy;

  // The formed slide breathes only just enough not to look frozen. This used to
  // be nearly 3x wider; at that amplitude the sampled edges smear, which is the
  // opposite of sharp.
  vec2 tp = aTarget.xy * uMarkScale
          + 0.0018 * vec2(sin(uTime * 1.7 + ph * 40.0), cos(uTime * 1.3 + ph * 36.0));

  vec2 pos = mix(sp, tp, t);

  // Exit: dissipate outward — a drift, not the blast this used to be, because
  // the brief calls for the slide to fade away rather than be thrown off screen.
  vec2 dir = normalize(pos + vec2(0.0001));
  pos += dir * uExpand * (0.5 + fract(ph * 5.7) * 1.1);
  pos *= 1.0 + uExpand * 0.35;

  gl_Position = vec4(pos.x * uFit / uAspect, pos.y * uFit, 0.0, 1.0);

  // On a white ground shimmer has to live in opacity and size — a brightness
  // pulse would read as nothing at all. Kept shallow so the ink stays dense.
  float tw = 0.9 + 0.1 * sin(uTime * aData.z + ph * 50.0);
  // The floor is high on purpose: the incoming swarm has to be clearly visible
  // on white, otherwise the slide simply appears instead of forming.
  float a = (0.42 + 0.58 * t) * tw;
  a *= smoothstep(0.0, 0.10, uProgress); // gentle global fade-in
  a *= 1.0 - uFade;                      // the dissolve, driven on its own beat
  vAlpha = a;

  // The wordmark and the word stay one flat brand blue. The gem, once it has
  // landed, takes on its own facet tones so the stone reads as cut glass rather
  // than a blot, and keeps them for the whole hold.
  float gem = aArt.a * uGemReveal;

  // A highlight travels across the stone on a diagonal, the way a light source
  // crosses a real gem as it turns. Slower than it was: the stone is now cut
  // glass for the whole still and dissolve, so the sweep has room to cross once.
  float sweep = sin((tp.x * 2.6 - tp.y * 1.7) / max(uMarkScale, 0.001) - uTime * 3.2);
  float glint = smoothstep(0.72, 1.0, sweep) * gem;
  // a handful of facets catch the light far harder than the rest
  float spark = step(0.972, fract(ph * 91.7 + uTime * 0.7)) * gem;

  vec3 facet = mix(aArt.rgb, vec3(0.83, 0.93, 1.0), glint * 0.55 + spark * 0.7);
  vColor = mix(uInk, facet, gem);

  gl_PointSize = aData.x * uDpr
    * (0.72 + 0.38 * t + aTarget.z + spark * 0.8)
    * (0.94 + 0.06 * tw);
}
`;

const FRAG = `
precision mediump float;
varying vec3 vColor;
varying float vAlpha;

void main() {
  float d = length(gl_PointCoord - 0.5);
  // Solid core out to 0.42 with only a hairline anti-aliased rim. The wider
  // falloff this replaces turned every dot into a pale blob, which is most of
  // what read as "soft" in the artwork.
  float a = smoothstep(0.5, 0.42, d);
  gl_FragColor = vec4(vColor, a * vAlpha);
}
`;

const LOGO_SRC = "/main-logo.png";
const HERO_NAVY = "#0A1F3D"; // what the veil hands off to
/** --color-gold-500, the royal sapphire the whole site accents with. */
const THEME_BLUE: [number, number, number] = [0x2e / 255, 0x5b / 255, 0xe0 / 255];

/**
 * The gem's facets are re-toned onto this three-stop sapphire ramp rather than
 * used raw. The artwork runs from near-black to pure white, and both ends fail
 * here: white facets vanish into the white veil, and true black reads as dirt.
 * The ramp keeps the cut's tonal structure inside a range that stays visible
 * and on-brand.
 */
const FACET_DARK: [number, number, number] = [0.04, 0.11, 0.31];
const FACET_MID: [number, number, number] = [0.18, 0.36, 0.88];
const FACET_LIGHT: [number, number, number] = [0.51, 0.76, 0.98];

/**
 * The slide's beats, in seconds: gather into the slide, hold it still, dissolve.
 * These are the brief, not taste — keep the sum in mind when touching either the
 * hero-readiness race or the exit timeline.
 */
const APPEAR = 1.0;
const STILL = 0.5;
const DISAPPEAR = 1.5;

/** How much of the viewport the slide is allowed to fill (fraction of w / h). */
const MARK_FILL = { w: 0.44, h: 0.46 };

const WELCOME = "WELCOME";

/**
 * Where the gem ends and the wordmark begins, as a fraction of artwork width.
 * The gem's ink stops at ~0.217 and the wordmark's starts at ~0.262, so this
 * sits in the empty gutter between them.
 */
const GEM_SPLIT = 0.24;

type Cloud = {
  /** xy normalised so max|x| = 1, z a rare oversize nudge. */
  pos: Float32Array;
  /** Half-height over half-width, so the fit can respect the shape. */
  ky: number;
};

/** Perceived brightness of the RGBA pixel starting at `i`, 0–1. */
function luminance(data: Uint8ClampedArray, i: number): number {
  return (0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]) / 255;
}

/**
 * Resolve the artwork's two conflicting uses of white before anything samples it.
 *
 *  - The O of CEYLON and the O of MAISON have opaque WHITE counters instead of
 *    holes. Left alone they fill both letters in solid on a white veil.
 *  - The gem's bottom facets are also white, in runs up to 40px wide. Cutting
 *    by brightness alone punches visible holes straight through the stone.
 *
 * So the cut is by region, not by brightness alone: whites are knocked out of
 * the wordmark only, and the gem is kept whole. Everything downstream can then
 * treat alpha as the only test.
 */
function cleanArtwork(img: HTMLImageElement): HTMLCanvasElement | null {
  const w = img.naturalWidth;
  const h = img.naturalHeight;
  if (!w || !h) return null;

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return null;
  ctx.drawImage(img, 0, 0);

  const image = ctx.getImageData(0, 0, w, h);
  const data = image.data;
  const wordmarkFrom = Math.round(w * GEM_SPLIT);

  for (let y = 0; y < h; y++) {
    for (let x = wordmarkFrom; x < w; x++) {
      const i = (y * w + x) * 4;
      if (data[i + 3] >= 140 && luminance(data, i) > 0.92) data[i + 3] = 0;
    }
  }
  ctx.putImageData(image, 0, 0);
  return canvas;
}

/** Re-tone a facet's brightness onto the sapphire ramp. */
function facetTone(lum: number, out: Float32Array, at: number) {
  // widen the artwork's mid-range a little so the cut's structure stays legible
  const t = Math.min(1, Math.max(0, lum * 1.15));
  const [a, b] = t < 0.5 ? [FACET_DARK, FACET_MID] : [FACET_MID, FACET_LIGHT];
  const k = t < 0.5 ? t * 2 : (t - 0.5) * 2;
  out[at] = a[0] + (b[0] - a[0]) * k;
  out[at + 1] = a[1] + (b[1] - a[1]) * k;
  out[at + 2] = a[2] + (b[2] - a[2]) * k;
}

/**
 * Turn an offscreen canvas into a point cloud, normalised about its own centre.
 *
 * `gemRect` marks where the stone was drawn. Points inside it also carry a
 * re-toned facet colour and a gem flag, so the shader can light the stone as
 * cut glass while the wordmark stays flat brand blue.
 */
function sampleCanvas(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  count: number,
  step: number,
  gemRect?: { x: number; y: number; w: number; h: number },
): (Cloud & { art: Float32Array }) | null {
  const data = ctx.getImageData(0, 0, w, h).data;

  const xs: number[] = [];
  const ys: number[] = [];
  const lums: number[] = [];
  const gems: number[] = [];

  for (let y = 0; y < h; y += step) {
    for (let x = 0; x < w; x += step) {
      const i = (y * w + x) * 4;
      // cleanArtwork has already resolved what counts as ink, so alpha is the
      // whole truth here.
      if (data[i + 3] < 140) continue;
      xs.push(x - w / 2);
      ys.push(-(y - h / 2));
      const inGem =
        gemRect !== undefined &&
        x >= gemRect.x &&
        x < gemRect.x + gemRect.w &&
        y >= gemRect.y &&
        y < gemRect.y + gemRect.h;
      gems.push(inGem ? 1 : 0);
      lums.push(inGem ? luminance(data, i) : 0);
    }
  }

  if (xs.length === 0) return null;

  let maxX = 0;
  let maxY = 0;
  for (let i = 0; i < xs.length; i++) {
    maxX = Math.max(maxX, Math.abs(xs[i]));
    maxY = Math.max(maxY, Math.abs(ys[i]));
  }
  if (maxX < 1) return null;

  const pos = new Float32Array(count * 3);
  const art = new Float32Array(count * 4);
  for (let i = 0; i < count; i++) {
    const p = (Math.random() * xs.length) | 0;
    // A touch of jitter so the sampling grid never shows through. Half what it
    // was: every source pixel is sampled now, so there is no grid to hide, and
    // the jitter was softening the edges it was meant to protect.
    pos[i * 3] = xs[p] / maxX + (Math.random() - 0.5) * 0.0022;
    pos[i * 3 + 1] = ys[p] / maxX + (Math.random() - 0.5) * 0.0022;
    pos[i * 3 + 2] = Math.random() < 0.03 ? Math.random() * 0.35 : 0;

    facetTone(lums[p], art, i * 4);
    art[i * 4 + 3] = gems[p];
  }

  return { pos, ky: maxY / maxX, art };
}

/** Canvas 2D grew `letterSpacing` after the DOM lib types this project builds against. */
type SpacedCtx = CanvasRenderingContext2D & { letterSpacing?: string };

/**
 * The brand lockup on its own transparent canvas, at artwork resolution, plus
 * where the stone sits inside it. Narrow viewports get the gem stacked over the
 * wordmark — the wide lockup is 3.5:1 and would shrink to nothing in portrait.
 */
function composeLockup(
  art: HTMLCanvasElement,
  stacked: boolean,
): { canvas: HTMLCanvasElement; gem: { x: number; y: number; w: number; h: number } } | null {
  const iw = art.width;
  const ih = art.height;
  if (!iw || !ih) return null;

  if (!stacked) {
    return { canvas: art, gem: { x: 0, y: 0, w: iw * GEM_SPLIT, h: ih } };
  }

  // the gem occupies the left ~21.5% of the artwork; the wordmark starts ~26.5%
  const gemW = iw * 0.215;
  const txtX = iw * 0.265;
  const txtW = iw - txtX;

  // The stone leads the stack, so it is drawn up from its share of the artwork.
  const gs = 1.55;
  const gw = gemW * gs;
  const gh = ih * gs;
  const gap = ih * 0.3;
  const w = Math.round(Math.max(gw, txtW));
  const h = Math.round(gh + gap + ih);

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return null;

  const gx = (w - gw) / 2;
  ctx.drawImage(art, 0, 0, gemW, ih, gx, 0, gw, gh);
  ctx.drawImage(art, txtX, 0, txtW, ih, (w - txtW) / 2, gh + gap, txtW, ih);
  return { canvas, gem: { x: gx, y: 0, w: gw, h: gh } };
}

/**
 * The slide, as one cloud: the lockup above, WELCOME below, composed on a single
 * canvas so the particles form both at once.
 *
 * The canvas is rasterised well above the size the slide occupies on screen, and
 * sampled at step 1, so the wordmark's serifs survive into the point cloud — the
 * sharpness of the result is set here, not in the shader.
 */
function sampleMark(
  art: HTMLCanvasElement,
  count: number,
  stacked: boolean,
  font: string,
): (Cloud & { art: Float32Array }) | null {
  const lock = composeLockup(art, stacked);
  if (!lock) return null;
  const lw = lock.canvas.width;
  const lh = lock.canvas.height;
  if (!lw || !lh) return null;

  const w = stacked ? 1100 : 2000;

  // The lockup now reads as a mark ABOVE the word rather than the whole slide,
  // so it takes well under the full width — this is what "smaller" comes from.
  const logoW = Math.round(w * (stacked ? 0.62 : 0.64));
  const s = logoW / lw;
  const logoH = Math.round(lh * s);

  const fs = Math.round(w * (stacked ? 0.1 : 0.105));
  const spacing = "0.16em";
  const probe = document.createElement("canvas").getContext("2d") as SpacedCtx | null;
  if (!probe) return null;
  probe.font = `600 ${fs}px ${font}`;
  probe.letterSpacing = spacing;
  // Letter-spacing hangs off the last capital, so the drawn width is a shade
  // narrower than measured; only the overflow guard cares, so measured is safe.
  const textW = probe.measureText(WELCOME).width;
  const scale = textW > w * 0.9 ? (w * 0.9) / textW : 1;

  const gap = Math.round(fs * 0.9);
  const textH = Math.round(fs * 1.1);
  const pad = Math.round(fs * 0.2);
  const h = pad * 2 + logoH + gap + textH;

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d", { willReadFrequently: true }) as SpacedCtx | null;
  if (!ctx) return null;

  const lx = (w - logoW) / 2;
  ctx.drawImage(lock.canvas, lx, pad, logoW, logoH);

  ctx.fillStyle = "#000000";
  ctx.font = `600 ${Math.round(fs * scale)}px ${font}`;
  ctx.letterSpacing = spacing;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(WELCOME, w / 2, pad + logoH + gap + textH / 2);

  return sampleCanvas(ctx, w, h, count, 1, {
    x: lx + lock.gem.x * s,
    y: pad + lock.gem.y * s,
    w: lock.gem.w * s,
    h: lock.gem.h * s,
  });
}

function loadLogo(timeoutMs: number): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image();
    let settled = false;
    const done = (v: HTMLImageElement | null) => {
      if (settled) return;
      settled = true;
      resolve(v);
    };
    const timer = setTimeout(() => done(null), timeoutMs);
    img.onload = () => {
      clearTimeout(timer);
      done(img);
    };
    img.onerror = () => {
      clearTimeout(timer);
      done(null);
    };
    img.src = LOGO_SRC;
  });
}

// The cinematic veil belongs to the homepage's hero experience only. Content
// and SEO pages (guides, articles, collections…) must be served with nothing
// overlaying them — crawlers and users alike get the page immediately.
let playedThisSession = false;

export default function Preloader() {
  const pathname = usePathname();
  if (pathname !== "/" || playedThisSession) return null;
  return <PreloaderInner />;
}

function PreloaderInner() {
  const [done, setDone] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stillRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const overlay = overlayRef.current;
    const canvas = canvasRef.current;
    if (!overlay || !canvas) return;

    // Mark as played so client-side navigation back to "/" never replays it.
    playedThisSession = true;

    let disposed = false;
    let raf = 0;
    let gl: WebGLRenderingContext | null = null;
    let resizeHandler: (() => void) | null = null;

    // Freeze scroll while the veil is up.
    const html = document.documentElement;
    const prevOverflow = html.style.overflow;
    html.style.overflow = "hidden";
    const unlockScroll = () => {
      html.style.overflow = prevOverflow;
    };

    // Page readiness: real window load, raced against a safety timeout, and
    // held to a minimum screen time so the choreography always resolves.
    let onLoad: (() => void) | null = null;
    const whenLoaded = new Promise<void>((resolve) => {
      if (document.readyState === "complete") return resolve();
      onLoad = () => resolve();
      window.addEventListener("load", onLoad, { once: true });
    });
    const after = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

    // Hero-first-frame gate: on pages that carry the scroll-hero film, hold the
    // veil until that <video>'s first frame is decodable (readyState >= 2) so it
    // never lifts onto an unpainted hero. Pages with no hero video fall back to
    // the window `load` event. Callers always race this against a hard cap so a
    // slow or broken film can never keep the veil up indefinitely.
    let heroPoll = 0;
    const heroReady = new Promise<void>((resolve) => {
      const attach = (attempt: number) => {
        const v = document.querySelector("video");
        if (v) {
          if (v.readyState >= 2) return resolve();
          v.addEventListener("loadeddata", () => resolve(), { once: true });
          v.addEventListener("canplay", () => resolve(), { once: true });
          return;
        }
        // No hero <video> mounted yet — retry briefly, then fall back to load.
        if (attempt < 6) {
          heroPoll = window.setTimeout(() => attach(attempt + 1), 100);
        } else {
          whenLoaded.then(() => resolve());
        }
      };
      attach(0);
    });

    const state = { progress: 0, fade: 0, expand: 0, gemReveal: 0 };

    const cleanup = () => {
      cancelAnimationFrame(raf);
      clearTimeout(heroPoll);
      if (onLoad) window.removeEventListener("load", onLoad);
      gsap.killTweensOf([state, overlay, canvas, stillRef.current]);
      if (resizeHandler) window.removeEventListener("resize", resizeHandler);
      gl?.getExtension("WEBGL_lose_context")?.loseContext();
      gl = null;
    };

    const finish = () => {
      if (disposed) return;
      unlockScroll();
      cleanup();
      setDone(true);
    };

    /**
     * The still is held until the hero's first frame is decodable so the veil
     * never lifts onto an unpainted hero — raced against a cap, because a slow
     * or broken film must not be able to stretch the slide indefinitely. In the
     * ordinary case the film is ready well inside the still and the beats land
     * exactly as briefed.
     */
    const heldStill = () =>
      Promise.all([after((APPEAR + STILL) * 1000), Promise.race([heroReady, after(2600)])]);

    /** No WebGL, no artwork, or reduced motion: the same beats on a static logo. */
    const plainVeil = () => {
      const still = stillRef.current;
      if (still) gsap.to(still, { opacity: 1, duration: APPEAR, ease: "power2.out" });
      heldStill().then(() => {
        if (disposed) return;
        unlockScroll();
        gsap
          .timeline({ onComplete: finish })
          .to(still ?? {}, { opacity: 0, duration: DISAPPEAR * 0.8, ease: "power1.inOut" }, 0)
          .to(
            overlay,
            { backgroundColor: HERO_NAVY, duration: DISAPPEAR * 0.4, ease: "power2.inOut" },
            DISAPPEAR * 0.34,
          )
          .to(
            overlay,
            { autoAlpha: 0, duration: DISAPPEAR * 0.3, ease: "power1.out" },
            DISAPPEAR * 0.7,
          );
      });
    };

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const startWebGL = async () => {
      // The lockup is sampled from the real artwork, so it has to decode first;
      // the brand serif has to be ready before "WELCOME" is rasterised.
      const [logo] = await Promise.all([
        loadLogo(1600),
        Promise.race([
          document.fonts.load("600 200px Cinzel"),
          document.fonts.ready,
          after(600),
        ]).catch(() => undefined),
      ]);

      if (disposed) return;

      gl = canvas.getContext("webgl", {
        alpha: true,
        antialias: false,
        depth: false,
        stencil: false,
        powerPreference: "high-performance",
        preserveDrawingBuffer: false,
      });

      if (!gl) return plainVeil();

      // ---- Build the particle attributes (once) ----
      // Dense: the slide fills under half the viewport, so it needs the count to
      // read as solid ink rather than a scatter of dots. Dropping the second
      // cloud freed a whole attribute buffer, which pays for the higher count —
      // and it is still one gl.POINTS draw call.
      const count = window.innerWidth < 768 ? 22000 : 52000;
      const stacked = window.innerWidth < 700 || window.innerWidth < window.innerHeight;

      const artwork = logo ? cleanArtwork(logo) : null;
      const mark = artwork
        ? sampleMark(artwork, count, stacked, "'Trajan Pro', 'Cinzel', 'Times New Roman', serif")
        : null;
      if (!mark) return plainVeil();

      const start = new Float32Array(count * 3);
      const data = new Float32Array(count * 3);
      const rand = Math.random;

      for (let i = 0; i < count; i++) {
        const a = rand() * Math.PI * 2;
        const cr = 0.15 + Math.sqrt(rand()) * 1.45;
        start[i * 3] = Math.cos(a) * cr;
        start[i * 3 + 1] = Math.sin(a) * cr;
        start[i * 3 + 2] = 0;

        // Smaller points than before, and fewer oversize ones: at the old sizes
        // neighbouring dots overlapped into a blob, which is what softened the
        // wordmark. Density now comes from the count, not from fat points.
        data[i * 3] = rand() < 0.03 ? 1.9 + rand() * 0.9 : 1.05 + rand() * 0.7;
        data[i * 3 + 1] = rand();
        data[i * 3 + 2] = 2.0 + rand() * 6.0;
      }

      // ---- Compile program ----
      const compile = (type: number, src: string) => {
        const sh = gl!.createShader(type)!;
        gl!.shaderSource(sh, src);
        gl!.compileShader(sh);
        return sh;
      };
      const program = gl.createProgram()!;
      gl.attachShader(program, compile(gl.VERTEX_SHADER, VERT));
      gl.attachShader(program, compile(gl.FRAGMENT_SHADER, FRAG));
      gl.linkProgram(program);
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        // Shader failed somewhere exotic — degrade to the static logo.
        return plainVeil();
      }
      gl.useProgram(program);

      const attach = (name: string, arr: Float32Array, size = 3) => {
        const buf = gl!.createBuffer();
        gl!.bindBuffer(gl!.ARRAY_BUFFER, buf);
        gl!.bufferData(gl!.ARRAY_BUFFER, arr, gl!.STATIC_DRAW);
        const loc = gl!.getAttribLocation(program, name);
        gl!.enableVertexAttribArray(loc);
        gl!.vertexAttribPointer(loc, size, gl!.FLOAT, false, 0, 0);
      };
      attach("aStart", start);
      attach("aTarget", mark.pos);
      attach("aData", data);
      attach("aArt", mark.art, 4);

      const U = (name: string) => gl!.getUniformLocation(program, name);
      const uProgress = U("uProgress");
      const uTime = U("uTime");
      const uExpand = U("uExpand");
      const uFade = U("uFade");
      const uAspect = U("uAspect");
      const uFit = U("uFit");
      const uDpr = U("uDpr");
      const uMarkScale = U("uMarkScale");
      const uGemReveal = U("uGemReveal");

      gl.uniform3f(U("uInk"), THEME_BLUE[0], THEME_BLUE[1], THEME_BLUE[2]);

      // Straight alpha, not additive — the ground is white, and additive light
      // cannot darken it.
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
      gl.clearColor(0, 0, 0, 0);

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const resize = () => {
        if (!gl) return;
        const w = canvas.clientWidth;
        const h = canvas.clientHeight;
        canvas.width = Math.round(w * dpr);
        canvas.height = Math.round(h * dpr);
        gl.viewport(0, 0, canvas.width, canvas.height);
        const aspect = w / h;
        const fit = Math.min(aspect, 1) * 0.92;
        gl.uniform1f(uAspect, aspect);
        gl.uniform1f(uFit, fit);
        gl.uniform1f(uDpr, dpr);

        // Fit the cloud to the viewport on both axes: it is normalised to
        // max|x| = 1, so width is the direct constraint and ky covers height.
        const fitCloud = (ky: number, wFrac: number, hFrac: number) =>
          Math.min((wFrac * aspect) / fit, hFrac / Math.max(ky * fit, 0.0001));
        gl.uniform1f(uMarkScale, fitCloud(mark.ky, MARK_FILL.w, MARK_FILL.h));
      };
      resize();
      resizeHandler = resize;
      window.addEventListener("resize", resizeHandler);

      const t0 = performance.now();
      const tick = () => {
        if (!gl) return;
        gl.uniform1f(uTime, (performance.now() - t0) * 0.001);
        gl.uniform1f(uProgress, state.progress);
        gl.uniform1f(uExpand, state.expand);
        gl.uniform1f(uFade, state.fade);
        gl.uniform1f(uGemReveal, state.gemReveal);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.drawArrays(gl.POINTS, 0, count);
        raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);

      // ---- Choreography: one slide, APPEAR in / STILL held / DISAPPEAR out ----
      gsap.fromTo(canvas, { opacity: 0 }, { opacity: 1, duration: 0.25, ease: "power1.out" });

      // Appear: the swarm gathers and resolves into the slide. This drift-and-
      // settle IS the effect, so it gets the whole beat rather than a fraction.
      gsap.to(state, { progress: 1.0, duration: APPEAR, ease: "power2.out" });

      // As the stone lands its facets come up — the flat blue silhouette turns to
      // cut sapphire, finishing just as the still begins, and keeps it from there.
      gsap.to(state, {
        gemReveal: 1.0,
        duration: APPEAR * 0.45,
        ease: "power2.out",
        delay: APPEAR * 0.55,
      });

      // Still, then dissolve. Nothing moves far: the slide fades where it stands,
      // with only enough outward drift to read as dissipating ink, while the white
      // ground crosses to the hero navy so the handoff never flashes.
      heldStill().then(() => {
        if (disposed) return;
        unlockScroll();

        gsap
          .timeline({ onComplete: finish })
          .to(state, { fade: 1.0, duration: DISAPPEAR * 0.82, ease: "power1.inOut" }, 0)
          .to(state, { expand: 0.3, duration: DISAPPEAR, ease: "power1.in" }, 0)
          .to(
            overlay,
            { backgroundColor: HERO_NAVY, duration: DISAPPEAR * 0.4, ease: "power2.inOut" },
            DISAPPEAR * 0.34,
          )
          .to(
            overlay,
            { autoAlpha: 0, duration: DISAPPEAR * 0.3, ease: "power1.out" },
            DISAPPEAR * 0.7,
          );
      });
    };

    if (reduced) {
      plainVeil();
    } else {
      startWebGL();
    }

    return () => {
      disposed = true;
      unlockScroll();
      cleanup();
    };
  }, []);

  if (done) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[200] bg-white"
      role="status"
      aria-label="Loading Ceylon Gem Maison"
    >
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
      {/* Shown only on the reduced-motion / no-WebGL paths, laid out as the same
          single slide the particles form: the lockup above, WELCOME below. */}
      <div
        ref={stillRef}
        aria-hidden="true"
        className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-7 opacity-0"
      >
        {/* Deliberately a raw <img>: the WebGL path already fetches this exact
            URL to sample the lockup, so sharing the cache entry beats a second,
            optimised URL. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={LOGO_SRC} alt="" className="w-[min(58vw,390px)]" />
        <span className="font-serif text-xl uppercase tracking-[0.34em] text-gold-500 md:text-2xl">
          {WELCOME}
        </span>
      </div>
      <span className="sr-only">Loading</span>
    </div>
  );
}
