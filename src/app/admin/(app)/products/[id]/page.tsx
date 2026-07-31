import { notFound } from "next/navigation";
import { getAdminProduct, getProductCategories } from "@/lib/admin/data";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { formatDate } from "@/lib/leads";
import ProductForm from "@/app/admin/_components/ProductForm";
import ConfigNotice from "@/app/admin/_components/ConfigNotice";

export const dynamic = "force-dynamic";

// Next 16: params is a Promise.
export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [product, categories] = await Promise.all([
    getAdminProduct(id),
    getProductCategories(),
  ]);

  if (!product && hasSupabaseEnv) notFound();

  return (
    <div className="mx-auto max-w-4xl">
      <header className="mb-8">
        <h1 className="font-serif text-3xl font-light tracking-wide text-[var(--adm-ink)]">
          {product?.title ?? "Edit piece"}
        </h1>
        {product && (
          <p className="mt-1.5 font-body text-sm text-[var(--adm-ink-soft)]">
            Added {formatDate(product.created_at)} · last edited {formatDate(product.updated_at)}
          </p>
        )}
      </header>
      {!hasSupabaseEnv && <ConfigNotice />}
      <ProductForm product={product} categories={categories} />
    </div>
  );
}
