"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import gsap from "gsap";

/**
 * Preloader — "Particle Lockup".
 * Ink particles swirl out of chaos and settle into the Ceylon Gem Maison
 * lockup — the pear sapphire and the wordmark, sampled pixel-for-pixel from
 * the real artwork — hold, morph into "WELCOME", then scatter as the veil
 * dissolves into the hero.
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
attribute vec3 aTarget; // logo lockup, normalised so max|x| = 1
attribute vec3 aText;   // "WELCOME", normalised the same way
attribute vec3 aData;   // x: size(px)  y: phase  z: shimmer speed
attribute vec4 aArt;    // rgb: this facet's sapphire tone   a: 1 on the gem, 0 on the wordmark
uniform float uProgress;
uniform float uTextProgress;
uniform float uTime;
uniform float uExpand;
uniform float uFlare;
uniform float uAspect;
uniform float uFit;
uniform float uDpr;
uniform float uLogoScale;
uniform float uTextScale;
uniform float uGemReveal;
uniform vec3 uInk;
varying vec3 vColor;
varying float vAlpha;

void main() {
  float ph = aData.y;

  // Staggered convergence to the lockup: each particle locks in at its own moment.
  float t = clamp((uProgress - ph * 0.4) / 0.6, 0.0, 1.0);
  t = t * t * (3.0 - 2.0 * t);

  // Chaos cloud slowly swirls; its influence dies as the particle converges.
  float ang = uTime * (0.18 + 0.22 * fract(ph * 7.31));
  float c = cos(ang);
  float s = sin(ang);
  vec2 sp = mat2(c, -s, s, c) * aStart.xy;

  // The formed lockup breathes very slightly so it never looks frozen.
  vec2 tp = aTarget.xy * uLogoScale
          + 0.005 * vec2(sin(uTime * 1.7 + ph * 40.0), cos(uTime * 1.3 + ph * 36.0));

  vec2 posLogo = mix(sp, tp, t);

  vec2 textTarget = aText.xy * uTextScale
          + 0.004 * vec2(sin(uTime * 1.5 + ph * 30.0), cos(uTime * 1.2 + ph * 26.0));

  // Staggered convergence to the word, out of the lockup.
  float tText = clamp((uTextProgress - ph * 0.4) / 0.6, 0.0, 1.0);
  tText = tText * tText * (3.0 - 2.0 * tText);

  vec2 pos = mix(posLogo, textTarget, tText);

  // Exit: scatter radially outward past the viewport edges.
  vec2 dir = normalize(pos + vec2(0.0001));
  pos += dir * uExpand * (0.8 + fract(ph * 5.7) * 1.6);
  pos *= 1.0 + uExpand * 0.6;

  gl_Position = vec4(pos.x * uFit / uAspect, pos.y * uFit, 0.0, 1.0);

  // On a white ground shimmer has to live in opacity and size — a brightness
  // pulse would read as nothing at all. Kept shallow so the ink stays dense.
  float tw = 0.88 + 0.12 * sin(uTime * aData.z + ph * 50.0);
  // The floor is high on purpose: the incoming swarm has to be clearly visible
  // on white, otherwise the lockup simply appears instead of forming.
  float a = (0.42 + 0.58 * t) * tw;
  a *= smoothstep(0.0, 0.10, uProgress);           // gentle global fade-in
  a *= 1.0 - clamp(uExpand * 0.55 - 0.25, 0.0, 1.0); // dim through the scatter
  vAlpha = a;

  // The wordmark stays one flat brand blue. The gem, once it has landed, takes
  // on its own facet tones so the stone reads as cut glass rather than a blot —
  // and gives them back on the way into "WELCOME".
  float gem = aArt.a * uGemReveal * (1.0 - tText);

  // A highlight travels across the stone on a diagonal, the way a light source
  // crosses a real gem as it turns. The rate is set by the choreography, not by
  // taste: the stone is only cut glass for about 0.9s, so the sweep has to make
  // a full pass inside that window or the highlight never crosses at all.
  float sweep = sin((tp.x * 2.6 - tp.y * 1.7) / max(uLogoScale, 0.001) - uTime * 5.0);
  float glint = smoothstep(0.72, 1.0, sweep) * gem;
  // a handful of facets catch the light far harder than the rest
  float spark = step(0.972, fract(ph * 91.7 + uTime * 0.7)) * gem;

  vec3 facet = mix(aArt.rgb, vec3(0.83, 0.93, 1.0), glint * 0.55 + spark * 0.7);
  vColor = mix(uInk, facet, gem);

  gl_PointSize = aData.x * uDpr
    * (0.75 + 0.45 * t + uFlare * 0.8 + aTarget.z + spark * 0.9)
    * (0.92 + 0.08 * tw);
}
`;

const FRAG = `
precision mediump float;
varying vec3 vColor;
varying float vAlpha;

void main() {
  float d = length(gl_PointCoord - 0.5);
  // Solid core out to 0.36 with only a thin anti-aliased rim. A wider falloff
  // makes every dot a pale blob and the whole lockup reads washed out.
  float a = smoothstep(0.5, 0.36, d);
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

/** How much of the viewport each cloud is allowed to fill (fraction of w / h). */
const LOGO_FILL = { w: 0.42, h: 0.34 };
const TEXT_FILL = { w: 0.4, h: 0.22 };

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
    // a touch of jitter so the sampling grid never shows through
    pos[i * 3] = xs[p] / maxX + (Math.random() - 0.5) * 0.004;
    pos[i * 3 + 1] = ys[p] / maxX + (Math.random() - 0.5) * 0.004;
    pos[i * 3 + 2] = Math.random() < 0.03 ? Math.random() * 0.4 : 0;

    facetTone(lums[p], art, i * 4);
    art[i * 4 + 3] = gems[p];
  }

  return { pos, ky: maxY / maxX, art };
}

