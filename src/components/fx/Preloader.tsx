"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";

/**
 * Preloader — "Particle Ring".
 * Thousands of champagne-and-sapphire light particles swirl out of chaos and
 * converge into a solitaire silhouette (ring band + diamond crest) while the
 * page loads, then flare and blast past the viewport as a light-ring wipe.
 *
 * Performance notes:
 *  - Raw WebGL, one gl.POINTS draw call; every particle's motion (swirl,
 *    convergence, twinkle, exit blast) is computed in the vertex shader from
 *    static attributes — zero per-frame CPU work besides four uniforms.
 *  - Adaptive particle count, device-pixel-ratio capped at 2.
 *  - Additive blending, no depth buffer, no textures, no extra dependencies.
 *  - The GL context is explicitly released and the overlay unmounted on exit.
 *  - prefers-reduced-motion (or a missing WebGL context) falls back to a
 *    plain silk veil that simply fades out once the page is ready.
 */

const VERT = `
attribute vec3 aStart;
attribute vec3 aTarget;
attribute vec3 aText;
attribute vec3 aColor;
attribute vec3 aData; // x: size(px)  y: phase  z: twinkle speed
uniform float uProgress;
uniform float uTextProgress;
uniform float uTime;
uniform float uExpand;
uniform float uFlare;
uniform float uAspect;
uniform float uFit;
uniform float uDpr;
varying vec3 vColor;
varying float vAlpha;

void main() {
  float ph = aData.y;

  // Staggered convergence to ring: each particle locks in at its own moment.
  float t = clamp((uProgress - ph * 0.4) / 0.6, 0.0, 1.0);
  t = t * t * (3.0 - 2.0 * t);

  // Chaos cloud slowly swirls; its influence dies as the particle converges.
  float ang = uTime * (0.18 + 0.22 * fract(ph * 7.31));
  float c = cos(ang);
  float s = sin(ang);
  vec2 sp = mat2(c, -s, s, c) * aStart.xy;

  // The formed silhouette breathes very slightly so it never looks frozen.
  vec2 tp = aTarget.xy + 0.008 * vec2(sin(uTime * 1.7 + ph * 40.0), cos(uTime * 1.3 + ph * 36.0));

  vec2 posRing = mix(sp, tp, t);

  // The formed text breathes very slightly as well.
  vec2 textTarget = aText.xy + 0.006 * vec2(sin(uTime * 1.5 + ph * 30.0), cos(uTime * 1.2 + ph * 26.0));

  // Staggered convergence to text from ring.
  float tText = clamp((uTextProgress - ph * 0.4) / 0.6, 0.0, 1.0);
  tText = tText * tText * (3.0 - 2.0 * tText);

  vec2 pos = mix(posRing, textTarget, tText);

  // Exit: blast radially outward past the viewport edges.
  vec2 dir = normalize(pos + vec2(0.0001));
  pos += dir * uExpand * (0.8 + fract(ph * 5.7) * 1.6);
  pos *= 1.0 + uExpand * 0.6;

  gl_Position = vec4(pos.x * uFit / uAspect, pos.y * uFit, 0.0, 1.0);

  float tw = 0.65 + 0.35 * sin(uTime * aData.z + ph * 50.0);
  float a = (0.30 + 0.70 * t) * tw;
  a *= smoothstep(0.0, 0.12, uProgress);            // gentle global fade-in
  a *= 1.0 - clamp(uExpand * 0.55 - 0.4, 0.0, 1.0); // dim late in the blast
  vAlpha = a;

  vColor = aColor * (1.0 + uFlare * (1.6 + 1.4 * tw));
  gl_PointSize = aData.x * uDpr * (0.8 + 0.4 * t + uFlare * 1.5 + aTarget.z);
}
`;

const FRAG = `
precision mediump float;
varying vec3 vColor;
varying float vAlpha;

void main() {
  vec2 uv = gl_PointCoord - 0.5;
  float d = length(uv);
  float glow = smoothstep(0.5, 0.05, d);
  float core = smoothstep(0.16, 0.0, d) * 0.7;
  gl_FragColor = vec4(vColor * (glow + core), glow * vAlpha);
}
`;

// Champagne golds + Ceylon sapphires for the band; icy fire for the stone.
const BAND_PALETTE = [
  [0.97, 0.93, 0.85],
  [0.91, 0.83, 0.66],
  [0.99, 0.97, 0.92],
  [0.56, 0.69, 0.97],
  [0.3, 0.47, 0.92],
];
const STONE_PALETTE = [
  [0.86, 0.91, 1.0],
  [0.98, 0.99, 1.0],
  [0.62, 0.74, 0.98],
];

