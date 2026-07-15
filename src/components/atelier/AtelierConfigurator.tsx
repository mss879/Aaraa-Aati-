"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import gsap from "gsap";
import BespokeRing3D from "@/components/atelier/BespokeRing3D";
import {
  CARAT_MAX,
  CARAT_MIN,
  CARAT_STEP,
  CUTS,
  DEFAULT_CONFIG,
  GEMS,
  METALS,
  SETTINGS,
  type RingConfig,
  buildWhatsAppMessage,
  cutById,
  estimatePrice,
  gemById,
  metalById,
  settingById,
} from "@/lib/ring-options";

/* Atelier WhatsApp line — set NEXT_PUBLIC_WHATSAPP_NUMBER in .env.local
   (country code + number, digits only, e.g. 94771234567). */
const WHATSAPP_NUMBER = (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "").replace(/\D/g, "");

function WhatsAppIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.52.149-.174.198-.298.297-.497.1-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
    </svg>
  );
}

/* ---------------------------------------------------------------- helpers */

const fmtPrice = (n: number) => "$" + Math.round(n).toLocaleString("en-US");
const fmtCarat = (n: number) => n.toFixed(1);

/** Number that GSAP-tweens between values (price ticker, carat readout). */
function AnimatedNumber({ value, format }: { value: number; format: (n: number) => string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const prevRef = useRef(value);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obj = { v: prevRef.current };
    prevRef.current = value;
    const tween = gsap.to(obj, {
      v: value,
      duration: 0.6,
      ease: "power2.out",
      onUpdate: () => {
        el.textContent = format(obj.v);
      },
    });
    return () => {
      tween.kill();
    };
  }, [value, format]);
  return <span ref={ref}>{format(value)}</span>;
}

/* --------------------------------------------------------- step meta data */

const STEPS = [
  { key: "setting", short: "Setting", eyebrow: "I · The Setting", title: "Choose the architecture", body: "The setting is the soul of the ring — how the stone is held, presented, and lived with." },
  { key: "metal", short: "Metal", eyebrow: "II · The Metal", title: "Select your precious metal", body: "Each alloy carries its own temperature of light. Watch the band transform as you choose." },
  { key: "gem", short: "Stone", eyebrow: "III · The Gemstone", title: "Set the heart of the piece", body: "From glacial diamonds to pigeon-blood rubies — every stone is hand-selected and certified." },
  { key: "cut", short: "Cut", eyebrow: "IV · The Cut", title: "Shape the light", body: "The cut decides how your stone breathes light. Four signatures, four temperaments." },
  { key: "size", short: "Size", eyebrow: "V · The Presence", title: "Carat & inscription", body: "Scale the stone to the hand that will wear it, and hide a few words inside the band." },
  { key: "review", short: "Reveal", eyebrow: "VI · The Reveal", title: "Your commission", body: "Review every choice — then let our AI atelier render your finished ring." },
] as const;

/* ------------------------------------------------- inline SVG option icons */

function SettingIcon({ id }: { id: RingConfig["setting"] }) {
  const stroke = "currentColor";
  const common = { fill: "none", stroke, strokeWidth: 1.4, strokeLinecap: "round" as const };
  return (
    <svg viewBox="0 0 48 48" className="h-10 w-10">
      {/* band */}
      <circle cx="24" cy="30" r="12" {...common} />
      {id === "solitaire" && (
        <path d="M24 8l6 6-6 8-6-8z M18 14h12" {...common} strokeLinejoin="round" />
      )}
      {id === "halo" && (
        <>
          <path d="M24 10l4.5 4.5L24 20.5l-4.5-6z" {...common} strokeLinejoin="round" />
          {Array.from({ length: 8 }).map((_, i) => {
            const a = (i / 8) * Math.PI * 2;
            return <circle key={i} cx={24 + Math.cos(a) * 9.5} cy={15 + Math.sin(a) * 9.5} r="1.1" fill={stroke} stroke="none" />;
          })}
        </>
      )}
      {id === "trinity" && (
        <>
          <path d="M24 7l5 5-5 7-5-7z" {...common} strokeLinejoin="round" />
          <path d="M12.5 13l3.2 3.2-3.2 4.5-3.2-4.5z" {...common} strokeLinejoin="round" />
          <path d="M35.5 13l3.2 3.2-3.2 4.5-3.2-4.5z" {...common} strokeLinejoin="round" />
        </>
      )}
      {id === "pave" && (
        <>
          <path d="M24 8l5.5 5.5L24 21l-5.5-7.5z" {...common} strokeLinejoin="round" />
          {[-3, -2, -1, 1, 2, 3].map((i) => {
            const a = Math.PI / 2 + i * 0.32;
            return <circle key={i} cx={24 + Math.cos(a) * 12} cy={30 - Math.sin(a) * 12} r="1.2" fill={stroke} stroke="none" />;
          })}
        </>
      )}
    </svg>
  );
}