/**
 * The brand lockup, sampled pixel-for-pixel from the artwork. Narrow viewports
 * get the gem stacked over the wordmark — the wide lockup is 3.5:1 and would
 * shrink to nothing in portrait.
 */
function sampleLockup(
  art: HTMLCanvasElement,
  count: number,
  stacked: boolean,
): (Cloud & { art: Float32Array }) | null {
  const w = 1400;
  const h = stacked ? 1100 : 420;
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return null;

  const iw = art.width;
  const ih = art.height;
  if (!iw || !ih) return null;

  // where the stone lands on this canvas, so the sampler can flag its particles
  let gemRect: { x: number; y: number; w: number; h: number };

  if (stacked) {
    // the gem occupies the left ~21.5% of the artwork; the wordmark starts ~26.5%
    const gemW = iw * 0.215;
    const txtX = iw * 0.265;
    const txtW = iw - txtX;

    const gs = (h * 0.5) / ih;
    const gx = (w - gemW * gs) / 2;
    ctx.drawImage(art, 0, 0, gemW, ih, gx, h * 0.02, gemW * gs, ih * gs);
    gemRect = { x: gx, y: h * 0.02, w: gemW * gs, h: ih * gs };

    const ws = Math.min((w * 0.94) / txtW, (h * 0.34) / ih);
    ctx.drawImage(art, txtX, 0, txtW, ih, (w - txtW * ws) / 2, h * 0.6, txtW * ws, ih * ws);
  } else {
    const s = Math.min((w * 0.96) / iw, (h * 0.9) / ih);
    const dx = (w - iw * s) / 2;
    const dy = (h - ih * s) / 2;
    ctx.drawImage(art, dx, dy, iw * s, ih * s);
    gemRect = { x: dx, y: dy, w: iw * GEM_SPLIT * s, h: ih * s };
  }

  // Every source pixel counts on the wide layout; the taller stacked canvas
  // halves the step so phones aren't scanning 1.5M pixels.
  return sampleCanvas(ctx, w, h, count, stacked ? 2 : 1, gemRect);
}