// Helper to sample coordinates forming the text on an offscreen canvas
function sampleTextPoints(text: string, count: number, fontName: string = "Cinzel, serif"): Float32Array {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) return new Float32Array(count * 3);

  const w = 1200;
  const h = 300;
  canvas.width = w;
  canvas.height = h;

  ctx.fillStyle = "#000000";
  ctx.fillRect(0, 0, w, h);

  ctx.fillStyle = "#ffffff";
  ctx.font = `bold 140px ${fontName}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, w / 2, h / 2);

  const imgData = ctx.getImageData(0, 0, w, h);
  const data = imgData.data;

  const points: { x: number; y: number }[] = [];
  for (let y = 0; y < h; y += 2) {
    for (let x = 0; x < w; x += 2) {
      const idx = (y * w + x) * 4;
      if (data[idx] > 128) {
        // Isotropically normalize to fit the scale of the solitaire ring
        const px = ((x - w / 2) / h) * 0.45;
        const py = -((y - h / 2) / h) * 0.45;
        points.push({ x: px, y: py });
      }
    }
  }

  // Fallback if canvas yields no points
  if (points.length === 0) {
    const fallback = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      fallback[i * 3] = (Math.random() - 0.5) * 1.5;
      fallback[i * 3 + 1] = (Math.random() - 0.5) * 0.4;
      fallback[i * 3 + 2] = 0;
    }
    return fallback;
  }

  const arr = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const pIdx = Math.floor(Math.random() * points.length);
    const p = points[pIdx];
    const noiseX = (Math.random() - 0.5) * 0.008;
    const noiseY = (Math.random() - 0.5) * 0.008;
    arr[i * 3] = p.x + noiseX;
    arr[i * 3 + 1] = p.y + noiseY;
    arr[i * 3 + 2] = 0;
  }

  return arr;
}

export default function Preloader() {
  const [done, setDone] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const overlay = overlayRef.current;
    const canvas = canvasRef.current;
    if (!overlay || !canvas) return;

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

    const state = { progress: 0, textProgress: 0, flare: 0, expand: 0 };

    const cleanup = () => {
      cancelAnimationFrame(raf);
      if (onLoad) window.removeEventListener("load", onLoad);
      gsap.killTweensOf([state, overlay, canvas]);
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

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const startWebGL = async () => {
      try {
        // Wait up to 600ms for Cinzel font to load to render clean welcome text
        await Promise.race([
          document.fonts.load("bold 140px Cinzel"),
          document.fonts.ready,
          after(600),
        ]);
      } catch (e) {
        // ignore
      }

      if (disposed) return;

      gl = canvas.getContext("webgl", {
        alpha: true,
        antialias: false,
        depth: false,
        stencil: false,
        powerPreference: "high-performance",
        preserveDrawingBuffer: false,
      });

      // ---- Fallback: plain silk veil, fades once the page is ready ----
      if (!gl) {
        Promise.all([Promise.race([whenLoaded, after(6000)]), after(3400)]).then(() => {
          if (disposed) return;
          unlockScroll();
          gsap.to(overlay, { autoAlpha: 0, duration: 0.5, ease: "power1.out", onComplete: finish });
        });
        return;
      }

      // ---- Build the particle attributes (once) ----
      const count = window.innerWidth < 768 ? 4500 : 9000;
      const start = new Float32Array(count * 3);
      const target = new Float32Array(count * 3);
      const color = new Float32Array(count * 3);
      const data = new Float32Array(count * 3);

      const rand = Math.random;
      const gauss = () => (rand() + rand() + rand() - 1.5) * 0.816;
      const R = 0.6;
      const Y_SHIFT = -0.08; // optically center ring + crest

      for (let i = 0; i < count; i++) {
        const stone = rand() < 0.14;
        let tx: number, ty: number;
        if (stone) {
          // Diamond crest: rejection-sample a rhombus above the band.
          let u = 0, v = 0;
          do {
            u = rand() * 2 - 1;
            v = rand() * 2 - 1;
          } while (Math.abs(u) + Math.abs(v) > 1);
          tx = u * 0.11;
          ty = R + 0.16 + v * 0.145;
        } else {
          const th = rand() * Math.PI * 2;
          const rr = R + gauss() * 0.028;
          tx = Math.cos(th) * rr;
          ty = Math.sin(th) * rr;
        }

        const a = rand() * Math.PI * 2;
        const cr = 0.15 + Math.sqrt(rand()) * 1.45;
        start[i * 3] = Math.cos(a) * cr;
        start[i * 3 + 1] = Math.sin(a) * cr;
        start[i * 3 + 2] = 0;

        target[i * 3] = tx;
        target[i * 3 + 1] = ty + Y_SHIFT;
        target[i * 3 + 2] = Math.max(0, gauss() * 0.12); // rare oversize sparkles

        const pal = stone ? STONE_PALETTE : BAND_PALETTE;
        const c = pal[(rand() * pal.length) | 0];
        color[i * 3] = c[0];
        color[i * 3 + 1] = c[1];
        color[i * 3 + 2] = c[2];

        data[i * 3] = rand() < 0.04 ? 3.5 + rand() * 2.5 : 1.1 + rand() * 1.8;
        data[i * 3 + 1] = rand();
        data[i * 3 + 2] = 2.0 + rand() * 6.0;
      }

      // Generate welcome text coordinates
      const textPoints = sampleTextPoints("WELCOME", count, "'Cinzel', 'Times New Roman', serif");

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
        // Shader failed somewhere exotic — degrade to the plain veil path.
        Promise.all([Promise.race([whenLoaded, after(6000)]), after(3400)]).then(() => {
          if (disposed) return;
          unlockScroll();
          gsap.to(overlay, { autoAlpha: 0, duration: 0.5, ease: "power1.out", onComplete: finish });
        });
        return;
      }
      gl.useProgram(program);

      const attach = (name: string, arr: Float32Array) => {
        const buf = gl!.createBuffer();
        gl!.bindBuffer(gl!.ARRAY_BUFFER, buf);
        gl!.bufferData(gl!.ARRAY_BUFFER, arr, gl!.STATIC_DRAW);
        const loc = gl!.getAttribLocation(program, name);
        gl!.enableVertexAttribArray(loc);
        gl!.vertexAttribPointer(loc, 3, gl!.FLOAT, false, 0, 0);
      };
      attach("aStart", start);
      attach("aTarget", target);
      attach("aText", textPoints);
      attach("aColor", color);
      attach("aData", data);

      const U = (name: string) => gl!.getUniformLocation(program, name);
      const uProgress = U("uProgress");
      const uTextProgress = U("uTextProgress");
      const uTime = U("uTime");
      const uExpand = U("uExpand");
      const uFlare = U("uFlare");
      const uAspect = U("uAspect");
      const uFit = U("uFit");
      const uDpr = U("uDpr");

      gl.enable(gl.BLEND);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
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
        gl.uniform1f(uAspect, aspect);
        gl.uniform1f(uFit, Math.min(aspect, 1) * 0.92);
        gl.uniform1f(uDpr, dpr);
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
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.drawArrays(gl.POINTS, 0, count);
        raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);

      // ---- Choreography ----
      gsap.fromTo(canvas, { opacity: 0 }, { opacity: 1, duration: 0.6, ease: "power1.out" });
      
      // Step 1: Converge from chaos to solitaire ring (1.2s)
      gsap.to(state, { progress: 1.0, duration: 1.2, ease: "power2.out" });
      
      // Step 2: Hold ring for 0.4s (total 1.6s), then morph to "WELCOME" text (1.2s)
      gsap.to(state, { textProgress: 1.0, duration: 1.2, ease: "power3.inOut", delay: 1.6 });

      // Step 3: Wait for page load and minimum duration (2.8s) before starting exit
      Promise.all([Promise.race([whenLoaded, after(6000)]), after(2800)]).then(() => {
        if (disposed) return;
        unlockScroll();
        
        // Step 4: Hold "WELCOME" for 0.6s, then flare and expand blast
        gsap
          .timeline({ onComplete: finish })
          .to(state, { flare: 1.0, duration: 0.35, ease: "power2.in", delay: 0.6 })
          .to(state, { expand: 3.4, duration: 0.8, ease: "power3.in" }, "-=0.15")
          .to(overlay, { autoAlpha: 0, duration: 0.5, ease: "power1.out" }, "-=0.4");
      });
    };

    if (reduced) {
      Promise.all([Promise.race([whenLoaded, after(5000)]), after(600)]).then(() => {
        if (disposed) return;
        unlockScroll();
        gsap.to(overlay, { autoAlpha: 0, duration: 0.5, ease: "power1.out", onComplete: finish });
      });
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
      className="silk-navy fixed inset-0 z-[200]"
      role="status"
      aria-label="Loading Ceylon Gem Maison"
    >
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
      <span className="sr-only">Loading</span>
    </div>
  );
}
