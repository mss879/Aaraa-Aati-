import "server-only";
import { createSupabasePublicClient } from "@/lib/supabase/public";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import type {
  ProductCategory,
  ProductImage,
  ProductWithImages,
} from "@/lib/supabase/types";

/**
 * Storefront reads. Everything here runs as the anonymous role, so RLS is what
 * guarantees only published rows are visible — the queries never have to filter
 * for status themselves (they do anyway, belt-and-suspenders).
 *
 * All of it degrades to empty results when Supabase isn't configured yet, so
 * /shop renders an honest empty state instead of throwing.
 */

const IMAGE_EMBED = "images:product_images(id, created_at, product_id, path, position, alt)";

const PRODUCT_SELECT = `*, category:product_categories(id, slug, name), ${IMAGE_EMBED}`;

const PRODUCT_SELECT_BY_CATEGORY = `*, category:product_categories!inner(id, slug, name), ${IMAGE_EMBED}`;

/** Gallery order is `position`, and position 0 is the card thumbnail. */
function withSortedImages<T extends { images?: ProductImage[] | null }>(row: T): T {
  const images = [...(row.images ?? [])].sort((a, b) => a.position - b.position);
  return { ...row, images };
}

export async function getShopCategories(): Promise<ProductCategory[]> {
  if (!hasSupabaseEnv) return [];
  const supabase = createSupabasePublicClient();
  const { data } = await supabase
    .from("product_categories")
    .select("*")
    .eq("active", true)
    .order("sort_index", { ascending: true })
    .order("name", { ascending: true });
  return (data as ProductCategory[]) ?? [];
}

/** Active products, optionally narrowed to one category slug. */
export async function getShopProducts(
  categorySlug?: string | null,
): Promise<ProductWithImages[]> {
  if (!hasSupabaseEnv) return [];
  const supabase = createSupabasePublicClient();

  // `!inner` makes the embedded category an inner join, so filtering on it drops
  // non-matching products instead of nulling the embed out. PostgREST filters on
  // the EMBED'S ALIAS (`category.slug`), not the underlying table name.
  const base = supabase
    .from("products")
    .select(categorySlug ? PRODUCT_SELECT_BY_CATEGORY : PRODUCT_SELECT)
    .eq("status", "active");

  const { data } = await (categorySlug ? base.eq("category.slug", categorySlug) : base)
    .order("featured", { ascending: false })
    .order("sort_index", { ascending: false });
  return ((data as ProductWithImages[]) ?? []).map(withSortedImages);
}

export async function getShopProduct(slug: string): Promise<ProductWithImages | null> {
  if (!hasSupabaseEnv) return null;
  const supabase = createSupabasePublicClient();
  const { data } = await supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .eq("slug", slug)
    .eq("status", "active")
    .maybeSingle();
  return data ? withSortedImages(data as ProductWithImages) : null;
}

/** Slugs of every live piece — for the sitemap and static params. */
export async function getShopProductSlugs(): Promise<{ slug: string; updated_at: string }[]> {
  if (!hasSupabaseEnv) return [];
  const supabase = createSupabasePublicClient();
  const { data } = await supabase
    .from("products")
    .select("slug, updated_at")
    .eq("status", "active");
  return (data as { slug: string; updated_at: string }[]) ?? [];
}
