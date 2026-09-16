import "server-only";
import { createSupabasePublicClient } from "@/lib/supabase/public";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { priceKey, type PriceGroupId, type PriceTable } from "@/lib/ring-options";
import { PRICE_FIELD_BY_KEY } from "@/lib/pricing";

/**
 * Reads the admin-set atelier prices.
 *
 * Runs as the anonymous role — these numbers are quoted in the visitor's
 * browser, so they are public by nature and RLS allows anon to select them.
 *
 * Everything here degrades to an empty table rather than throwing. An empty
 * table is not an error state: estimatePrice() then falls back to the values
 * compiled into ring-options.ts, so the atelier keeps quoting correctly when
 * Supabase isn't configured or is briefly unreachable.
 */

type Row = { group_id: string; option_id: string; field: string; value: number | string };

export async function getCraftingPrices(): Promise<PriceTable> {
  if (!hasSupabaseEnv) return {};

  const supabase = createSupabasePublicClient();
  const { data, error } = await supabase
    .from("crafting_prices")
    .select("group_id, option_id, field, value");

  if (error || !data) return {};

  const table: PriceTable = {};
  for (const row of data as Row[]) {
    const key = priceKey(row.group_id as PriceGroupId, row.option_id, row.field);
    // Ignore rows that no longer correspond to a live option — a gem that was
    // removed from the catalogue leaves its row behind, and it must not be able
    // to shadow anything. Postgres `numeric` arrives as a string over PostgREST.
    if (!PRICE_FIELD_BY_KEY.has(key)) continue;
    const value = typeof row.value === "string" ? Number(row.value) : row.value;
    if (Number.isFinite(value)) table[key] = value;
  }
  return table;
}
