"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import BespokeJewel3D from "@/components/atelier/BespokeJewel3D";
import {
  BRACELET_STYLES,
  CUTS,
  DEFAULT_CONFIG,
  FITS,
  GEMS,
  METALS,
  PENDANT_STYLES,
  PIECES,
  SETTINGS,
  type BraceletStyleId,
  type PendantStyleId,
  type PieceId,
  type RingConfig,
  braceletStyleById,
  buildWhatsAppMessage,
  caratRuleFor,
  cutById,
  estimatePrice,
  fitById,
  gemById,
  isAppointmentCarat,
  metalById,
  pendantStyleById,
  pieceById,
  settingById,
} from "@/lib/ring-options";

import { WHATSAPP_NUMBER } from "@/lib/contact";
import { validateLead } from "@/lib/lead-validation";

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
/** Bracelet stones step in 0.05 ct — two decimals or the slider reads as stuck. */
const fmtCarat2 = (n: number) => n.toFixed(2);

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

const SIZE_BODY: Record<PieceId, string> = {
  ring: "Scale the stone to the hand that will wear it, and hide a few words inside the band.",
  necklace: "Scale the stone to the neckline it will grace, and hide a few words on the clasp tag.",
  bracelet: "Choose the weight of each stone, size the piece to the wrist, and hide a few words on the clasp.",
};

const ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII"];

type StepDef = { key: string; short: string; eyebrow: string; title: string; body: string };

/* Bracelets are pure metalwork, so their flow skips the stone steps entirely. */
function stepsFor(pieceId: PieceId): StepDef[] {
  const piece = pieceById(pieceId);
  const pieceStep = { key: "piece", short: "Piece", name: "The Piece", title: "Choose your canvas", body: "Ring, necklace or bracelet — every commission begins with the form it will live in." };
  const metalStep = { key: "metal", short: "Metal", name: "The Metal", title: "Select your precious metal", body: "Each alloy carries its own temperature of light. Watch the piece transform as you choose." };
  const reviewStep = { key: "review", short: "Reveal", name: "The Reveal", title: "Your commission", body: `Review every choice — then let our AI atelier render your finished ${piece.noun}.` };

  const steps =
    pieceId === "bracelet"
      ? [
          pieceStep,
          { key: "style", short: "Design", name: "The Design", title: "Choose the design", body: "Five signatures of the Maison — from a single bezel-set stone to an unbroken line of light." },
          metalStep,
          { key: "gem", short: "Stone", name: "The Gemstones", title: "Colour the stones", body: "From glacial diamonds to Ceylon sapphires — every stone is hand-selected and certified." },
          { key: "cut", short: "Shape", name: "The Shape", title: "Shape the stones", body: "The cut decides how each stone breathes light. Six signatures, six temperaments." },
          { key: "size", short: "Size", name: "The Presence", title: "Stones, fit & inscription", body: SIZE_BODY.bracelet },
          reviewStep,
        ]
      : pieceId === "necklace"
        ? [
            pieceStep,
            { key: "pendant", short: "Pendant", name: "The Pendant", title: "Choose the pendant", body: "Five signatures of the Maison — each design carries its own stone shape, true to the drawing." },
            metalStep,
            { key: "gem", short: "Stone", name: "The Gemstone", title: "Colour the stone", body: "From glacial diamonds to Ceylon sapphires — every stone is hand-selected and certified." },
            { key: "size", short: "Size", name: "The Presence", title: "Carat & inscription", body: SIZE_BODY.necklace },
            reviewStep,
          ]
        : [
            pieceStep,
            { key: "setting", short: "Setting", name: "The Setting", title: "Choose the architecture", body: "The eighteen classic silhouettes — how the stone is held, presented, and lived with." },
            metalStep,
            { key: "gem", short: "Stone", name: "The Gemstone", title: "Set the heart of the piece", body: "From glacial diamonds to pigeon-blood rubies — every stone is hand-selected and certified." },
            { key: "cut", short: "Cut", name: "The Cut", title: "Shape the light", body: "The cut decides how your stone breathes light. Six signatures, six temperaments." },
            { key: "size", short: "Size", name: "The Presence", title: "Carat & inscription", body: SIZE_BODY[pieceId] },
            reviewStep,
          ];

  return steps.map(({ name, ...s }, i) => ({ ...s, eyebrow: `${ROMAN[i]} · ${name}` }));
}

/* ------------------------------------------------- inline SVG option icons */

