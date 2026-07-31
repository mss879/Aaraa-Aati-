import Link from "next/link";
import { getAdminProducts } from "@/lib/admin/data";
import { hasSupabaseEnv, productImageUrl } from "@/lib/supabase/env";
import { PRODUCT_STATUSES, formatMoney } from "@/lib/shop";
import ConfigNotice from "@/app/admin/_components/ConfigNotice";

export const dynamic = "force-dynamic";

export default async function ProductsPage() {
  const products = await getAdminProducts();
  const statusMeta = (id: string) => PRODUCT_STATUSES.find((s) => s.id === id);

  return (
    <div className="mx-auto max-w-6xl">
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-light tracking-wide text-[var(--adm-ink)]">Products</h1>
          <p className="mt-1.5 font-body text-sm text-[var(--adm-ink-soft)]">
            Everything the shop can sell. Drafts stay invisible until you set them live.
          </p>
        </div>
        <Link
          href="/admin/products/new"
          className="adm-btn"
        >
          + New piece
        </Link>
      </header>

      {!hasSupabaseEnv && <ConfigNotice />}

      {products.length === 0 ? (
        <div className="adm-empty p-12 text-center">
          <p className="font-serif text-xl font-light text-[var(--adm-ink)]">No pieces yet</p>
          <p className="mx-auto mt-2 max-w-md font-body text-sm leading-relaxed text-[var(--adm-muted)]">
            Add a piece with up to five photographs, a title and a description. Set it live and it
            appears in the shop straight away.
          </p>
          <Link
            href="/admin/products/new"
            className="mt-6 inline-block adm-btn"
          >
            + New piece
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => {
            const cover = productImageUrl(product.images[0]?.path);
            const meta = statusMeta(product.status);
            return (
              <Link
                key={product.id}
                href={`/admin/products/${product.id}`}
                className="group overflow-hidden adm-card transition-colors hover:border-[var(--adm-line-strong)]"
              >
                <div className="aspect-[4/3] bg-[var(--adm-inset)]">
                  {cover ? (
                    // eslint-disable-next-line @next/next/no-img-element -- admin thumbnail, straight from the bucket CDN
                    <img
                      src={cover}
                      alt=""
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center font-sans text-[0.6rem] uppercase tracking-[0.2em] text-[var(--adm-faint)]">
                      No photograph
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <h2 className="font-serif text-lg font-light leading-snug text-[var(--adm-ink)]">
                      {product.title}
                    </h2>
                    <span
                      className="mt-1 shrink-0 rounded-full px-2.5 py-0.5 font-sans text-[0.55rem] uppercase tracking-[0.16em]"
                      style={{
                        color: meta?.accent,
                        backgroundColor: `${meta?.accent}1f`,
                      }}
                    >
                      {meta?.label}
                    </span>
                  </div>
                  <p className="mt-1.5 font-body text-[0.8rem] text-[var(--adm-accent-strong)]">
                    {formatMoney(product.price, product.currency)}
                  </p>
                  <p className="mt-1 font-sans text-[0.58rem] uppercase tracking-[0.18em] text-[var(--adm-muted)]">
                    {product.category?.name ?? "Uncategorised"} · {product.images.length} photo
                    {product.images.length === 1 ? "" : "s"}
                    {!product.in_stock && " · reserved"}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