function CutIcon({ id }: { id: RingConfig["cut"] }) {
  const common = { fill: "none", stroke: "currentColor", strokeWidth: 1.4 };
  return (
    <svg viewBox="0 0 48 48" className="h-10 w-10">
      {id === "round" && (
        <>
          <circle cx="24" cy="24" r="13" {...common} />
          <path d="M24 11v26M11 24h26M15 15l18 18M33 15L15 33" {...common} strokeWidth={0.7} opacity={0.7} />
        </>
      )}
      {id === "princess" && (
        <>
          <rect x="12" y="12" width="24" height="24" {...common} />
          <path d="M12 12l24 24M36 12L12 36M24 12v24M12 24h24" {...common} strokeWidth={0.7} opacity={0.7} />
        </>
      )}
      {id === "oval" && (
        <>
          <ellipse cx="24" cy="24" rx="10" ry="14" {...common} />
          <path d="M24 10v28M14 24h20M17 14l14 20M31 14L17 34" {...common} strokeWidth={0.7} opacity={0.7} />
        </>
      )}
      {id === "emerald" && (
        <>
          <path d="M17 11h14l6 6v14l-6 6H17l-6-6V17z" {...common} strokeLinejoin="round" />
          <path d="M20 15h8l4 4v10l-4 4h-8l-4-4V19z" {...common} strokeWidth={0.8} opacity={0.75} />
          <path d="M22 19h4l2.5 2.5v5L26 29h-4l-2.5-2.5v-5z" {...common} strokeWidth={0.6} opacity={0.55} />
        </>
      )}
    </svg>
  );
}

/* ------------------------------------------------------------- option card */

function OptionCard({
  selected,
  onSelect,
  children,
  className = "",
}: {
  selected: boolean;
  onSelect: () => void;
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLButtonElement>(null);
  const handleClick = () => {
    onSelect();
    if (ref.current && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      gsap.fromTo(ref.current, { scale: 0.96 }, { scale: 1, duration: 0.45, ease: "back.out(3)" });
    }
  };
  return (
    <button
      ref={ref}
      type="button"
      onClick={handleClick}
      aria-pressed={selected}
      data-step-item
      className={`group relative rounded-2xl border p-5 text-left transition-colors duration-300 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-gold-300/60 ${
        selected
          ? "border-gold-400/70 bg-gold-500/[0.07] shadow-[0_0_30px_rgba(212,175,55,0.12)]"
          : "border-zinc-800/80 bg-white/[0.015] hover:border-gold-500/30 hover:bg-white/[0.03]"
      } ${className}`}
    >
      {/* selected check */}
      <span
        className={`absolute right-4 top-4 flex h-5 w-5 items-center justify-center rounded-full border transition-all duration-300 ${
          selected ? "border-gold-300 bg-gold-400 text-obsidian-950" : "border-zinc-700 text-transparent"
        }`}
      >
        <svg viewBox="0 0 12 12" className="h-2.5 w-2.5" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M2 6l3 3 5-6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
      {children}
    </button>
  );
}

/* ============================================================ main widget */

type GenState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "done"; image: string }
  | { status: "error"; message: string };

