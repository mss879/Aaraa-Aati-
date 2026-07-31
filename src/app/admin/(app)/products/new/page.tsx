import { getProductCategories } from "@/lib/admin/data";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import ProductForm from "@/app/admin/_components/ProductForm";
import ConfigNotice from "@/app/admin/_components/ConfigNotice";

export const dynamic = "force-dynamic";

export default async function NewProductPage() {
  const categories = await getProductCategories();
  return (
    <div className="mx-auto max-w-4xl">
      <header className="mb-8">
        <h1 className="font-serif text-3xl font-light tracking-wide text-[var(--adm-ink)]">New piece</h1>
        <p className="mt-1.5 font-body text-sm text-[var(--adm-ink-soft)]">
          Photographs, a title and a description. It stays a draft until you set it live.
        </p>
      </header>
      {!hasSupabaseEnv && <ConfigNotice />}
      <ProductForm product={null} categories={categories} />
    </div>
  );
}
