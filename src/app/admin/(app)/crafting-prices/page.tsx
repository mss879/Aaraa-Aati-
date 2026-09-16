import { getCraftingPrices } from "@/lib/crafting-prices";
import { PRICE_GROUPS, formatPriceValue } from "@/lib/pricing";
import { priceKey } from "@/lib/ring-options";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import ConfigNotice from "@/app/admin/_components/ConfigNotice";
import { saveCraftingPrices } from "@/app/admin/_actions";

export const dynamic = "force-dynamic";

/**
 * Crafting Prices — every number the atelier's live quotation is built from.
 *
 * One <form> across all six groups rather than a form per row: the client
 * repricing a collection changes a dozen numbers in one sitting, and a save
 * button per input would mean a dozen round trips. Each input is named with its
 * `group:option:field` key, which is exactly what the price table is keyed by,
 * so the action can validate against the same allowlist the quote engine reads.
 *
 * Inputs are uncontrolled and carry `defaultValue`, so this stays a Server
 * Component — no client bundle for a page that is a grid of number fields.
 */
export default async function CraftingPricesPage() {
  const saved = await getCraftingPrices();

  return (
    <div className="mx-auto max-w-5xl">
      <header className="mb-8">
        <h1 className="font-serif text-3xl font-light tracking-wide text-[var(--adm-ink)]">
          Crafting Prices
        </h1>
        <p className="mt-1.5 max-w-2xl font-body text-sm leading-relaxed text-[var(--adm-ink-soft)]">
          The figures behind every quotation in the bespoke atelier. Change one here and the
          next visitor is quoted the new price — no deploy. Leave a field empty to fall back
          to the built-in default shown beneath it.
        </p>
      </header>

      {!hasSupabaseEnv && <ConfigNotice />}

      <form action={saveCraftingPrices}>
        <div className="space-y-10">
          {PRICE_GROUPS.map((group) => (
            <section key={group.id} className="adm-card p-6">
              <div className="mb-5">
                <h2 className="font-serif text-xl font-light tracking-wide text-[var(--adm-ink)]">
                  {group.label}
                </h2>
                <p className="mt-1.5 max-w-2xl font-body text-[0.82rem] leading-relaxed text-[var(--adm-muted)]">
                  {group.blurb}
                </p>
              </div>

              <div className="grid gap-x-6 gap-y-5 sm:grid-cols-2 lg:grid-cols-3">
                {group.fields.map((def) => {
                  const key = priceKey(def.group, def.optionId, def.field);
                  const current = saved[key];
                  const isDefault = current === undefined;
                  return (
                    <div key={key}>
                      <label htmlFor={key} className="adm-label">
                        {def.optionLabel}
                        {group.fields.filter((f) => f.optionId === def.optionId).length > 1 && (
                          <span className="text-[var(--adm-muted)]"> · {def.fieldLabel}</span>
                        )}
                      </label>
                      {def.optionHint && (
                        <p className="mt-0.5 font-body text-[0.72rem] leading-snug text-[var(--adm-muted)]">
                          {def.optionHint}
                        </p>
                      )}
                      <div className="relative mt-1.5">
                        {def.kind === "currency" && (
                          <span
                            aria-hidden
                            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 font-body text-sm text-[var(--adm-muted)]"
                          >
                            $
                          </span>
                        )}
                        <input
                          id={key}
                          name={key}
                          type="number"
                          min="0"
                          // Currency is quoted in whole dollars; factors are fine
                          // multipliers where 0.05 is a meaningful difference.
                          step={def.kind === "currency" ? "1" : "0.01"}
                          inputMode="decimal"
                          defaultValue={current ?? def.defaultValue}
                          className={`adm-field ${def.kind === "currency" ? "pl-7" : ""}`}
                        />
                      </div>
                      <p className="mt-1 font-body text-[0.7rem] text-[var(--adm-muted)]">
                        Default {formatPriceValue(def.defaultValue, def.kind)}
                        {!isDefault && current !== def.defaultValue && (
                          <span className="text-[var(--adm-ink-soft)]"> · edited</span>
                        )}
                      </p>
                    </div>
                  );
                })}
              </div>
            </section>
          ))}
        </div>

        {/* The grid is long; the save control follows the client down it. */}
        <div className="sticky bottom-0 z-10 mt-8 border-t border-[var(--adm-line)] bg-[var(--adm-canvas)]/95 py-4 backdrop-blur">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <p className="font-body text-[0.8rem] text-[var(--adm-muted)]">
              Quotes are rounded to the nearest $50 when shown to the client.
            </p>
            <button type="submit" className="adm-btn">
              Save prices
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