const LOADING_LINES = [
  "Consulting the master lapidary…",
  "Cutting your stone to proportion…",
  "Casting the precious metal…",
  "Setting every accent by hand…",
  "Polishing under the atelier lamp…",
];

export default function AtelierConfigurator() {
  const [step, setStep] = useState(0);
  const [config, setConfig] = useState<RingConfig>(DEFAULT_CONFIG);
  const [gen, setGen] = useState<GenState>({ status: "idle" });
  const [loadingLine, setLoadingLine] = useState(0);
  const panelRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  const price = estimatePrice(config);
  const set = useCallback(<K extends keyof RingConfig>(key: K, value: RingConfig[K]) => {
    setConfig((c) => ({ ...c, [key]: value }));
  }, []);

  /* step-change entrance animation */
  useLayoutEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        "[data-step-item]",
        { opacity: 0, y: 26, filter: "blur(5px)" },
        { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.55, ease: "power3.out", stagger: 0.06, clearProps: "filter" },
      );
    }, panelRef);
    return () => ctx.revert();
  }, [step]);

  /* overlay fade-in + rotating loading copy */
  useEffect(() => {
    if (gen.status === "idle") return;
    if (overlayRef.current && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      gsap.fromTo(overlayRef.current, { opacity: 0 }, { opacity: 1, duration: 0.4, ease: "power2.out" });
    }
    if (gen.status !== "loading") return;
    const id = setInterval(() => setLoadingLine((l) => (l + 1) % LOADING_LINES.length), 2600);
    return () => clearInterval(id);
  }, [gen.status]);

  useEffect(() => () => abortRef.current?.abort(), []);

  const generate = async () => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setLoadingLine(0);
    setGen({ status: "loading" });
    try {
      const res = await fetch("/api/generate-ring", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
        signal: controller.signal,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.image) {
        throw new Error(data.error || "The atelier could not complete the render. Please try again.");
      }
      setGen({ status: "done", image: data.image });
    } catch (err) {
      if (controller.signal.aborted) return;
      setGen({
        status: "error",
        message: err instanceof Error ? err.message : "Something went wrong. Please try again.",
      });
    }
  };

  const closeOverlay = () => {
    abortRef.current?.abort();
    setGen({ status: "idle" });
  };

  const summary = [
    { label: "Setting", value: settingById(config.setting).label, step: 0 },
    { label: "Metal", value: `${metalById(config.metal).karat} ${metalById(config.metal).label}`, step: 1 },
    { label: "Gemstone", value: gemById(config.gem).label, step: 2 },
    { label: "Cut", value: cutById(config.cut).label, step: 3 },
    { label: "Carat", value: `${config.carat.toFixed(1)} ct`, step: 4 },
    { label: "Engraving", value: config.engraving || "—", step: 4 },
  ];

  /* ------------------------------------------------------------ rendering */

  return (
    <div className="relative flex min-h-svh w-full flex-col bg-[#070708] text-gold-50 lg:flex-row">
      {/* ======================= LEFT · LIVE 3D STAGE ======================= */}
      <div className="sticky top-0 z-10 h-[44svh] w-full shrink-0 lg:h-svh lg:w-[52%] xl:w-[55%]">
        {/* ambient stage dressing */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_42%,rgba(218,174,102,0.10)_0%,transparent_55%)]" />
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(212,175,55,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(212,175,55,0.025)_1px,transparent_1px)] bg-[size:44px_44px] [mask-image:radial-gradient(circle_at_center,black_30%,transparent_75%)]" />

        <BespokeRing3D config={config} />

        {/* top bar */}
        <div className="absolute inset-x-0 top-0 flex items-center justify-between p-5 md:p-7">
          <Link
            href="/"
            className="group flex items-center gap-2 rounded-full border border-white/10 bg-black/40 px-4 py-2 font-sans text-[0.62rem] uppercase tracking-[0.25em] text-gold-100/80 backdrop-blur-md transition-colors hover:border-gold-400/40 hover:text-gold-200"
          >
            <svg viewBox="0 0 24 24" className="h-3 w-3 transition-transform group-hover:-translate-x-0.5" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M15 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Maison Home
          </Link>
          <span className="hidden rounded-full border border-gold-400/20 bg-black/40 px-4 py-2 font-sans text-[0.62rem] uppercase tracking-[0.3em] text-gold-300 backdrop-blur-md sm:block">
            Bespoke Atelier
          </span>
        </div>

        {/* live spec readout */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-5 md:p-7">
          <div>
            <p className="font-sans text-[0.6rem] uppercase tracking-[0.3em] text-gold-100/50">Your composition</p>
            <p className="mt-1.5 font-serif text-base font-light tracking-wide text-gold-100/90 md:text-lg">
              {settingById(config.setting).label} · {metalById(config.metal).label} ·{" "}
              {gemById(config.gem).label}
            </p>
            <p className="font-sans text-[0.65rem] tracking-[0.2em] text-gold-100/60">
              {cutById(config.cut).label} · <AnimatedNumber value={config.carat} format={fmtCarat} /> ct
            </p>
          </div>
          <div className="text-right">
            <p className="font-sans text-[0.6rem] uppercase tracking-[0.3em] text-gold-100/50">Estimated from</p>
            <p className="mt-1 font-serif text-2xl font-light text-gold-200 md:text-3xl">
              <AnimatedNumber value={price} format={fmtPrice} />
            </p>
          </div>
        </div>

        <span className="pointer-events-none absolute bottom-1/2 left-1/2 -translate-x-1/2 translate-y-[135px] font-sans text-[0.55rem] uppercase tracking-[0.35em] text-white/25 lg:translate-y-[175px]">
          drag to rotate
        </span>
      </div>

      {/* ======================= RIGHT · STEP PANEL ======================= */}
      <div className="relative z-20 flex-1 border-t border-zinc-900 bg-[#0b0b0c] lg:border-l lg:border-t-0">
        <div className="mx-auto flex min-h-full max-w-2xl flex-col px-6 py-10 md:px-12 md:py-14">
          {/* progress rail */}
          <nav aria-label="Design steps" className="mb-10">
            <div className="flex items-center gap-1.5">
              {STEPS.map((s, i) => (
                <button
                  key={s.key}
                  type="button"
                  onClick={() => i <= step && setStep(i)}
                  aria-current={i === step ? "step" : undefined}
                  className={`group flex-1 pb-2 pt-1 text-left ${i <= step ? "cursor-pointer" : "cursor-default"}`}
                >
                  <span
                    className={`block h-[2px] w-full rounded-full transition-all duration-500 ${
                      i < step ? "bg-gold-500/70" : i === step ? "bg-gold-300" : "bg-zinc-800"
                    }`}
                  />
                  <span
                    className={`mt-2 hidden font-sans text-[0.55rem] uppercase tracking-[0.18em] transition-colors sm:block ${
                      i === step ? "text-gold-300" : i < step ? "text-gold-100/50 group-hover:text-gold-200" : "text-zinc-700"
                    }`}
                  >
                    {s.short}
                  </span>
                </button>
              ))}
            </div>
          </nav>

          {/* step content */}
          <div ref={panelRef} className="flex-1">
            <p data-step-item className="mb-3 font-sans text-[0.62rem] font-medium uppercase tracking-[0.4em] text-gold-400">
              {STEPS[step].eyebrow}
            </p>
            <h1 data-step-item className="font-serif text-3xl font-light tracking-wide text-gold-50 md:text-[2.6rem] md:leading-[1.1]">
              {STEPS[step].title}
            </h1>
            <p data-step-item className="mt-3 max-w-md font-sans text-xs font-light leading-relaxed tracking-wide text-zinc-400 md:text-sm">
              {STEPS[step].body}
            </p>

            <div className="mt-8">
              {/* --- Step 1 · Setting --- */}
              {step === 0 && (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {SETTINGS.map((s) => (
                    <OptionCard key={s.id} selected={config.setting === s.id} onSelect={() => set("setting", s.id)}>
                      <span className={`${config.setting === s.id ? "text-gold-300" : "text-zinc-500 group-hover:text-gold-200/70"} transition-colors`}>
                        <SettingIcon id={s.id} />
                      </span>
                      <h3 className="mt-3 font-serif text-lg font-light tracking-wide text-gold-50">{s.label}</h3>
                      <p className="mt-0.5 font-sans text-[0.62rem] uppercase tracking-[0.2em] text-gold-400/80">{s.tagline}</p>
                      <p className="mt-2 font-sans text-[0.7rem] font-light leading-relaxed text-zinc-500">{s.description}</p>
                    </OptionCard>
                  ))}
                </div>
              )}

              {/* --- Step 2 · Metal --- */}
              {step === 1 && (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {METALS.map((m) => (
                    <OptionCard key={m.id} selected={config.metal === m.id} onSelect={() => set("metal", m.id)}>
                      <span className="flex items-center gap-4">
                        <span
                          className="h-12 w-12 shrink-0 rounded-full shadow-[inset_0_-4px_10px_rgba(0,0,0,0.35),0_2px_10px_rgba(0,0,0,0.5)] ring-1 ring-white/20"
                          style={{ background: m.swatch }}
                          aria-hidden
                        />
                        <span>
                          <h3 className="font-serif text-lg font-light tracking-wide text-gold-50">{m.label}</h3>
                          <p className="font-sans text-[0.62rem] uppercase tracking-[0.2em] text-gold-400/80">{m.karat}</p>
                        </span>
                      </span>
                      <p className="mt-3 font-sans text-[0.7rem] font-light text-zinc-500">{m.description}</p>
                    </OptionCard>
                  ))}
                </div>
              )}

              {/* --- Step 3 · Gemstone --- */}
              {step === 2 && (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                  {GEMS.map((g) => (
                    <OptionCard key={g.id} selected={config.gem === g.id} onSelect={() => set("gem", g.id)} className="!p-4 text-center">
                      <span
                        className="mx-auto block h-14 w-14 rounded-full shadow-[inset_0_-5px_12px_rgba(0,0,0,0.4),0_4px_14px_rgba(0,0,0,0.55)] ring-1 ring-white/25 transition-transform duration-300 group-hover:scale-110"
                        style={{ background: g.swatch }}
                        aria-hidden
                      />
                      <h3 className="mt-3 font-serif text-base font-light tracking-wide text-gold-50">{g.label}</h3>
                      <p className="font-sans text-[0.58rem] uppercase tracking-[0.18em] text-gold-400/80">{g.origin}</p>
                      <p className="mt-1.5 font-sans text-[0.65rem] font-light leading-snug text-zinc-500">{g.description}</p>
                    </OptionCard>
                  ))}
                </div>
              )}

              {/* --- Step 4 · Cut --- */}
              {step === 3 && (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {CUTS.map((c) => (
                    <OptionCard key={c.id} selected={config.cut === c.id} onSelect={() => set("cut", c.id)}>
                      <span className={`${config.cut === c.id ? "text-gold-300" : "text-zinc-500 group-hover:text-gold-200/70"} transition-colors`}>
                        <CutIcon id={c.id} />
                      </span>
                      <h3 className="mt-3 font-serif text-lg font-light tracking-wide text-gold-50">{c.label}</h3>
                      <p className="mt-0.5 font-sans text-[0.62rem] uppercase tracking-[0.2em] text-gold-400/80">{c.facets}</p>
                      <p className="mt-2 font-sans text-[0.7rem] font-light leading-relaxed text-zinc-500">{c.description}</p>
                    </OptionCard>
                  ))}
                </div>
              )}

              {/* --- Step 5 · Carat + Engraving --- */}
              {step === 4 && (
                <div className="space-y-10">
                  <div data-step-item>
                    <div className="flex items-end justify-between">
                      <span className="font-sans text-[0.62rem] uppercase tracking-[0.3em] text-gold-100/60">Carat weight</span>
                      <span className="font-serif text-5xl font-light text-gold-200">
                        <AnimatedNumber value={config.carat} format={fmtCarat} />
                        <span className="ml-1 text-lg text-gold-100/50">ct</span>
                      </span>
                    </div>
                    <input
                      type="range"
                      min={CARAT_MIN}
                      max={CARAT_MAX}
                      step={CARAT_STEP}
                      value={config.carat}
                      onChange={(e) => set("carat", Number(e.target.value))}
                      className="luxe-range mt-6 w-full"
                      aria-label="Carat weight"
                    />
                    <div className="mt-2 flex justify-between font-sans text-[0.6rem] tracking-[0.15em] text-zinc-600">
                      <span>0.5 · delicate</span>
                      <span>1.5 · statement</span>
                      <span>3.0 · monumental</span>
                    </div>
                  </div>

                  <div data-step-item>
                    <label htmlFor="engraving" className="font-sans text-[0.62rem] uppercase tracking-[0.3em] text-gold-100/60">
                      Inner-band engraving <span className="text-zinc-600">(optional)</span>
                    </label>
                    <input
                      id="engraving"
                      type="text"
                      maxLength={28}
                      value={config.engraving}
                      onChange={(e) => set("engraving", e.target.value)}
                      placeholder="e.g. Always, A."
                      className="mt-3 w-full border-b border-zinc-800 bg-transparent py-3 font-serif text-xl font-light italic tracking-wide text-gold-100 placeholder-zinc-700 outline-none transition-colors focus:border-gold-400"
                    />
                    <div className="mt-4 flex h-14 items-center justify-center overflow-hidden rounded-full border border-zinc-800/80 bg-black/40">
                      <span className="font-serif text-sm font-light italic tracking-[0.3em] text-gold-300/80">
                        {config.engraving ? `“ ${config.engraving} ”` : "your words, hidden inside"}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* --- Step 6 · Review + AI reveal --- */}
              {step === 5 && (
                <div className="space-y-8">
                  <dl className="divide-y divide-zinc-900 rounded-2xl border border-zinc-800/80 bg-white/[0.015]">
                    {summary.map((row) => (
                      <div key={row.label} data-step-item className="flex items-center justify-between px-5 py-3.5">
                        <dt className="font-sans text-[0.62rem] uppercase tracking-[0.25em] text-zinc-500">{row.label}</dt>
                        <dd className="flex items-center gap-3">
                          <span className="font-serif text-sm font-light tracking-wide text-gold-100">{row.value}</span>
                          <button
                            type="button"
                            onClick={() => setStep(row.step)}
                            className="font-sans text-[0.58rem] uppercase tracking-[0.2em] text-gold-500/70 transition-colors hover:text-gold-300 cursor-pointer"
                          >
                            Edit
                          </button>
                        </dd>
                      </div>
                    ))}
                    <div data-step-item className="flex items-center justify-between px-5 py-4">
                      <dt className="font-sans text-[0.62rem] uppercase tracking-[0.25em] text-gold-400">Estimated from</dt>
                      <dd className="font-serif text-2xl font-light text-gold-200">
                        <AnimatedNumber value={price} format={fmtPrice} />
                      </dd>
                    </div>
                  </dl>

                  <div data-step-item className="space-y-4">
                    <button
                      type="button"
                      onClick={generate}
                      className="group relative w-full overflow-hidden rounded-full bg-gold-400 px-8 py-4 font-sans text-xs font-semibold uppercase tracking-[0.25em] text-obsidian-950 shadow-[0_4px_30px_rgba(212,175,55,0.3)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-gold-300 hover:shadow-[0_6px_40px_rgba(212,175,55,0.5)] active:translate-y-0 cursor-pointer"
                    >
                      <span className="relative z-10">✦ &nbsp;Reveal my ring with AI</span>
                      <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                    </button>
                    <p className="text-center font-sans text-[0.6rem] font-light tracking-[0.15em] text-zinc-600">
                      Our AI atelier will paint a photoreal portrait of your exact composition.
                    </p>

                    {/* — or — */}
                    <div className="flex items-center gap-4" aria-hidden>
                      <span className="h-px flex-1 bg-zinc-800" />
                      <span className="font-sans text-[0.6rem] uppercase tracking-[0.35em] text-zinc-600">or</span>
                      <span className="h-px flex-1 bg-zinc-800" />
                    </div>

                    <a
                      href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(buildWhatsAppMessage(config))}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex w-full items-center justify-center gap-3 rounded-full border border-[#25D366]/40 bg-[#25D366]/[0.08] px-8 py-4 font-sans text-xs font-semibold uppercase tracking-[0.25em] text-[#4be084] transition-all duration-300 hover:-translate-y-0.5 hover:border-[#25D366]/80 hover:bg-[#25D366]/15 hover:shadow-[0_6px_30px_rgba(37,211,102,0.2)] active:translate-y-0"
                    >
                      <WhatsAppIcon />
                      Enquire on WhatsApp
                    </a>
                    <p className="text-center font-sans text-[0.6rem] font-light tracking-[0.15em] text-zinc-600">
                      Sends your full composition to our atelier concierge — no obligation.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* back / continue */}
          <div className="mt-10 flex items-center justify-between border-t border-zinc-900 pt-6">
            <button
              type="button"
              onClick={() => setStep((s) => Math.max(0, s - 1))}
              disabled={step === 0}
              className="rounded-full border border-zinc-800 px-6 py-3 font-sans text-[0.62rem] uppercase tracking-[0.25em] text-zinc-400 transition-all duration-300 hover:border-gold-500/40 hover:text-gold-200 disabled:pointer-events-none disabled:opacity-30 cursor-pointer"
            >
              ← Back
            </button>
            {step < STEPS.length - 1 && (
              <button
                type="button"
                onClick={() => setStep((s) => Math.min(STEPS.length - 1, s + 1))}
                className="rounded-full bg-gold-400 px-8 py-3 font-sans text-[0.62rem] font-semibold uppercase tracking-[0.25em] text-obsidian-950 shadow-[0_4px_20px_rgba(212,175,55,0.25)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-gold-300 active:translate-y-0 cursor-pointer"
              >
                Continue →
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ======================= AI REVEAL OVERLAY ======================= */}
      {gen.status !== "idle" && (
        <div
          ref={overlayRef}
          role="dialog"
          aria-modal="true"
          aria-label="AI ring reveal"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-5 backdrop-blur-xl"
        >
          {gen.status === "loading" && (
            <div className="flex flex-col items-center text-center">
              {/* spinning facet loader */}
              <div className="relative h-24 w-24">
                <div className="absolute inset-0 animate-spin rounded-full border border-gold-500/15 border-t-gold-300" style={{ animationDuration: "1.6s" }} />
                <div className="absolute inset-3 animate-spin rounded-full border border-gold-500/10 border-b-gold-400/70" style={{ animationDuration: "2.4s", animationDirection: "reverse" }} />
                <div className="absolute inset-0 flex items-center justify-center font-serif text-2xl text-gold-300">✦</div>
              </div>
              <p className="mt-8 font-serif text-xl font-light italic tracking-wide text-gold-100" aria-live="polite">
                {LOADING_LINES[loadingLine]}
              </p>
              <p className="mt-2 font-sans text-[0.62rem] uppercase tracking-[0.3em] text-zinc-500">
                rendering your commission — up to ~20 seconds
              </p>
              <button
                type="button"
                onClick={closeOverlay}
                className="mt-10 font-sans text-[0.62rem] uppercase tracking-[0.25em] text-zinc-500 underline-offset-4 transition-colors hover:text-gold-200 cursor-pointer"
              >
                Cancel
              </button>
            </div>
          )}

          {gen.status === "error" && (
            <div className="max-w-md rounded-3xl border border-zinc-800 bg-[#0b0b0c] p-10 text-center">
              <p className="font-serif text-2xl font-light text-gold-100">The atelier paused</p>
              <p className="mt-4 font-sans text-xs font-light leading-relaxed text-zinc-400">{gen.message}</p>
              <div className="mt-8 flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={generate}
                  className="rounded-full bg-gold-400 px-7 py-3 font-sans text-[0.62rem] font-semibold uppercase tracking-[0.25em] text-obsidian-950 transition-colors hover:bg-gold-300 cursor-pointer"
                >
                  Try again
                </button>
                <button
                  type="button"
                  onClick={closeOverlay}
                  className="rounded-full border border-zinc-700 px-7 py-3 font-sans text-[0.62rem] uppercase tracking-[0.25em] text-zinc-300 transition-colors hover:border-gold-400/50 hover:text-gold-200 cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          )}

          {gen.status === "done" && (
            <div className="flex max-h-full w-full max-w-3xl flex-col overflow-y-auto rounded-3xl border border-gold-500/20 bg-[#0b0b0c] shadow-[0_0_120px_rgba(212,175,55,0.15)]">
              <div className="flex items-center justify-between border-b border-zinc-900 px-7 py-5">
                <div>
                  <p className="font-sans text-[0.6rem] uppercase tracking-[0.35em] text-gold-400">The Reveal</p>
                  <p className="mt-1 font-serif text-xl font-light tracking-wide text-gold-50">Your bespoke commission</p>
                </div>
                <button
                  type="button"
                  onClick={closeOverlay}
                  aria-label="Close"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-zinc-800 text-zinc-400 transition-colors hover:border-gold-400/50 hover:text-gold-200 cursor-pointer"
                >
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" />
                  </svg>
                </button>
              </div>

              <div className="relative mx-7 mt-7 overflow-hidden rounded-2xl bg-white">
                {/* eslint-disable-next-line @next/next/no-img-element -- data: URL from the AI render */}
                <img src={gen.image} alt="AI render of your configured ring" className="mx-auto max-h-[52svh] w-auto object-contain" />
              </div>

              <p className="px-7 pt-4 text-center font-serif text-sm font-light italic tracking-wide text-gold-100/80">
                {config.carat.toFixed(1)} ct {cutById(config.cut).label} {gemById(config.gem).label} ·{" "}
                {metalById(config.metal).label} · {settingById(config.setting).label}
                {config.engraving ? ` · “${config.engraving}”` : ""}
              </p>

              <div className="flex flex-col items-center justify-center gap-3 px-7 py-6 sm:flex-row">
                <a
                  href={gen.image}
                  download="ceylon-gem-maison-bespoke-ring.png"
                  className="w-full rounded-full bg-gold-400 px-7 py-3 text-center font-sans text-[0.62rem] font-semibold uppercase tracking-[0.25em] text-obsidian-950 transition-colors hover:bg-gold-300 sm:w-auto"
                >
                  Download portrait
                </a>
                <button
                  type="button"
                  onClick={generate}
                  className="w-full rounded-full border border-gold-400/30 px-7 py-3 font-sans text-[0.62rem] uppercase tracking-[0.25em] text-gold-200 transition-colors hover:bg-gold-500/10 sm:w-auto cursor-pointer"
                >
                  Render again
                </button>
                <a
                  href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(buildWhatsAppMessage(config))}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex w-full items-center justify-center gap-2 rounded-full border border-[#25D366]/40 px-7 py-3 text-center font-sans text-[0.62rem] font-semibold uppercase tracking-[0.25em] text-[#4be084] transition-colors hover:border-[#25D366]/80 hover:bg-[#25D366]/10 sm:w-auto"
                >
                  <WhatsAppIcon className="h-3.5 w-3.5" />
                  Continue on WhatsApp
                </a>
              </div>
              <p className="pb-6 text-center font-sans text-[0.55rem] font-light tracking-[0.2em] text-zinc-600">
                AI visualization — your final piece is hand-crafted and photographed at our atelier.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