function PieceIcon({ id }: { id: PieceId }) {
  const common = {
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.4,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  return (
    <svg viewBox="0 0 48 48" className="h-10 w-10">
      {id === "ring" && (
        <>
          <circle cx="24" cy="29" r="11" {...common} />
          <path d="M24 8l5.5 5.5L24 21l-5.5-7.5z" {...common} />
          <path d="M18.5 13.5h11" {...common} />
        </>
      )}
      {id === "necklace" && (
        <>
          <path d="M8 10c1.5 10 8 16 16 16s14.5-6 16-16" {...common} />
          <path d="M24 26v4" {...common} />
          <path d="M24 30l4.5 4.5L24 41l-4.5-6.5z" {...common} />
        </>
      )}
      {id === "bracelet" && (
        <>
          <ellipse cx="24" cy="27" rx="15" ry="10" {...common} />
          <ellipse cx="24" cy="27" rx="11" ry="6.8" {...common} opacity={0.55} />
          <path d="M24 9.5l4 4-4 5.5-4-5.5z" {...common} />
        </>
      )}
    </svg>
  );
}

/** The five standardised bracelet designs, drawn flat like the Maison's chart. */
function BraceletStyleIcon({ id }: { id: BraceletStyleId }) {
  const stroke = "currentColor";
  const common = { fill: "none", stroke, strokeWidth: 1.3 };
  const chainLink = (x: number) => (
    <circle key={x} cx={x} cy={24} r="1.5" {...common} strokeWidth={1} />
  );
  const marquise = (cx: number) => (
    <path
      key={cx}
      d={`M${cx - 4.2} 24 Q${cx} 20.6 ${cx + 4.2} 24 Q${cx} 27.4 ${cx - 4.2} 24 z`}
      {...common}
    />
  );
  return (
    <svg viewBox="0 0 48 48" className="h-10 w-10">
      {id === "single" && (
        <>
          {[5, 9, 13, 17, 31, 35, 39, 43].map(chainLink)}
          <circle cx="24" cy="24" r="4.8" {...common} />
          <circle cx="24" cy="24" r="2.7" {...common} />
        </>
      )}
      {id === "tennis" && (
        <>
          {[6, 10.5, 15, 19.5, 24, 28.5, 33, 37.5, 42].map((x) => (
            <g key={x}>
              <circle cx={x} cy={24} r="2.35" {...common} />
              <circle cx={x} cy={24} r="0.7" fill={stroke} stroke="none" />
            </g>
          ))}
        </>
      )}
      {id === "station" && (
        <>
          {[4.5, 15.5, 19.5, 28.5, 32.5, 43.5].map(chainLink)}
          {[10, 24, 38].map((x) => (
            <g key={x}>
              <circle cx={x} cy={24} r="3.4" {...common} />
              <circle cx={x} cy={24} r="1.7" {...common} />
            </g>
          ))}
        </>
      )}
      {id === "bar" && (
        <>
          {[4.5, 8.5, 12.5, 35.5, 39.5, 43.5].map(chainLink)}
          <rect x="15.5" y="21.2" width="17" height="5.6" rx="2.8" {...common} />
          {[19, 22.3, 25.7, 29].map((x) => (
            <circle key={x} cx={x} cy={24} r="1.1" fill={stroke} stroke="none" />
          ))}
        </>
      )}
      {id === "mixed" && (
        <>
          {[4.5, 43.5].map(chainLink)}
          {[10, 24, 38].map((x) => (
            <g key={x}>
              <circle cx={x} cy={24} r="2.5" {...common} />
              <circle cx={x} cy={24} r="0.7" fill={stroke} stroke="none" />
            </g>
          ))}
          {[17, 31].map(marquise)}
        </>
      )}
    </svg>
  );
}

/** The five standardised pendant designs, drawn to echo the Maison's chart. */
function PendantIcon({ id }: { id: PendantStyleId }) {
  const stroke = "currentColor";
  const common = {
    fill: "none",
    stroke,
    strokeWidth: 1.3,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  const thin = { ...common, strokeWidth: 0.8 };
  /* the chain draping down to the bail */
  const chain = <path d="M10 5l12.2 9M38 5L25.8 14" {...thin} strokeDasharray="2 1.6" />;
  /* the small tapered bail most designs hang from */
  const bail = <path d="M24 13.2c-1.9 1.5-2.5 3.1-1.8 5h3.6c.7-1.9.1-3.5-1.8-5z" {...common} />;
  const dot = (cx: number, cy: number, r = 1.1, key?: string | number) => (
    <circle key={key} cx={cx} cy={cy} r={r} fill={stroke} stroke="none" />
  );
  return (
    <svg viewBox="0 0 48 48" className="h-10 w-10">
      {chain}
      {id === "bezel" && (
        <>
          <circle cx="24" cy="16.5" r="2.3" {...common} />
          <circle cx="24" cy="29.5" r="8.4" {...common} />
          <circle cx="24" cy="29.5" r="5.5" {...common} strokeWidth={1.1} />
        </>
      )}
      {id === "prong" && (
        <>
          {bail}
          <ellipse cx="24" cy="30" rx="5.8" ry="7.8" {...common} />
          {dot(19.9, 24.6, 1.15, "tl")}
          {dot(28.1, 24.6, 1.15, "tr")}
          {dot(19.9, 35.4, 1.15, "bl")}
          {dot(28.1, 35.4, 1.15, "br")}
        </>
      )}
      {id === "pear-drop" && (
        <>
          {bail}
          <path
            d="M24 20.5c4.5 5 6.1 9 4.7 12.6-1.4 3.7-8 3.7-9.4 0-1.4-3.6.2-7.6 4.7-12.6z"
            {...common}
          />
          {dot(24, 20.9, 1.05, "t")}
          {dot(19.8, 33.6, 1.05, "l")}
          {dot(28.2, 33.6, 1.05, "r")}
        </>
      )}
      {id === "bar" && (
        <>
          <rect x="22.6" y="13.2" width="2.8" height="4.6" rx="0.7" {...common} />
          <rect x="20.9" y="21.8" width="6.2" height="14.6" rx="0.8" {...common} />
          <rect x="19.5" y="20.3" width="9" height="2.6" rx="1.1" {...common} strokeWidth={1.1} />
          <rect x="19.5" y="35.3" width="9" height="2.6" rx="1.1" {...common} strokeWidth={1.1} />
        </>
      )}
      {id === "solitaire-drop" && (
        <>
          <path d="M24 12.5c-1.7 2.2-2.2 6-1.3 9.7h2.6c.9-3.7.4-7.5-1.3-9.7z" {...common} />
          <circle cx="24" cy="29" r="4.5" {...common} />
          {dot(24, 24.3, 1.05, "t")}
          {dot(20.1, 31.4, 1.05, "l")}
          {dot(27.9, 31.4, 1.05, "r")}
        </>
      )}
    </svg>
  );
}

/** The eighteen classic silhouettes, drawn to echo the Maison's style chart. */
function SettingIcon({ id }: { id: RingConfig["setting"] }) {
  const stroke = "currentColor";
  const common = {
    fill: "none",
    stroke,
    strokeWidth: 1.4,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  const thin = { ...common, strokeWidth: 0.8 };
  const band = <circle cx="24" cy="30" r="12" {...common} />;
  const dot = (cx: number, cy: number, r = 1.1, key?: string | number) => (
    <circle key={key} cx={cx} cy={cy} r={r} fill={stroke} stroke="none" />
  );
  /** dots tracing the band's top arc at radius `r` (angles in degrees from top) */
  const edgeDots = (r: number, angles: number[], size = 0.7) =>
    angles.map((deg) => {
      const a = (deg * Math.PI) / 180;
      return dot(24 + r * Math.sin(a), 30 - r * Math.cos(a), size, `${r}-${deg}`);
    });
  return (
    <svg viewBox="0 0 48 48" className="h-10 w-10">
      {id === "solitaire" && (
        <>
          {band}
          <path d="M24 8l5.5 5.5L24 21l-5.5-7.5z M18.5 13.5h11" {...common} />
        </>
      )}
      {id === "tension" && (
        <>
          <path d="M18.9 19.1 A12 12 0 1 0 29.1 19.1" {...common} strokeWidth={3.2} />
          <path d="M24 12.6l3.7 3.7L24 21.4l-3.7-5.1z" {...common} />
        </>
      )}
      {id === "three-stone" && (
        <>
          {band}
          <path d="M24 7.5l5 5-5 6.8-5-6.8z" {...common} />
          <path d="M13.8 11.5l3.4 3.4-3.4 4.6-3.4-4.6z" {...common} />
          <path d="M34.2 11.5l3.4 3.4-3.4 4.6-3.4-4.6z" {...common} />
        </>
      )}
      {id === "pave" && (
        <>
          {band}
          <path d="M24 8l5.5 5.5L24 21l-5.5-7.5z" {...common} />
          {[-3, -2, -1, 1, 2, 3].map((i) => {
            const a = Math.PI / 2 + i * 0.32;
            return dot(24 + Math.cos(a) * 12, 30 - Math.sin(a) * 12, 1.2, i);
          })}
        </>
      )}
      {id === "channel" && (
        <>
          {band}
          <path d="M24 7.5l5 5-5 6.8-5-6.8z" {...common} />
          <path d="M15.5 19.9 A13.2 13.2 0 0 1 32.5 19.9" {...thin} />
          <path d="M17.1 21.7 A10.8 10.8 0 0 1 30.9 21.7" {...thin} />
          {[-27, -13, 13, 27].map((deg) => {
            const a = (deg * Math.PI) / 180;
            const x = 24 + 12 * Math.sin(a);
            const y = 30 - 12 * Math.cos(a);
            return (
              <rect
                key={deg}
                x={x - 1.3}
                y={y - 1.3}
                width="2.6"
                height="2.6"
                transform={`rotate(${deg} ${x} ${y})`}
                {...thin}
              />
            );
          })}
        </>
      )}
      {id === "bezel" && (
        <>
          {band}
          <circle cx="24" cy="15" r="6" {...common} />
          <circle cx="24" cy="15" r="3.9" {...common} strokeWidth={1.1} />
        </>
      )}
      {id === "halo" && (
        <>
          {band}
          <path d="M24 10.2l4.4 4.4-4.4 6-4.4-6z" {...common} />
          {Array.from({ length: 8 }).map((_, i) => {
            const a = (i / 8) * Math.PI * 2;
            return dot(24 + Math.cos(a) * 9, 15 + Math.sin(a) * 9, 1.1, i);
          })}
        </>
      )}
      {id === "double-halo" && (
        <>
          <circle cx="24" cy="31" r="11" {...common} />
          <circle cx="24" cy="14" r="3" {...common} />
          {Array.from({ length: 10 }).map((_, i) => {
            const a = (i / 10) * Math.PI * 2;
            return dot(24 + Math.cos(a) * 5.6, 14 + Math.sin(a) * 5.6, 0.9, `in-${i}`);
          })}
          {Array.from({ length: 14 }).map((_, i) => {
            const a = (i / 14) * Math.PI * 2;
            return dot(24 + Math.cos(a) * 8.6, 14 + Math.sin(a) * 8.6, 0.9, `out-${i}`);
          })}
        </>
      )}
      {id === "split-shank" && (
        <>
          <path d="M12 30 A12 12 0 0 0 36 30" {...common} />
          <path d="M12 30C12 22.5 15.8 16.4 21 13.9" {...common} />
          <path d="M36 30C36 22.5 32.2 16.4 27 13.9" {...common} />
          <path d="M14.7 30C14.7 24.3 17.6 19.6 21.8 17.2" {...common} strokeWidth={1.1} />
          <path d="M33.3 30C33.3 24.3 30.4 19.6 26.2 17.2" {...common} strokeWidth={1.1} />
          <path d="M24 7.5l4.6 4.6L24 18.4l-4.6-6.3z" {...common} />
        </>
      )}
      {id === "cathedral" && (
        <>
          {band}
          <path d="M14.5 23.5C16.5 17 20 14 22 13.2" {...common} />
          <path d="M33.5 23.5C31.5 17 28 14 26 13.2" {...common} />
          <path d="M24 6.5l5 5-5 6.8-5-6.8z" {...common} />
        </>
      )}
      {id === "vintage" && (
        <>
          {band}
          <path d="M24 9.5l4.2 4.2-4.2 5.6-4.2-5.6z" {...common} />
          <path d="M18.5 15.5c-3.2-1.8-6 .2-4.6 2.6-2.4.6-2.2 3.4.4 3.6" {...common} strokeWidth={1.1} />
          <path d="M29.5 15.5c3.2-1.8 6 .2 4.6 2.6 2.4.6 2.2 3.4-.4 3.6" {...common} strokeWidth={1.1} />
          {dot(15, 12.8, 0.9, "l")}
          {dot(33, 12.8, 0.9, "r")}
        </>
      )}
      {id === "milgrain" && (
        <>
          {band}
          <path d="M24 8l5 5-5 6.8-5-6.8z" {...common} />
          {edgeDots(13.6, [-42, -28, -14, 14, 28, 42])}
          {edgeDots(10.4, [-42, -28, -14, 14, 28, 42])}
        </>
      )}
      {id === "trilogy" && (
        <>
          {band}
          <circle cx="24" cy="13.5" r="5" {...common} />
          <path d="M24 8.5v10M19 13.5h10" {...thin} opacity={0.7} />
          <circle cx="14.5" cy="17" r="3" {...common} />
          <circle cx="33.5" cy="17" r="3" {...common} />
        </>
      )}
      {id === "toi-et-moi" && (
        <>
          {band}
          <path d="M17.5 8.2c3 1.6 4.6 4.8 3.5 7.4-1 2.3-4 2.9-5.9 1.2-2-1.8-1.9-5.6 2.4-8.6z" {...common} />
          <circle cx="29.5" cy="14.5" r="4.2" {...common} />
          <path d="M29.5 10.3v8.4M25.3 14.5h8.4" {...thin} opacity={0.7} />
        </>
      )}
      {id === "bypass" && (
        <>
          <path d="M14.2 23.1 A12 12 0 1 0 33.8 23.1" {...common} />
          <path d="M14.2 23.1C16 16.8 21 13.6 27.8 15.4" {...common} />
          <path d="M33.8 23.1C32.4 19.4 28.6 17.6 24.4 18.2" {...common} strokeWidth={1.1} />
          <circle cx="24" cy="11.8" r="3.4" {...common} />
          <path d="M24 8.4v6.8M20.6 11.8h6.8" {...thin} opacity={0.7} />
        </>
      )}
      {id === "flush" && (
        <>
          <circle cx="24" cy="30" r="11.5" {...common} strokeWidth={4} />
          <circle cx="24" cy="18.5" r="3.4" {...common} strokeWidth={1.1} />
          {dot(24, 18.5, 1.6)}
        </>
      )}
      {id === "stackable" && (
        <>
          <circle cx="24" cy="24" r="12" {...common} />
          {Array.from({ length: 12 }).map((_, i) => {
            const a = (i / 12) * Math.PI * 2;
            return dot(24 + Math.cos(a) * 12, 24 + Math.sin(a) * 12, 1.1, i);
          })}
        </>
      )}
      {id === "signet" && (
        <>
          <path
            d="M9.8 28.5C11 20.5 17 15.8 24 15.8s13 4.7 14.2 12.7c.5 6.3-5.6 11.7-14.2 11.7S9.3 34.8 9.8 28.5z"
            {...common}
          />
          <circle cx="24" cy="24.5" r="4.4" {...common} />
          <circle cx="24" cy="24.5" r="2.2" {...common} strokeWidth={1.1} />
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
      {id === "marquise" && (
        <>
          <path d="M24 8C30.5 14.5 30.5 33.5 24 40C17.5 33.5 17.5 14.5 24 8z" {...common} strokeLinejoin="round" />
          <path d="M24 8v32M19.4 16h9.2M18.6 24h10.8M19.4 32h9.2" {...common} strokeWidth={0.7} opacity={0.7} />
        </>
      )}
      {id === "pear" && (
        <>
          <path
            d="M24 8.5c5.4 6.5 7.6 12.4 6.3 18.1-1 4.6-3.4 7.4-6.3 7.4s-5.3-2.8-6.3-7.4C16.4 20.9 18.6 15 24 8.5z"
            {...common}
            strokeLinejoin="round"
          />
          <path d="M24 8.5V34M18.2 21.5h11.6M19.3 28h9.4" {...common} strokeWidth={0.7} opacity={0.7} />
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
          ? "border-gold-400/70 bg-gold-500/[0.07] shadow-[0_0_30px_rgba(46,91,224,0.12)]"
          : "border-[#27497A]/80 bg-white/[0.015] hover:border-gold-500/30 hover:bg-white/[0.03]"
      } ${className}`}
    >
      {/* selected check */}
      <span
        className={`absolute right-4 top-4 flex h-5 w-5 items-center justify-center rounded-full border transition-all duration-300 ${
          selected ? "border-gold-300 bg-gold-400 text-white" : "border-zinc-700 text-transparent"
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

const REQUEST_ID_KEY = "cgm_craft_request_id";

/**
 * Versioned deliberately. The old key (`cgm_atelier_entered`) was written by the
 * full-page door gate and meant "has passed the door". This one means "we hold
 * their details" — a different claim. Reusing the name made every visitor who
 * had already passed the old gate look, to the new code, like a captured lead,
 * so their prompt never fired. Renaming retires those stale flags.
 */
const LEAD_ENTERED_KEY = "cgm_lead_captured_v2";

/**
 * How long a visitor gets alone with their piece before we ask who they are.
 * The details used to be demanded at the door, which meant the first thing the
 * atelier showed a prospective client was a form — plenty turned round there
 * without ever seeing the thing they came for. Long enough to turn the jewel
 * and feel it is theirs; short enough that they are still in the room.
 */
const PROMPT_AFTER_MS = 5000;

/* ---------------------------------------------- lead-capture prompt (modal) */

/**
 * Captures name + phone + email so every visitor who designs opens a craft
 * request in the Crafting inbox (which the admin promotes to the CRM by hand).
 *
 * This was once a full-page gate standing in front of the configurator. It now
 * arrives as an overlay after PROMPT_AFTER_MS, with the piece still turning
 * behind it — the visitor has handled the thing they came for, so the ask lands
 * on somebody already interested rather than on a stranger at the door. That is
 * the only concession: there is no dismiss. The studio exists to earn these
 * details, and a form you can wave away is a form nobody fills in.
 *
 * Fails open on OUR failures only: if the backend is unconfigured or the save
 * errors, the visitor carries on — we never punish them for our outage. Details
 * that fail validation are a different matter and are refused.
 */
function LeadPrompt({ onCaptured }: { onCaptured: (requestId: string | null) => void }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState(""); // honeypot
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  /* Complaints stay quiet until they have tried once — flagging an email as
     malformed while someone is still typing the third character is nagging. */
  const [submitted, setSubmitted] = useState(false);
  const panelRef = useRef<HTMLFormElement>(null);

  const { ok, errors } = validateLead({ name, phone, email });
  const shown = submitted ? errors : {};

  /* No Escape handler and no backdrop click: this does not close. What it does
     do is keep the keyboard inside itself, so tabbing cannot wander off into
     the configurator behind — a dialog you cannot see but can still type into
     is worse than one that traps you honestly. The page behind stops scrolling,
     and the entrance is a lift rather than a hard cut so it reads as arriving
     over the studio instead of replacing it. */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Tab" || !panelRef.current) return;
      const focusable = panelRef.current.querySelectorAll<HTMLElement>(
        'input:not([tabindex="-1"]), button, [href], select, textarea',
      );
      if (!focusable.length) return;
      const first = focusable[0]!;
      const last = focusable[focusable.length - 1]!;
      const active = document.activeElement;
      if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      } else if (e.shiftKey && active === first) {
        e.preventDefault();
        last.focus();
      } else if (active instanceof HTMLElement && !panelRef.current.contains(active)) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    let ctx: gsap.Context | undefined;
    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      ctx = gsap.context(() => {
        gsap.fromTo(
          panelRef.current,
          { opacity: 0, y: 28, scale: 0.97 },
          { opacity: 1, y: 0, scale: 1, duration: 0.6, ease: "power3.out" },
        );
      });
    }
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
      ctx?.revert();
    };
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    if (sending || !ok) return;
    setSending(true);
    setError(null);
    try {
      const res = await fetch("/api/craft-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone, email, company }),
      });
      if (res.status === 503) {
        // Backend not wired up yet — our problem, not theirs. Let them carry on.
        onCaptured(null);
        return;
      }
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || "Could not start your commission. Please try again.");
      }
      onCaptured(typeof data.requestId === "string" ? data.requestId : null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      setSending(false);
    }
  };

  /* Legibility, not decoration. Three things were fighting the reader here:
     the value was set in Trajan, which is a capitals-only display face and turns
     a typed email into unreadable caps; the placeholder was zinc-700, a near-black
     grey sitting on a navy ground; and the field itself was a bare hairline, so
     there was nothing to show where you could type. Body serif for the value, a
     mid-blue placeholder that reads as a hint without disappearing, and a faint
     filled well with a brighter rule under it. */
  const fieldBase =
    "mt-2 w-full rounded-t-md border-b-2 bg-white/[0.05] px-3.5 py-3 font-body text-base tracking-wide text-white outline-none transition-colors placeholder:text-[#7186AC] focus:bg-white/[0.09]";
  const field = (invalid?: string) =>
    `${fieldBase} ${
      invalid
        ? "border-rose-400/80 focus:border-rose-300"
        : "border-[#3A5E96] hover:border-[#4C77C0] focus:border-gold-400"
    }`;
  const label = "font-sans text-[0.62rem] uppercase tracking-[0.3em] text-gold-200";
  const note = "mt-2 font-body text-[0.72rem] leading-snug tracking-wide text-rose-300";

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="lead-prompt-title"
      className="fixed inset-0 z-[70] flex items-center justify-center overflow-y-auto bg-[#04102A]/80 px-5 py-10 text-gold-50 backdrop-blur-[3px]"
    >
      {/* The form sits on its own panel. Navy type on a navy stage with only
          ambient wash behind it gave the eye no edge to catch — a faint lifted
          surface with a hairline is what separates the form from the room. */}
      {/* noValidate: the browser's own bubbles would fire first and say
          "please fill in this field" where our checks have something specific
          to say. Validation is not weakened — submit() refuses on the same
          rules, and so does the API. */}
      <form
        ref={panelRef}
        onSubmit={submit}
        noValidate
        className="relative my-auto w-full max-w-3xl rounded-2xl border border-[#2A4C80] bg-[#0C2447]/95 p-7 shadow-[0_24px_60px_rgba(3,10,28,0.55)] backdrop-blur-xl md:p-9"
      >
        {/* Laid out across rather than down. Three fields stacked in a 448px
            column left most of a wide stage empty either side; the invitation and
            the fields sitting side by side use that width and shorten the form to
            about half its height. Stacks back to one column below md. */}
        <div className="grid items-center gap-8 md:grid-cols-[0.95fr_1.05fr] md:gap-12">
          {/* the invitation */}
          <div>
            <p className="font-sans text-[0.62rem] font-medium uppercase tracking-[0.4em] text-gold-300">
              Begin your commission
            </p>
            {/* h2, not h1: the page's single h1 is server-rendered in
                app/atelier/page.tsx so crawlers see a heading before hydration.
                globals.css styles h1 and h2 identically, so this is unchanged
                on screen. */}
            <h2
              id="lead-prompt-title"
              className="mt-3 font-serif text-3xl font-light leading-[1.1] tracking-wide text-gold-50 md:text-[2.4rem]"
            >
              Who are we <span className="italic text-gold-200">designing for?</span>
            </h2>
            <p className="mt-4 font-body text-sm font-light leading-relaxed tracking-wide text-[#A9B8D0]">
              Lovely choices so far. Your details, and our atelier concierge can follow
              up with your quotation and certification — then carry on composing exactly
              where you left off.
            </p>
          </div>

          {/* the details */}
          <div>
            <div className="space-y-5">
              <div>
                <label htmlFor="lead-name" className={label}>Full name</label>
                <input
                  id="lead-name"
                  type="text"
                  autoFocus
                  autoComplete="name"
                  placeholder="Amara Perera"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  aria-invalid={Boolean(shown.name)}
                  aria-describedby={shown.name ? "lead-name-error" : undefined}
                  className={field(shown.name)}
                />
                {shown.name && (
                  <p id="lead-name-error" className={note}>{shown.name}</p>
                )}
              </div>
              <div>
                <label htmlFor="lead-phone" className={label}>Phone / WhatsApp</label>
                <input
                  id="lead-phone"
                  type="tel"
                  autoComplete="tel"
                  placeholder="+65 9123 4567"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  aria-invalid={Boolean(shown.phone)}
                  aria-describedby={shown.phone ? "lead-phone-error" : undefined}
                  className={field(shown.phone)}
                />
                {shown.phone && (
                  <p id="lead-phone-error" className={note}>{shown.phone}</p>
                )}
              </div>
              <div>
                <label htmlFor="lead-email" className={label}>Email</label>
                <input
                  id="lead-email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  aria-invalid={Boolean(shown.email)}
                  aria-describedby={shown.email ? "lead-email-error" : undefined}
                  className={field(shown.email)}
                />
                {shown.email && (
                  <p id="lead-email-error" className={note}>{shown.email}</p>
                )}
              </div>
            </div>

            {/* Honeypot */}
            <div aria-hidden className="absolute left-[-9999px] top-0 h-0 w-0 overflow-hidden">
              <label htmlFor="lead-company">Company</label>
              <input
                id="lead-company"
                type="text"
                tabIndex={-1}
                autoComplete="off"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={sending}
              className="btn-luxe-pill mt-7 w-full cursor-pointer disabled:cursor-not-allowed disabled:opacity-70"
            >
              {sending ? "Saving your commission…" : "Continue my commission"}
            </button>

            {error && (
              <p className="mt-4 text-center font-body text-[0.78rem] tracking-wide text-rose-300" role="alert">
                {error}
              </p>
            )}

            <p className="mt-4 text-center font-body text-[0.68rem] font-light tracking-[0.12em] text-[#8296B8]">
              Your details stay private to the Maison — never shared, never sold.
            </p>
          </div>
        </div>
      </form>
    </div>
  );
}

export default function AtelierConfigurator() {
  const [step, setStep] = useState(0);
  const [config, setConfig] = useState<RingConfig>(DEFAULT_CONFIG);
  const [gen, setGen] = useState<GenState>({ status: "idle" });
  const [loadingLine, setLoadingLine] = useState(0);
  // Lead capture: `captured` records whether we have their details; `requestId`
  // links renders to the craft request opened when they gave them. `null` before
  // hydration means "not known yet", which only holds the prompt's timer — the
  // studio itself renders straight away either way.
  const [captured, setCaptured] = useState<boolean | null>(null);
  const [requestId, setRequestId] = useState<string | null>(null);
  const [promptOpen, setPromptOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  /* Mirrors `captured` for the guards below, which run inside event handlers
     that closed over the old value — a stale `false` there would re-open the
     prompt on someone who had just filled it in. */
  const capturedRef = useRef(false);

  // Restore capture state so a reload mid-design doesn't re-prompt. This must
  // run after mount (not a lazy useState initializer): the server has no
  // sessionStorage, so reading storage here and reconciling on the client avoids
  // a hydration mismatch. The one extra render is intended.
  /* eslint-disable react-hooks/set-state-in-effect -- mount-time read from an external system (sessionStorage) */
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(REQUEST_ID_KEY);
      if (saved) setRequestId(saved);
      const had = sessionStorage.getItem(LEAD_ENTERED_KEY) === "1";
      capturedRef.current = had;
      setCaptured(had);
    } catch {
      setCaptured(false);
    }
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  /* The grace period. It runs once per session: dismissing leaves `captured`
     false without re-running this effect, so the prompt does not nag on a
     timer — it comes back only when they reach for the reveal. */
  useEffect(() => {
    if (captured !== false) return;
    const id = setTimeout(() => setPromptOpen(true), PROMPT_AFTER_MS);
    return () => clearTimeout(id);
  }, [captured]);

  /* What the prompt interrupted, so filling it in carries straight on instead of
     making them press the same button twice. */
  const resumeRef = useRef<null | (() => void)>(null);

  const captureLead = useCallback((id: string | null) => {
    capturedRef.current = true;
    setRequestId(id);
    setCaptured(true);
    setPromptOpen(false);
    try {
      if (id) sessionStorage.setItem(REQUEST_ID_KEY, id);
      sessionStorage.setItem(LEAD_ENTERED_KEY, "1");
    } catch {
      /* sessionStorage unavailable — fine, just won't persist across reloads */
    }
    const resume = resumeRef.current;
    resumeRef.current = null;
    resume?.();
  }, []);

  /* Exploring is free; proceeding is not. Anything that carries the visitor
     forward calls this, and it either passes or raises the prompt. It also
     covers the visitor quick enough to press Continue inside the five seconds,
     who would otherwise walk the whole flow before the timer caught up. */
  const requireLead = useCallback((resume?: () => void) => {
    if (capturedRef.current) return true;
    resumeRef.current = resume ?? null;
    setPromptOpen(true);
    return false;
  }, []);

  const price = estimatePrice(config);
  const piece = pieceById(config.piece);
  const STEPS = stepsFor(config.piece);
  const stepInfo = STEPS[Math.min(step, STEPS.length - 1)];
  const stepKey = stepInfo.key;
  const set = useCallback(<K extends keyof RingConfig>(key: K, value: RingConfig[K]) => {
    setConfig((c) => ({ ...c, [key]: value }));
  }, []);

  /* Switching piece re-lands the carat inside the new piece's standard range
     (bracelets weigh per stone). Necklaces are pendant-led, so entering the
     necklace flow locks the cut to the chosen pendant's signature shape. */
  const choosePiece = useCallback((id: PieceId) => {
    setConfig((c) => {
      if (c.piece === id) return c;
      const rule = caratRuleFor(id);
      const carat = id === "bracelet" ? 0.3 : Math.min(rule.cap, Math.max(rule.min, c.carat));
      const cut = id === "necklace" ? pendantStyleById(c.pendantStyle).cut : c.cut;
      return { ...c, piece: id, carat, cut };
    });
  }, []);

  /* The pendant design IS the shape — selecting one sets its signature cut. */
  const choosePendant = useCallback((id: PendantStyleId) => {
    setConfig((c) => ({ ...c, pendantStyle: id, cut: pendantStyleById(id).cut }));
  }, []);

  const caratRule = caratRuleFor(config.piece);
  const overCap = isAppointmentCarat(config);
  const fmtCaratPiece = config.piece === "bracelet" ? fmtCarat2 : fmtCarat;

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

  // Enrich the craft request with the finished design when they reach the review
  // step, so the Crafting inbox reflects what they configured even if they never
  // render.
  useEffect(() => {
    if (!requestId || stepKey !== "review") return;
    fetch(`/api/craft-requests/${requestId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ config }),
    }).catch(() => {});
  }, [requestId, stepKey, config]);

  const generate = async () => {
    // The render is the commission — never produced for an anonymous visitor.
    if (!requireLead()) return;
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setLoadingLine(0);
    setGen({ status: "loading" });
    try {
      const res = await fetch("/api/generate-ring", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...config, requestId }),
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

  const metalValue = `${metalById(config.metal).karat} ${metalById(config.metal).label}`;
  const summary =
    config.piece === "bracelet"
      ? [
          { label: "Piece", value: piece.label.replace(/^The /, ""), key: "piece" },
          { label: "Design", value: braceletStyleById(config.braceletStyle).label, key: "style" },
          { label: "Metal", value: metalValue, key: "metal" },
          { label: "Gemstone", value: gemById(config.gem).label, key: "gem" },
          { label: "Shape", value: cutById(config.cut).label, key: "cut" },
          {
            label: "Stones",
            value: `${braceletStyleById(config.braceletStyle).stoneCount} × ${fmtCarat2(config.carat)} ct`,
            key: "size",
          },
          { label: "Fit", value: `${fitById(config.fit).label} · ${fitById(config.fit).size}`, key: "size" },
          { label: "Engraving", value: config.engraving || "—", key: "size" },
        ]
      : config.piece === "necklace"
      ? [
          { label: "Piece", value: piece.label.replace(/^The /, ""), key: "piece" },
          { label: "Pendant", value: pendantStyleById(config.pendantStyle).label, key: "pendant" },
          { label: "Metal", value: metalValue, key: "metal" },
          { label: "Gemstone", value: gemById(config.gem).label, key: "gem" },
          { label: "Shape", value: `${cutById(config.cut).label} · by design`, key: "pendant" },
          { label: "Carat", value: `${config.carat.toFixed(1)} ct`, key: "size" },
          { label: "Engraving", value: config.engraving || "—", key: "size" },
        ]
      : [
          { label: "Piece", value: piece.label.replace(/^The /, ""), key: "piece" },
          { label: "Setting", value: settingById(config.setting).label, key: "setting" },
          { label: "Metal", value: metalValue, key: "metal" },
          { label: "Gemstone", value: gemById(config.gem).label, key: "gem" },
          { label: "Cut", value: cutById(config.cut).label, key: "cut" },
          { label: "Carat", value: `${config.carat.toFixed(1)} ct`, key: "size" },
          { label: "Engraving", value: config.engraving || "—", key: "size" },
        ];
  const stepIndexOf = (key: string) => Math.max(0, STEPS.findIndex((s) => s.key === key));

  /* The details buy passage through the flow, not entry to it. Turning the
     jewel, swapping metals and stones on the step you are on stay free forever
     — but moving forward is proceeding, and that is what they are for. */
  const advance = () => setStep((s) => Math.min(STEPS.length - 1, s + 1));
  const goNext = () => {
    if (!requireLead(advance)) return;
    advance();
  };

  /* ------------------------------------------------------------ rendering */

  return (
    <div className="relative flex min-h-[calc(100svh_-_var(--nav-h))] w-full flex-col bg-[#0A1F3D] text-gold-50 lg:flex-row">
      {/* ======================= LEFT · LIVE 3D STAGE ======================= */}
      <div className="sticky top-[var(--nav-h)] z-10 h-[44svh] w-full shrink-0 lg:h-[calc(100svh_-_var(--nav-h))] lg:w-[52%] xl:w-[55%]">
        {/* ambient stage dressing */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_42%,rgba(46,91,224,0.10)_0%,transparent_55%)]" />
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(46,91,224,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(46,91,224,0.025)_1px,transparent_1px)] bg-[size:44px_44px] [mask-image:radial-gradient(circle_at_center,black_30%,transparent_75%)]" />

        <BespokeJewel3D config={config} />

        {/* Context badge only. The "Maison Home" pill that sat opposite it is
            gone — the site navbar now runs across the atelier too, so it was a
            second home link sitting directly beneath the first. */}
        <div className="pointer-events-none absolute inset-x-0 top-0 flex justify-end p-5 md:p-7">
          <span className="hidden rounded-full border border-gold-400/20 bg-black/40 px-4 py-2 font-sans text-[0.62rem] uppercase tracking-[0.3em] text-gold-300 backdrop-blur-md sm:block">
            Bespoke Atelier
          </span>
        </div>

        {/* live spec readout */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-5 md:p-7">
          <div>
            <p className="font-sans text-[0.6rem] uppercase tracking-[0.3em] text-gold-100/50">Your composition</p>
            {config.piece === "bracelet" ? (
              <>
                <p className="mt-1.5 font-serif text-base font-light tracking-wide text-gold-100/90 md:text-lg">
                  {braceletStyleById(config.braceletStyle).label.replace(/ Bracelet$/, "")} Bracelet ·{" "}
                  {metalById(config.metal).label}
                </p>
                <p className="font-body text-[0.65rem] tracking-[0.2em] text-gold-100/60">
                  {braceletStyleById(config.braceletStyle).stoneCount} ×{" "}
                  <AnimatedNumber value={config.carat} format={fmtCarat2} /> ct{" "}
                  {gemById(config.gem).label} · {fitById(config.fit).label} fit
                </p>
              </>
            ) : (
              <>
                <p className="mt-1.5 font-serif text-base font-light tracking-wide text-gold-100/90 md:text-lg">
                  {config.piece === "necklace"
                    ? `${pendantStyleById(config.pendantStyle).label} Pendant`
                    : `${settingById(config.setting).label} ${piece.label.replace(/^The /, "")}`}{" "}
                  · {metalById(config.metal).label} · {gemById(config.gem).label}
                </p>
                <p className="font-body text-[0.65rem] tracking-[0.2em] text-gold-100/60">
                  {cutById(config.cut).label} · <AnimatedNumber value={config.carat} format={fmtCarat} /> ct
                </p>
              </>
            )}
          </div>
          <div className="text-right">
            <p className="font-sans text-[0.6rem] uppercase tracking-[0.3em] text-gold-100/50">
              {overCap ? "Reserved for" : "Estimated from"}
            </p>
            <p className="mt-1 font-serif text-2xl font-light text-gold-200 md:text-3xl">
              {overCap ? (
                <span className="text-lg italic md:text-xl">Private appointment</span>
              ) : (
                <AnimatedNumber value={price} format={fmtPrice} />
              )}
            </p>
          </div>
        </div>

        <span className="pointer-events-none absolute bottom-1/2 left-1/2 -translate-x-1/2 translate-y-[135px] font-sans text-[0.55rem] uppercase tracking-[0.35em] text-white/25 lg:translate-y-[175px]">
          drag to rotate
        </span>
      </div>

      {/* ======================= RIGHT · STEP PANEL ======================= */}
      <div className="relative z-20 flex-1 border-t border-[#1D3D6B] bg-[#0D2347] lg:border-l lg:border-t-0">
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
                      i < step ? "bg-gold-500/70" : i === step ? "bg-gold-300" : "bg-[#27497A]"
                    }`}
                  />
                  <span
                    className={`mt-2 hidden font-sans text-[0.55rem] uppercase tracking-[0.18em] transition-colors sm:block ${
                      i === step ? "text-gold-300" : i < step ? "text-gold-100/50 group-hover:text-gold-200" : "text-[#3A4E6B]"
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
              {stepInfo.eyebrow}
            </p>
            {/* h2 for the same reason as the gate heading above — and this one
                changes with every step, so it was never a stable page h1. */}
            <h2 data-step-item className="font-serif text-3xl font-light tracking-wide text-gold-50 md:text-[2.6rem] md:leading-[1.1]">
              {stepInfo.title}
            </h2>
            <p data-step-item className="mt-3 max-w-md font-body text-xs font-light leading-relaxed tracking-wide text-[#A9B8D0] md:text-sm">
              {stepInfo.body}
            </p>

            <div className="mt-8">
              {/* --- Piece --- */}
              {stepKey === "piece" && (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  {PIECES.map((p) => (
                    <OptionCard key={p.id} selected={config.piece === p.id} onSelect={() => choosePiece(p.id)}>
                      <span className={`${config.piece === p.id ? "text-gold-300" : "text-[#5E7495] group-hover:text-gold-200/70"} transition-colors`}>
                        <PieceIcon id={p.id} />
                      </span>
                      <h3 className="mt-3 font-serif text-lg font-light tracking-wide text-gold-50">{p.label}</h3>
                      <p className="mt-0.5 font-sans text-[0.62rem] uppercase tracking-[0.2em] text-gold-400/80">{p.tagline}</p>
                      <p className="mt-2 font-body text-[0.7rem] font-light leading-relaxed text-[#5E7495]">{p.description}</p>
                    </OptionCard>
                  ))}
                </div>
              )}

              {/* --- Bracelet style (pure metal — replaces the stone steps) --- */}
              {stepKey === "style" && (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {BRACELET_STYLES.map((b) => (
                    <OptionCard key={b.id} selected={config.braceletStyle === b.id} onSelect={() => set("braceletStyle", b.id)}>
                      <span className={`${config.braceletStyle === b.id ? "text-gold-300" : "text-[#5E7495] group-hover:text-gold-200/70"} transition-colors`}>
                        <BraceletStyleIcon id={b.id} />
                      </span>
                      <h3 className="mt-3 font-serif text-lg font-light tracking-wide text-gold-50">{b.label}</h3>
                      <p className="mt-0.5 font-sans text-[0.62rem] uppercase tracking-[0.2em] text-gold-400/80">{b.tagline}</p>
                      <p className="mt-2 font-body text-[0.7rem] font-light leading-relaxed text-[#5E7495]">{b.description}</p>
                    </OptionCard>
                  ))}
                </div>
              )}

              {/* --- Setting: the eighteen classic silhouettes (rings) --- */}
              {stepKey === "setting" && (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {SETTINGS.map((s) => (
                    <OptionCard
                      key={s.id}
                      selected={config.setting === s.id}
                      onSelect={() => set("setting", s.id)}
                      className="!p-4"
                    >
                      <span className={`${config.setting === s.id ? "text-gold-300" : "text-[#5E7495] group-hover:text-gold-200/70"} transition-colors`}>
                        <SettingIcon id={s.id} />
                      </span>
                      <h3 className="mt-2.5 font-serif text-base font-light tracking-wide text-gold-50">{s.label}</h3>
                      <p className="mt-1.5 font-body text-[0.68rem] font-light leading-relaxed text-[#5E7495]">{s.description}</p>
                    </OptionCard>
                  ))}
                </div>
              )}

              {/* --- Pendant: the five standardised designs (necklaces) ---
                  each locks its signature stone shape, per the chart */}
              {stepKey === "pendant" && (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {PENDANT_STYLES.map((p) => (
                    <OptionCard
                      key={p.id}
                      selected={config.pendantStyle === p.id}
                      onSelect={() => choosePendant(p.id)}
                      className="!p-4"
                    >
                      <span className={`${config.pendantStyle === p.id ? "text-gold-300" : "text-[#5E7495] group-hover:text-gold-200/70"} transition-colors`}>
                        <PendantIcon id={p.id} />
                      </span>
                      <h3 className="mt-2.5 font-serif text-base font-light tracking-wide text-gold-50">{p.label}</h3>
                      <p className="mt-0.5 font-sans text-[0.58rem] uppercase tracking-[0.18em] text-gold-400/80">
                        {cutById(p.cut).label} · by design
                      </p>
                      <p className="mt-1.5 font-body text-[0.68rem] font-light leading-relaxed text-[#5E7495]">{p.description}</p>
                    </OptionCard>
                  ))}
                </div>
              )}

              {/* --- Metal --- */}
              {stepKey === "metal" && (
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
                      <p className="mt-3 font-body text-[0.7rem] font-light text-[#5E7495]">{m.description}</p>
                    </OptionCard>
                  ))}
                </div>
              )}

              {/* --- Gemstone --- */}
              {stepKey === "gem" && (
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
                      <p className="mt-1.5 font-body text-[0.65rem] font-light leading-snug text-[#5E7495]">{g.description}</p>
                    </OptionCard>
                  ))}
                </div>
              )}

              {/* --- Cut --- */}
              {stepKey === "cut" && (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {CUTS.map((c) => (
                    <OptionCard key={c.id} selected={config.cut === c.id} onSelect={() => set("cut", c.id)}>
                      <span className={`${config.cut === c.id ? "text-gold-300" : "text-[#5E7495] group-hover:text-gold-200/70"} transition-colors`}>
                        <CutIcon id={c.id} />
                      </span>
                      <h3 className="mt-3 font-serif text-lg font-light tracking-wide text-gold-50">{c.label}</h3>
                      <p className="mt-0.5 font-sans text-[0.62rem] uppercase tracking-[0.2em] text-gold-400/80">{c.facets}</p>
                      <p className="mt-2 font-body text-[0.7rem] font-light leading-relaxed text-[#5E7495]">{c.description}</p>
                    </OptionCard>
                  ))}
                </div>
              )}

              {/* --- Size: carat (per stone on bracelets), wrist fit, inscription --- */}
              {stepKey === "size" && (
                <div className="space-y-10">
                  <div data-step-item>
                    <div className="flex items-end justify-between">
                      <span className="font-sans text-[0.62rem] uppercase tracking-[0.3em] text-gold-100/60">
                        {config.piece === "bracelet" ? "Carat · each stone" : "Carat weight"}
                      </span>
                      <span className="font-serif text-5xl font-light text-gold-200">
                        <AnimatedNumber value={config.carat} format={fmtCaratPiece} />
                        <span className="ml-1 text-lg text-gold-100/50">ct</span>
                      </span>
                    </div>
                    <input
                      type="range"
                      min={caratRule.min}
                      max={caratRule.max}
                      step={caratRule.step}
                      value={config.carat}
                      onChange={(e) => set("carat", Number(e.target.value))}
                      className="luxe-range mt-6 w-full"
                      aria-label={config.piece === "bracelet" ? "Carat weight per stone" : "Carat weight"}
                    />
                    <div className="mt-2 flex justify-between font-body text-[0.6rem] tracking-[0.15em] text-[#4A6285]">
                      <span>{caratRule.min} · delicate</span>
                      <span>{caratRule.cap} · atelier limit</span>
                      <span>{caratRule.max} · by appointment</span>
                    </div>
                    {overCap && (
                      <div className="mt-5 rounded-xl border border-gold-400/40 bg-gold-500/[0.08] px-4 py-3.5" role="status">
                        <p className="font-sans text-[0.6rem] uppercase tracking-[0.3em] text-gold-300">
                          Private appointment
                        </p>
                        <p className="mt-1.5 font-body text-[0.72rem] font-light leading-relaxed text-gold-100/80">
                          {config.piece === "bracelet"
                            ? `Stones above ${caratRule.cap} ct each move beyond the standard collection. Our concierge will source and certify stones of this calibre with you in person — reserve your appointment from the final step.`
                            : `A centre stone above ${caratRule.cap} ct moves beyond the standard collection. Our concierge will source and certify a stone of this calibre with you in person — reserve your appointment from the final step.`}
                        </p>
                      </div>
                    )}
                  </div>

                  {config.piece === "bracelet" && (
                    <div data-step-item>
                      <span className="font-sans text-[0.62rem] uppercase tracking-[0.3em] text-gold-100/60">Wrist fit</span>
                      <div className="mt-4 grid grid-cols-3 gap-3">
                        {FITS.map((f) => (
                          <OptionCard key={f.id} selected={config.fit === f.id} onSelect={() => set("fit", f.id)} className="!p-4 text-center">
                            <h3 className="font-serif text-base font-light tracking-wide text-gold-50">{f.label}</h3>
                            <p className="mt-1 font-sans text-[0.62rem] uppercase tracking-[0.2em] text-gold-400/80">{f.size}</p>
                          </OptionCard>
                        ))}
                      </div>
                      <p className="mt-3 font-body text-[0.6rem] font-light tracking-[0.15em] text-[#4A6285]">
                        Every bracelet is finished to measure at the atelier — this sets the starting fit.
                      </p>
                    </div>
                  )}

                  <div data-step-item>
                    <label htmlFor="engraving" className="font-sans text-[0.62rem] uppercase tracking-[0.3em] text-gold-100/60">
                      {config.piece === "ring" ? "Inner-band engraving" : "Clasp-tag engraving"}{" "}
                      <span className="text-[#4A6285]">(optional)</span>
                    </label>
                    <input
                      id="engraving"
                      type="text"
                      maxLength={28}
                      value={config.engraving}
                      onChange={(e) => set("engraving", e.target.value)}
                      placeholder="e.g. Always, A."
                      className="mt-3 w-full border-b border-[#27497A] bg-transparent py-3 font-serif text-xl font-light italic tracking-wide text-gold-100 placeholder-zinc-700 outline-none transition-colors focus:border-gold-400"
                    />
                    <div className="mt-4 flex h-14 items-center justify-center overflow-hidden rounded-full border border-[#27497A]/80 bg-black/40">
                      <span className="font-serif text-sm font-light italic tracking-[0.3em] text-gold-300/80">
                        {config.engraving ? `“ ${config.engraving} ”` : "your words, hidden inside"}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* --- Review + AI reveal --- */}
              {stepKey === "review" && (
                <div className="space-y-8">
                  <dl className="divide-y divide-[#1D3D6B] rounded-2xl border border-[#27497A]/80 bg-white/[0.015]">
                    {summary.map((row) => (
                      <div key={row.label} data-step-item className="flex items-center justify-between px-5 py-3.5">
                        <dt className="font-sans text-[0.62rem] uppercase tracking-[0.25em] text-[#5E7495]">{row.label}</dt>
                        <dd className="flex items-center gap-3">
                          <span className="font-serif text-sm font-light tracking-wide text-gold-100">{row.value}</span>
                          <button
                            type="button"
                            onClick={() => setStep(stepIndexOf(row.key))}
                            className="font-sans text-[0.58rem] uppercase tracking-[0.2em] text-gold-500/70 transition-colors hover:text-gold-300 cursor-pointer"
                          >
                            Edit
                          </button>
                        </dd>
                      </div>
                    ))}
                    <div data-step-item className="flex items-center justify-between px-5 py-4">
                      <dt className="font-sans text-[0.62rem] uppercase tracking-[0.25em] text-gold-400">
                        {overCap ? "Private appointment" : "Estimated from"}
                      </dt>
                      <dd className="font-serif text-2xl font-light text-gold-200">
                        {overCap ? (
                          <span className="text-lg italic">By consultation</span>
                        ) : (
                          <AnimatedNumber value={price} format={fmtPrice} />
                        )}
                      </dd>
                    </div>
                  </dl>

                  <div data-step-item className="space-y-4">
                    <button
                      type="button"
                      onClick={generate}
                      className="group relative w-full overflow-hidden rounded-full bg-gold-400 px-8 py-4 font-sans text-xs font-semibold uppercase tracking-[0.25em] text-white shadow-[0_4px_30px_rgba(46,91,224,0.3)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-gold-300 hover:shadow-[0_6px_40px_rgba(46,91,224,0.5)] active:translate-y-0 cursor-pointer"
                    >
                      <span className="relative z-10">✦ &nbsp;Reveal my {piece.noun} with AI</span>
                      <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                    </button>
                    <p className="text-center font-body text-[0.6rem] font-light tracking-[0.15em] text-[#4A6285]">
                      Our AI atelier will paint a photoreal portrait of your exact composition.
                    </p>

                    {/* — or — */}
                    <div className="flex items-center gap-4" aria-hidden>
                      <span className="h-px flex-1 bg-[#27497A]" />
                      <span className="font-sans text-[0.6rem] uppercase tracking-[0.35em] text-[#4A6285]">or</span>
                      <span className="h-px flex-1 bg-[#27497A]" />
                    </div>

                    <a
                      href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(buildWhatsAppMessage(config))}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex w-full items-center justify-center gap-3 rounded-full border border-[#25D366]/40 bg-[#25D366]/[0.08] px-8 py-4 font-sans text-xs font-semibold uppercase tracking-[0.25em] text-[#4be084] transition-all duration-300 hover:-translate-y-0.5 hover:border-[#25D366]/80 hover:bg-[#25D366]/15 hover:shadow-[0_6px_30px_rgba(37,211,102,0.2)] active:translate-y-0"
                    >
                      <WhatsAppIcon />
                      {overCap ? "Book a private appointment" : "Enquire on WhatsApp"}
                    </a>
                    <p className="text-center font-body text-[0.6rem] font-light tracking-[0.15em] text-[#4A6285]">
                      {overCap
                        ? "Stones of this calibre are sourced and certified in person — your composition reserves the appointment."
                        : "Sends your full composition to our atelier concierge — no obligation."}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* back / continue */}
          <div className="mt-10 flex items-center justify-between border-t border-[#1D3D6B] pt-6">
            <button
              type="button"
              onClick={() => setStep((s) => Math.max(0, s - 1))}
              disabled={step === 0}
              className="rounded-full border border-[#27497A] px-6 py-3 font-sans text-[0.62rem] uppercase tracking-[0.25em] text-[#A9B8D0] transition-all duration-300 hover:border-gold-500/40 hover:text-gold-200 disabled:pointer-events-none disabled:opacity-30 cursor-pointer"
            >
              ← Back
            </button>
            {step < STEPS.length - 1 && (
              <button
                type="button"
                onClick={goNext}
                className="rounded-full bg-gold-400 px-8 py-3 font-sans text-[0.62rem] font-semibold uppercase tracking-[0.25em] text-white shadow-[0_4px_20px_rgba(46,91,224,0.25)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-gold-300 active:translate-y-0 cursor-pointer"
              >
                Continue →
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ================== LEAD PROMPT (after the grace period) ================== */}
      {promptOpen && <LeadPrompt onCaptured={captureLead} />}

      {/* ======================= AI REVEAL OVERLAY ======================= */}
      {gen.status !== "idle" && (
        <div
          ref={overlayRef}
          role="dialog"
          aria-modal="true"
          aria-label="AI ring reveal"
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/85 p-5 backdrop-blur-xl"
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
              <p className="mt-2 font-sans text-[0.62rem] uppercase tracking-[0.3em] text-[#5E7495]">
                rendering your commission — up to ~20 seconds
              </p>
              <button
                type="button"
                onClick={closeOverlay}
                className="mt-10 font-sans text-[0.62rem] uppercase tracking-[0.25em] text-[#5E7495] underline-offset-4 transition-colors hover:text-gold-200 cursor-pointer"
              >
                Cancel
              </button>
            </div>
          )}

          {gen.status === "error" && (
            <div className="max-w-md rounded-3xl border border-[#27497A] bg-[#0D2347] p-10 text-center">
              <p className="font-serif text-2xl font-light text-gold-100">The atelier paused</p>
              <p className="mt-4 font-body text-xs font-light leading-relaxed text-[#A9B8D0]">{gen.message}</p>
              <div className="mt-8 flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={generate}
                  className="rounded-full bg-gold-400 px-7 py-3 font-sans text-[0.62rem] font-semibold uppercase tracking-[0.25em] text-white transition-colors hover:bg-gold-300 cursor-pointer"
                >
                  Try again
                </button>
                <button
                  type="button"
                  onClick={closeOverlay}
                  className="rounded-full border border-zinc-700 px-7 py-3 font-sans text-[0.62rem] uppercase tracking-[0.25em] text-[#C9D4E6] transition-colors hover:border-gold-400/50 hover:text-gold-200 cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          )}

          {gen.status === "done" && (
            <div className="flex max-h-full w-full max-w-3xl flex-col overflow-y-auto rounded-3xl border border-gold-500/20 bg-[#0D2347] shadow-[0_0_120px_rgba(46,91,224,0.15)]">
              <div className="flex items-center justify-between border-b border-[#1D3D6B] px-7 py-5">
                <div>
                  <p className="font-sans text-[0.6rem] uppercase tracking-[0.35em] text-gold-400">The Reveal</p>
                  <p className="mt-1 font-serif text-xl font-light tracking-wide text-gold-50">Your bespoke commission</p>
                </div>
                <button
                  type="button"
                  onClick={closeOverlay}
                  aria-label="Close"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-[#27497A] text-[#A9B8D0] transition-colors hover:border-gold-400/50 hover:text-gold-200 cursor-pointer"
                >
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" />
                  </svg>
                </button>
              </div>

              <div className="relative mx-7 mt-7 overflow-hidden rounded-2xl bg-white">
                {/* eslint-disable-next-line @next/next/no-img-element -- data: URL from the AI render */}
                <img src={gen.image} alt={`AI render of your configured ${piece.noun}`} className="mx-auto max-h-[52svh] w-auto object-contain" />
              </div>

              <p className="px-7 pt-4 text-center font-serif text-sm font-light italic tracking-wide text-gold-100/80">
                {config.piece === "bracelet"
                  ? `${braceletStyleById(config.braceletStyle).label.replace(/ Bracelet$/, "")} Bracelet · ${braceletStyleById(config.braceletStyle).stoneCount} × ${fmtCarat2(config.carat)} ct ${cutById(config.cut).label} ${gemById(config.gem).label} · ${metalById(config.metal).label} · ${fitById(config.fit).label} fit (${fitById(config.fit).size})`
                  : config.piece === "necklace"
                    ? `${config.carat.toFixed(1)} ct ${cutById(config.cut).label} ${gemById(config.gem).label} · ${metalById(config.metal).label} · ${pendantStyleById(config.pendantStyle).label} Pendant`
                    : `${config.carat.toFixed(1)} ct ${cutById(config.cut).label} ${gemById(config.gem).label} · ${metalById(config.metal).label} · ${settingById(config.setting).label} ${piece.label.replace(/^The /, "")}`}
                {config.engraving ? ` · “${config.engraving}”` : ""}
              </p>

              <div className="flex flex-col items-center justify-center gap-3 px-7 py-6 sm:flex-row">
                <a
                  href={gen.image}
                  download={`ceylon-gem-maison-bespoke-${config.piece}.png`}
                  className="w-full rounded-full bg-gold-400 px-7 py-3 text-center font-sans text-[0.62rem] font-semibold uppercase tracking-[0.25em] text-white transition-colors hover:bg-gold-300 sm:w-auto"
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
              <p className="pb-6 text-center font-body text-[0.55rem] font-light tracking-[0.2em] text-[#4A6285]">
                AI visualization — your final piece is hand-crafted and photographed at our atelier.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