/** "WELCOME", set in the brand serif. */
function sampleText(text: string, count: number, font: string): Cloud | null {
  const w = 1200;
  const h = 300;
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return null;

  ctx.fillStyle = "#000000";
  ctx.font = `bold 140px ${font}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, w / 2, h / 2);

  // Step 1: the glyph strokes are thin, and at the current count a coarser step
  // would have every source point duplicated many times over.
  return sampleCanvas(ctx, w, h, count, 1);
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
  const stillRef = useRef<HTMLImageElement>(null);

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

    const state = { progress: 0, textProgress: 0, flare: 0, expand: 0, gemReveal: 0 };

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

    /** No WebGL, no artwork, or reduced motion: hold the static logo, then lift. */
    const plainVeil = (hold: number) => {
      const still = stillRef.current;
      if (still) gsap.to(still, { opacity: 1, duration: 0.5, ease: "power1.out" });
      Promise.all([Promise.race([heroReady, after(4000)]), after(hold)]).then(() => {
        if (disposed) return;
        unlockScroll();
        gsap
          .timeline({ onComplete: finish })
          .to(still ?? {}, { opacity: 0, duration: 0.3, ease: "power1.in" }, 0)
          .to(overlay, { backgroundColor: HERO_NAVY, duration: 0.35, ease: "power2.in" }, 0.1)
          .to(overlay, { autoAlpha: 0, duration: 0.35, ease: "power1.out" }, 0.3);
      });
    };

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const startWebGL = async () => {
      // The lockup is sampled from the real artwork, so it has to decode first;
      // the brand serif has to be ready before "WELCOME" is rasterised.
      const [logo] = await Promise.all([
        loadLogo(1600),
        Promise.race([
          document.fonts.load("bold 140px Cinzel"),
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

      if (!gl) return plainVeil(2100);

      // ---- Build the particle attributes (once) ----
      // Dense: the lockup only fills ~42% of the viewport, so it needs the
      // count to read as solid ink rather than a scatter of dots. Still a
      // single gl.POINTS draw call, so the count is close to free.
      const count = window.innerWidth < 768 ? 20000 : 42000;
      const stacked = window.innerWidth < 700 || window.innerWidth < window.innerHeight;

      const artwork = logo ? cleanArtwork(logo) : null;
      const lockup = artwork ? sampleLockup(artwork, count, stacked) : null;
      const word = sampleText("WELCOME", count, "'Cinzel', 'Times New Roman', serif");
      if (!lockup || !word) return plainVeil(2100);

      const start = new Float32Array(count * 3);
      const data = new Float32Array(count * 3);
      const rand = Math.random;

      for (let i = 0; i < count; i++) {
        const a = rand() * Math.PI * 2;
        const cr = 0.15 + Math.sqrt(rand()) * 1.45;
        start[i * 3] = Math.cos(a) * cr;
        start[i * 3 + 1] = Math.sin(a) * cr;
        start[i * 3 + 2] = 0;

        data[i * 3] = rand() < 0.04 ? 2.5 + rand() * 1.3 : 1.5 + rand() * 1.1;
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
        return plainVeil(2100);
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
      attach("aTarget", lockup.pos);
      attach("aText", word.pos);
      attach("aData", data);
      attach("aArt", lockup.art, 4);

      const U = (name: string) => gl!.getUniformLocation(program, name);
      const uProgress = U("uProgress");
      const uTextProgress = U("uTextProgress");
      const uTime = U("uTime");
      const uExpand = U("uExpand");
      const uFlare = U("uFlare");
      const uAspect = U("uAspect");
      const uFit = U("uFit");
      const uDpr = U("uDpr");
      const uLogoScale = U("uLogoScale");
      const uTextScale = U("uTextScale");
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

        // Fit each cloud to the viewport on both axes: clouds are normalised to
        // max|x| = 1, so width is the direct constraint and ky covers height.
        const fitCloud = (ky: number, wFrac: number, hFrac: number) =>
          Math.min((wFrac * aspect) / fit, hFrac / Math.max(ky * fit, 0.0001));
        gl.uniform1f(uLogoScale, fitCloud(lockup.ky, LOGO_FILL.w, LOGO_FILL.h));
        gl.uniform1f(uTextScale, fitCloud(word.ky, TEXT_FILL.w, TEXT_FILL.h));
      };
      resize();
      resizeHandler = resize;
      window.addEventListener("resize", resizeHandler);

      const t0 = performance.now();
      const tick = () => {
        if (!gl) return;
        gl.uniform1f(uTime, (performance.now() - t0) * 0.001);
        gl.uniform1f(uProgress, state.progress);
        gl.uniform1f(uTextProgress, state.textProgress);
        gl.uniform1f(uExpand, state.expand);
        gl.uniform1f(uFlare, state.flare);
        gl.uniform1f(uGemReveal, state.gemReveal);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.drawArrays(gl.POINTS, 0, count);
        raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);

      // ---- Choreography (tuned so the veil lives ~3.5s on screen) ----
      gsap.fromTo(canvas, { opacity: 0 }, { opacity: 1, duration: 0.3, ease: "power1.out" });

      // Step 1: the swarm gathers and resolves into the lockup — formed by
      // ~1.4s. Slow on purpose: this drift-and-settle IS the effect.
      gsap.to(state, { progress: 1.0, duration: 1.25, ease: "power2.out", delay: 0.12 });

      // Step 1b: with the stone settled, let its facets come up — the flat blue
      // silhouette turns to cut sapphire and starts catching the light.
      gsap.to(state, { gemReveal: 1.0, duration: 0.55, ease: "power2.out", delay: 1.3 });

      // Step 2: let the stone sit as cut glass — its facets finish arriving at
      // ~1.85s and the sheen sweep needs room to cross it — then morph to
      // "WELCOME" by ~2.85s.
      gsap.to(state, { textProgress: 1.0, duration: 0.6, ease: "power3.inOut", delay: 2.25 });

      // Step 3: hold for a ~3.1s minimum AND until the hero's first frame is
      // ready (capped at 4s so a slow film can't stall the reveal), then scatter.
      Promise.all([Promise.race([heroReady, after(4000)]), after(3100)]).then(() => {
        if (disposed) return;
        unlockScroll();

        // Step 4: scatter the word, and dissolve the white ground into the hero
        // navy underneath so the handoff never flashes.
        gsap
          .timeline({ onComplete: finish })
          .to(state, { flare: 1.0, duration: 0.18, ease: "power2.in" }, 0)
          .to(state, { expand: 3.4, duration: 0.55, ease: "power3.in" }, 0.1)
          .to(overlay, { backgroundColor: HERO_NAVY, duration: 0.38, ease: "power2.in" }, 0.28)
          .to(overlay, { autoAlpha: 0, duration: 0.3, ease: "power1.out" }, 0.5);
      });
    };

    if (reduced) {
      plainVeil(1400);
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
      {/* Shown only on the reduced-motion / no-WebGL paths. Deliberately a raw
          <img>: the WebGL path already fetches this exact URL to sample the
          lockup, so sharing the cache entry beats a second, optimised URL. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        ref={stillRef}
        src={LOGO_SRC}
        alt=""
        aria-hidden="true"
        className="absolute left-1/2 top-1/2 w-[min(78vw,560px)] -translate-x-1/2 -translate-y-1/2 opacity-0"
      />
      <span className="sr-only">Loading</span>
    </div>
  );
}
