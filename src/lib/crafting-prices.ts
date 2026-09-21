import "server-only";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { hasServiceRole } from "@/lib/supabase/env";
import {
  PRICE_FIELD_BY_KEY,
  buildQuoteTable,
  priceKey,
  type PriceGroupId,
  type PriceTable,
} from "@/lib/pricing";
import type { QuoteTable } from "@/lib/ring-options";

/**
 * Reads the admin-set atelier cost figures.
 *
 * With the service role, not the anonymous key. These used to be read as anon
 * because they were retail-ish numbers quoted in the browser anyway; since the
 * move to the client's cost sheet they are COST prices and mark-ups, and
 * migration 0017 withdrew the public read accordingly. The browser now gets
 * getQuoteTable()'s retail figures and nothing else.
 *
 * Everything here degrades to an empty table rather than throwing. An empty
 * table is not an error state: resolveCosts() then uses the starting values in
 * lib/pricing.ts, so the atelier keeps quoting when Supabase is unconfigured or
 * briefly unreachable.
 */

type Row = { group_id: string; option_id: string; field: string; value: number | string };

export async function getCraftingPrices(): Promise<PriceTable> {
  if (!hasServiceRole) return {};

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("crafting_prices")
    .select("group_id, option_id, field, value");

  if (error || !data) return {};

  const table: PriceTable = {};
  for (const row of data as Row[]) {
    const key = priceKey(row.group_id as PriceGroupId, row.option_id, row.field);
    // Ignore rows that no longer correspond to a live figure — the old
    // multiplier rows, or a retired design's — so nothing stale can shadow a
    // current price. Postgres `numeric` arrives as a string over PostgREST.
    if (!PRICE_FIELD_BY_KEY.has(key)) continue;
    const value = typeof row.value === "string" ? Number(row.value) : row.value;
    if (Number.isFinite(value)) table[key] = value;
  }
  return table;
}

/** The retail price list for the atelier and every server-side estimate. */
export async function getQuoteTable(): Promise<QuoteTable> {
  return buildQuoteTable(await getCraftingPrices());
}
