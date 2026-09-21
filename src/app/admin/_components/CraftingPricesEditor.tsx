"use client";

import { useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { markupMultiplier, materialsCost, roundQuote, sellingPrice } from "@/lib/cost-formula";

/**
 * The atelier's cost sheet, as an editable form.
 *
 * The client's complaint about the old page was that its numbers could not be
 * read: a "setting multiplier" of 0.9 does not tell anyone what a ring will
 * cost. So every design row here carries a live price preview, worked through
 * the client's own formula from whatever is currently typed, with the sum spelt
 * out beneath it — change the gold price or a mark-up and watch every quote it
 * touches move before saving anything.
 *
 * Only the admin ever loads this. The cost figures arrive as props from the
 * server page; the atelier's browser never sees them.
 */

export type EditorField = {
  key: string;
  defaultValue: number;
  saved: number | null;
  min: number;
  max: number;
  step: number;
};

export type EditorMaterial = { id: string; name: string; hint?: string; field: EditorField };

export type EditorDesign = {
  key: string;
  label: string;
  stoneCount: number;
  grams: EditorField;
  labour: EditorField;
  markup: EditorField;
};

export type EditorSection = {
  piece: "ring" | "necklace" | "bracelet";
  title: string;
  blurb: string;
  designs: EditorDesign[];
};

const money = (n: number) =>
  Number.isFinite(n) ? `$${Math.round(n).toLocaleString("en-SG")}` : "—";

/** "3" → "×3", "2.85" → "×2.85": the sheet's own way of writing a mark-up. */
const times = (pct: number) =>
  Number.isFinite(pct) ? `×${Number(markupMultiplier(pct).toFixed(2))}` : "—";

export default function CraftingPricesEditor({
  metals,
  gems,
  sections,
  action,
}: {
  metals: EditorMaterial[];
  gems: EditorMaterial[];
  sections: EditorSection[];
  action: (formData: FormData) => Promise<void>;
}) {
  const allFields: EditorField[] = [
    ...metals.map((m) => m.field),
    ...gems.map((g) => g.field),
    ...sections.flatMap((s) => s.designs.flatMap((d) => [d.grams, d.labour, d.markup])),
  ];

  const [values, setValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(allFields.map((f) => [f.key, String(f.saved ?? f.defaultValue)])),
  );
  const setValue = (key: string, v: string) => setValues((prev) => ({ ...prev, [key]: v }));

  /* Blank means "use the starting value" — it is saved as no row at all. */
  const valueOf = (f: EditorField): number => {
    const raw = (values[f.key] ?? "").trim();
    return raw === "" ? f.defaultValue : Number(raw);
  };
  const isInvalid = (f: EditorField): boolean => {
    const raw = (values[f.key] ?? "").trim();
    if (raw === "") return false;
    const n = Number(raw);
    return !Number.isFinite(n) || n < f.min || n > f.max;
  };
  const invalidCount = allFields.filter(isInvalid).length;

  /* What the preview column prices each design with. Opens on the sheet's own
     example — 18K yellow gold, a sapphire, 1.5 ct — so the solitaire row reads
     $6,750 exactly as the client's spreadsheet does. */
  const [previewMetal, setPreviewMetal] = useState(
    metals.find((m) => m.id === "yellow-gold")?.id ?? metals[0]?.id,
  );
  const [previewGem, setPreviewGem] = useState(
    gems.find((g) => g.id === "sapphire")?.id ?? gems[0]?.id,
  );
  const [previewCarat, setPreviewCarat] = useState("1.5");
  const [previewCaratEach, setPreviewCaratEach] = useState("0.3");
  const [markupForAll, setMarkupForAll] = useState("");

  const metalField = metals.find((m) => m.id === previewMetal)?.field;
  const gemField = gems.find((g) => g.id === previewGem)?.field;

  const priceRow = (d: EditorDesign, piece: EditorSection["piece"]) => {
    const inputs = {
      metalGrams: valueOf(d.grams),
      metalCostPerGram: metalField ? valueOf(metalField) : NaN,
      carat: Number(piece === "bracelet" ? previewCaratEach : previewCarat),
      stoneCount: d.stoneCount,
      stoneCostPerCarat: gemField ? valueOf(gemField) : NaN,
      labour: valueOf(d.labour),
      markupPct: valueOf(d.markup),
    };
    return {
      price: roundQuote(sellingPrice(inputs)),
      materials: materialsCost(inputs),
      labour: inputs.labour,
      markupPct: inputs.markupPct,
    };
  };

  const applyMarkupToAll = () => {
    const raw = markupForAll.trim();
    if (raw === "") return;
    setValues((prev) => {
      const next = { ...prev };
      for (const s of sections) for (const d of s.designs) next[d.markup.key] = raw;
      return next;
    });
  };

  /* Enter in any input submits the enclosing form — here that would SAVE the
     prices when someone only meant to apply a mark-up or change the preview. So
     these helper fields swallow Enter (and the mark-up box treats it as Apply). */
  const keepEnter = (onEnter?: () => void) => (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== "Enter") return;
    e.preventDefault();
    onEnter?.();
  };

  /* noValidate: the browser's step rules would refuse a perfectly good 233.33%
     mark-up with a popup of its own. Range is checked here (with the save button
     held until it passes) and again in the server action. */
  return (
    <form action={action} noValidate>
      {/* ------------------------------------------------ the formula, plainly */}
      <section className="adm-card p-6">
        <h2 className="font-serif text-xl font-light tracking-wide text-[var(--adm-ink)]">
          How a quote is worked out
        </h2>
        <div className="mt-4 grid gap-2 font-body text-[0.9rem] leading-relaxed text-[var(--adm-ink-soft)]">
          <p>
            <span className="text-[var(--adm-ink)]">Gold used</span> × gold price per gram
            {"  +  "}
            <span className="text-[var(--adm-ink)]">carat</span> × stone price per carat
            {"  =  "}
            <span className="text-[var(--adm-ink)]">materials</span>
          </p>
          <p>
            Materials × <span className="text-[var(--adm-ink)]">mark-up</span>
            {"  +  "}
            <span className="text-[var(--adm-ink)]">labour</span>
            {"  =  "}
            <span className="text-[var(--adm-ink)]">selling price</span>
          </p>
        </div>
        <div className="adm-inset mt-4 rounded-xl px-4 py-3 font-body text-[0.82rem] leading-relaxed text-[var(--adm-ink-soft)]">
          From your cost sheet: (2 g × $200) + (1.5 ct × $1,200) = $2,200 materials × 3 (a 200%
          mark-up) = $6,600, + $150 labour = <span className="text-[var(--adm-ink)]">$6,750</span>.
        </div>
        <p className="mt-4 max-w-3xl font-body text-[0.82rem] leading-relaxed text-[var(--adm-muted)]">
          The customer chooses the gold, the gemstone and the carat in the atelier. You set what
          those materials cost you, and for each design its gold weight, labour and mark-up.
          Labour is added after the mark-up, exactly as on the sheet. None of these figures are
          shown to customers — they only ever see the finished price.
        </p>
      </section>

      {/* --------------------------------------------------------- materials */}
      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        <MaterialCard
          title="Gold & platinum"
          blurb="What each metal costs you per gram."
          unit="per gram"
          items={metals}
          values={values}
          setValue={setValue}
          isInvalid={isInvalid}
        />
        <MaterialCard
          title="Gemstones"
          blurb="What each stone costs you per carat. On bracelets it is charged for every stone in the design."
          unit="per carat"
          items={gems}
          values={values}
          setValue={setValue}
          isInvalid={isInvalid}
        />
      </div>

      {/* ------------------------------------------------ preview + bulk mark-up */}
      <section className="adm-card mt-8 p-6">
        <div className="flex flex-wrap items-end gap-x-6 gap-y-4">
          <div>
            <p className="adm-label">Preview prices with</p>
            <div className="mt-1.5 flex flex-wrap gap-2">
              <select
                aria-label="Preview metal"
                value={previewMetal}
                onChange={(e) => setPreviewMetal(e.target.value)}
                className="adm-field w-auto"
              >
                {metals.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
              <select
                aria-label="Preview gemstone"
                value={previewGem}
                onChange={(e) => setPreviewGem(e.target.value)}
                className="adm-field w-auto"
              >
                {gems.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <label className="block">
            <span className="adm-label">Carat · rings &amp; pendants</span>
            <input
              type="number"
              min="0"
              step="0.05"
              value={previewCarat}
              onChange={(e) => setPreviewCarat(e.target.value)}
              onKeyDown={keepEnter()}
              className="adm-field mt-1.5 w-28"
            />
          </label>
          <label className="block">
            <span className="adm-label">Carat each · bracelets</span>
            <input
              type="number"
              min="0"
              step="0.05"
              value={previewCaratEach}
              onChange={(e) => setPreviewCaratEach(e.target.value)}
              onKeyDown={keepEnter()}
              className="adm-field mt-1.5 w-28"
            />
          </label>

          <div className="ml-auto">
            <p className="adm-label">Set every design&rsquo;s mark-up</p>
            <div className="mt-1.5 flex gap-2">
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  max="1000"
                  step="0.1"
                  placeholder="200"
                  aria-label="Mark-up for every design, in percent"
                  value={markupForAll}
                  onChange={(e) => setMarkupForAll(e.target.value)}
                  onKeyDown={keepEnter(applyMarkupToAll)}
                  className="adm-field w-28 pr-8"
                />
                <Suffix>%</Suffix>
              </div>
              <button type="button" onClick={applyMarkupToAll} className="adm-btn-ghost">
                Apply to all
              </button>
            </div>
          </div>
        </div>
        <p className="mt-3 font-body text-[0.75rem] text-[var(--adm-muted)]">
          The preview only changes what is shown below — it is not saved.
          {markupForAll.trim() !== "" &&
            Number.isFinite(Number(markupForAll)) &&
            ` ${markupForAll}% is ${times(Number(markupForAll))}.`}
        </p>
      </section>

      {/* ----------------------------------------------------------- designs */}
      <div className="mt-8 space-y-8">
        {sections.map((section) => (
          <section key={section.piece} className="adm-card p-6">
            <h2 className="font-serif text-xl font-light tracking-wide text-[var(--adm-ink)]">
              {section.title}
            </h2>
            <p className="mt-1.5 max-w-3xl font-body text-[0.82rem] leading-relaxed text-[var(--adm-muted)]">
              {section.blurb}
            </p>

            <div className="mt-5 overflow-x-auto">
              <table className="w-full min-w-[720px] border-collapse">
                <thead>
                  <tr className="border-b border-[var(--adm-line)] text-left">
                    <th className="adm-label pb-2.5 pr-4 font-semibold">Design</th>
                    <th className="adm-label pb-2.5 pr-4 font-semibold">Gold used</th>
                    <th className="adm-label pb-2.5 pr-4 font-semibold">Labour</th>
                    <th className="adm-label pb-2.5 pr-4 font-semibold">Mark-up</th>
                    <th className="adm-label pb-2.5 text-right font-semibold">Price preview</th>
                  </tr>
                </thead>
                <tbody>
                  {section.designs.map((d) => {
                    const row = priceRow(d, section.piece);
                    return (
                      <tr key={d.key} className="border-b border-[var(--adm-line)] align-top last:border-0">
                        <td className="py-3 pr-4">
                          <p className="font-body text-[0.92rem] text-[var(--adm-ink)]">{d.label}</p>
                          {d.stoneCount > 1 && (
                            <p className="mt-0.5 font-body text-[0.72rem] text-[var(--adm-muted)]">
                              {d.stoneCount} stones
                            </p>
                          )}
                        </td>
                        <td className="w-32 py-3 pr-4">
                          <NumberInput field={d.grams} suffix="g" label={`${d.label} gold used, grams`} values={values} setValue={setValue} invalid={isInvalid(d.grams)} />
                        </td>
                        <td className="w-36 py-3 pr-4">
                          <NumberInput field={d.labour} prefix="$" label={`${d.label} labour`} values={values} setValue={setValue} invalid={isInvalid(d.labour)} />
                        </td>
                        <td className="w-32 py-3 pr-4">
                          <NumberInput field={d.markup} suffix="%" label={`${d.label} mark-up, percent`} values={values} setValue={setValue} invalid={isInvalid(d.markup)} />
                          <p className="mt-1 font-body text-[0.7rem] text-[var(--adm-muted)]">
                            {times(valueOf(d.markup))}
                          </p>
                        </td>
                        <td className="py-3 text-right">
                          <p className="font-serif text-lg font-light text-[var(--adm-ink)]">
                            {money(row.price)}
                          </p>
                          <p className="mt-0.5 whitespace-nowrap font-body text-[0.7rem] text-[var(--adm-muted)]">
                            {money(row.materials)} {times(row.markupPct)} + {money(row.labour)}
                          </p>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        ))}
      </div>

      {/* The table is long; the save control follows the client down it. */}
      <div className="sticky bottom-0 z-10 mt-8 border-t border-[var(--adm-line)] bg-[var(--adm-canvas)]/95 py-4 backdrop-blur">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <p className="font-body text-[0.8rem] text-[var(--adm-muted)]">
            {invalidCount > 0 ? (
              <span className="text-[var(--adm-danger)]">
                {invalidCount} {invalidCount === 1 ? "figure is" : "figures are"} out of range —
                fix {invalidCount === 1 ? "it" : "them"} to save.
              </span>
            ) : (
              "Quotes are rounded to the nearest $50. Leave a field blank to use its starting value."
            )}
          </p>
          <SaveButton disabled={invalidCount > 0} />
        </div>
      </div>
    </form>
  );
}

/* ---------------------------------------------------------------- pieces */

function Suffix({ children }: { children: React.ReactNode }) {
  return (
    <span
      aria-hidden
      className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 font-body text-sm text-[var(--adm-muted)]"
    >
      {children}
    </span>
  );
}

function NumberInput({
  field,
  prefix,
  suffix,
  label,
  values,
  setValue,
  invalid,
}: {
  field: EditorField;
  prefix?: string;
  suffix?: string;
  label: string;
  values: Record<string, string>;
  setValue: (key: string, v: string) => void;
  invalid: boolean;
}) {
  const current = (values[field.key] ?? "").trim();
  const edited = current !== "" && Number(current) !== field.defaultValue;
  return (
    <div>
      <div className="relative">
        {prefix && (
          <span
            aria-hidden
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 font-body text-sm text-[var(--adm-muted)]"
          >
            {prefix}
          </span>
        )}
        <input
          id={field.key}
          name={field.key}
          type="number"
          inputMode="decimal"
          min={field.min}
          max={field.max}
          step={field.step}
          aria-label={label}
          aria-invalid={invalid || undefined}
          placeholder={String(field.defaultValue)}
          title={`Starting value ${field.defaultValue}. Leave blank to use it.`}
          value={values[field.key] ?? ""}
          onChange={(e) => setValue(field.key, e.target.value)}
          className={`adm-field ${prefix ? "pl-7" : ""} ${suffix ? "pr-8" : ""} ${
            invalid ? "!border-[var(--adm-danger)]" : ""
          }`}
        />
        {suffix && <Suffix>{suffix}</Suffix>}
      </div>
      {invalid ? (
        <p className="mt-1 font-body text-[0.7rem] text-[var(--adm-danger)]">
          {field.min}–{field.max.toLocaleString("en-SG")} only
        </p>
      ) : (
        edited && (
          <p className="mt-1 font-body text-[0.7rem] text-[var(--adm-muted)]">
            default {field.defaultValue}
          </p>
        )
      )}
    </div>
  );
}

function MaterialCard({
  title,
  blurb,
  unit,
  items,
  values,
  setValue,
  isInvalid,
}: {
  title: string;
  blurb: string;
  unit: string;
  items: EditorMaterial[];
  values: Record<string, string>;
  setValue: (key: string, v: string) => void;
  isInvalid: (f: EditorField) => boolean;
}) {
  return (
    <section className="adm-card p-6">
      <h2 className="font-serif text-xl font-light tracking-wide text-[var(--adm-ink)]">{title}</h2>
      <p className="mt-1.5 font-body text-[0.82rem] leading-relaxed text-[var(--adm-muted)]">{blurb}</p>
      <div className="mt-5 space-y-3">
        {items.map((m) => (
          <div key={m.id} className="grid grid-cols-[1fr_9.5rem] items-start gap-4">
            <div className="pt-2">
              <p className="font-body text-[0.92rem] text-[var(--adm-ink)]">{m.name}</p>
              {m.hint && (
                <p className="font-body text-[0.72rem] text-[var(--adm-muted)]">{m.hint}</p>
              )}
            </div>
            <div>
              <NumberInput
                field={m.field}
                prefix="$"
                label={`${m.name} cost ${unit}`}
                values={values}
                setValue={setValue}
                invalid={isInvalid(m.field)}
              />
              <p className="mt-1 text-right font-body text-[0.68rem] text-[var(--adm-muted)]">{unit}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/** Pending state from the form itself, and a brief "Saved" once it lands. */
function SaveButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();
  const [saved, setSaved] = useState(false);
  const wasPending = useRef(false);

  useEffect(() => {
    if (wasPending.current && !pending) {
      setSaved(true);
      const id = setTimeout(() => setSaved(false), 2500);
      wasPending.current = pending;
      return () => clearTimeout(id);
    }
    wasPending.current = pending;
  }, [pending]);

  return (
    <button type="submit" disabled={disabled || pending} className="adm-btn disabled:cursor-not-allowed disabled:opacity-60">
      {pending ? "Saving…" : saved ? "Saved" : "Save prices"}
    </button>
  );
}
