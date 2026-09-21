import { getCraftingPrices } from "@/lib/crafting-prices";
import {
  PRICE_FIELD_BY_KEY,
  priceKey,
  type DesignVariable,
  type PriceFieldDef,
  type PriceGroupId,
  type PriceTable,
} from "@/lib/pricing";
import { DESIGNS, GEMS, METALS, type PieceId } from "@/lib/ring-options";
import { hasServiceRole } from "@/lib/supabase/env";
import ConfigNotice from "@/app/admin/_components/ConfigNotice";
import CraftingPricesEditor, {
  type EditorField,
  type EditorSection,
} from "@/app/admin/_components/CraftingPricesEditor";
import { saveCraftingPrices } from "@/app/admin/_actions";

export const dynamic = "force-dynamic";

/**
 * Crafting Prices — the client's cost sheet for every atelier design.
 *
 * A Server Component that gathers the figures and hands them to the editor.
 * These are COST prices and mark-ups, which is why this is the only page that
 * ever puts them in a browser: it sits behind the admin sign-in, while the
 * atelier is handed nothing but finished retail prices (lib/pricing.ts).
 */

const SECTION_COPY: Record<PieceId, { title: string; blurb: string }> = {
  ring: {
    title: "Ring designs",
    blurb:
      "Gold used, labour and mark-up for each ring design. For halo, pavé and other designs set with small accent stones, include those stones in the labour figure.",
  },
  necklace: {
    title: "Pendant designs",
    blurb: "The gold used includes the chain.",
  },
  bracelet: {
    title: "Bracelet designs",
    blurb:
      "The gold used is the whole bracelet, and every stone is charged at the full per-carat price. Customers are never shown a bracelet price — bracelets are priced by consultation — but this estimate is recorded on each commission for the concierge.",
  },
};

/** "18K Yellow Gold", "Platinum 950": karat first only when it is a karat. */
const metalName = (m: (typeof METALS)[number]) =>
  /^\d+K$/.test(m.karat) ? `${m.karat} ${m.label}` : `${m.label} ${m.karat}`;

export default async function CraftingPricesPage() {
  const saved: PriceTable = await getCraftingPrices();

  const field = (group: PriceGroupId, optionId: string, name: string): EditorField => {
    const key = priceKey(group, optionId, name);
    const def: PriceFieldDef = PRICE_FIELD_BY_KEY.get(key)!;
    return {
      key,
      defaultValue: def.defaultValue,
      saved: saved[key] ?? null,
      min: def.min,
      max: def.max,
      step: def.step,
    };
  };
  const designField = (designKey: string, v: DesignVariable) => field("design", designKey, v);

  const sections: EditorSection[] = (["ring", "necklace", "bracelet"] as const).map((piece) => ({
    piece,
    ...SECTION_COPY[piece],
    designs: DESIGNS.filter((d) => d.piece === piece).map((d) => ({
      key: d.key,
      label: d.label,
      stoneCount: d.stoneCount,
      grams: designField(d.key, "metalGrams"),
      labour: designField(d.key, "labour"),
      markup: designField(d.key, "markupPct"),
    })),
  }));

  return (
    <div className="mx-auto max-w-6xl">
      <header className="mb-8">
        <h1 className="font-serif text-3xl font-light tracking-wide text-[var(--adm-ink)]">
          Crafting Prices
        </h1>
        <p className="mt-1.5 max-w-2xl font-body text-sm leading-relaxed text-[var(--adm-ink-soft)]">
          The figures behind every quotation in the bespoke atelier, worked out the same way as
          your cost sheet. Change one here and the next visitor is quoted the new price — no
          deploy.
        </p>
      </header>

      {/* Reads now use the service role (costs are no longer public), so that is
          the key whose absence means these are only the starting values. */}
      {!hasServiceRole && <ConfigNotice />}

      <CraftingPricesEditor
        metals={METALS.map((m) => ({
          id: m.id,
          name: metalName(m),
          field: field("metal", m.id, "costPerGram"),
        }))}
        gems={GEMS.map((g) => ({
          id: g.id,
          name: g.label,
          hint: g.origin,
          field: field("gem", g.id, "costPerCarat"),
        }))}
        sections={sections}
        action={saveCraftingPrices}
      />
    </div>
  );
}
