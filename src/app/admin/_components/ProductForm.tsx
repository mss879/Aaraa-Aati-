"use client";

import { useActionState, useRef, useState } from "react";
import Link from "next/link";
import { deleteProduct, saveProduct, type ProductFormState } from "@/app/admin/_actions";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { PRODUCT_IMAGES_BUCKET, productImageUrl } from "@/lib/supabase/env";
import { MAX_PRODUCT_IMAGES, PRODUCT_STATUSES, slugify } from "@/lib/shop";
import type { ProductCategory, ProductWithImages } from "@/lib/supabase/types";

/**
 * Create / edit a piece.
 *
 * Photographs are uploaded straight from this browser session to the
 * product-images bucket (the admin is authenticated, so the bucket's insert
 * policy authorises it) and the form posts only their object PATHS. That is
 * deliberate: Server Actions cap request bodies at 1MB, which a single piece of
 * jewellery photography blows past on its own.
 */

const ACCEPT = "image/jpeg,image/png,image/webp,image/avif";
const MAX_BYTES = 10 * 1024 * 1024;

type GalleryImage = { path: string; alt: string | null };

const field =
  "mt-2 w-full rounded-xl border border-[var(--adm-line)] bg-[var(--adm-inset)] px-3.5 py-2.5 font-body text-sm text-[var(--adm-ink)] outline-none transition-colors placeholder:text-[var(--adm-faint)] focus:border-[var(--adm-accent)]";
const label = "adm-label";

export default function ProductForm({
  product,
  categories,
}: {
  product: ProductWithImages | null;
  categories: ProductCategory[];
}) {
  const [state, formAction, pending] = useActionState<ProductFormState, FormData>(
    saveProduct,
    {},
  );

  const savedPaths = useRef(new Set((product?.images ?? []).map((i) => i.path)));
  const supabase = useRef(createSupabaseBrowserClient());

  const [images, setImages] = useState<GalleryImage[]>(
    (product?.images ?? []).map((i) => ({ path: i.path, alt: i.alt })),
  );
  const [title, setTitle] = useState(product?.title ?? "");
  const [slug, setSlug] = useState(product?.slug ?? "");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const remaining = MAX_PRODUCT_IMAGES - images.length;

  const upload = async (files: FileList | null) => {
    if (!files?.length) return;
    setUploadError(null);
    setUploading(true);
    const client = supabase.current;
    const added: GalleryImage[] = [];

    for (const file of Array.from(files).slice(0, remaining)) {
      if (!ACCEPT.split(",").includes(file.type)) {
        setUploadError("Images must be JPEG, PNG, WebP or AVIF.");
        continue;
      }
      if (file.size > MAX_BYTES) {
        setUploadError(`“${file.name}” is over 10MB — please export it smaller.`);
        continue;
      }
      const ext = (file.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "");
      const path = `products/${crypto.randomUUID()}.${ext || "jpg"}`;
      const { error } = await client.storage
        .from(PRODUCT_IMAGES_BUCKET)
        .upload(path, file, { contentType: file.type, upsert: false });
      if (error) {
        setUploadError(error.message || "That photograph could not be uploaded.");
        continue;
      }
      added.push({ path, alt: null });
    }

    if (added.length) setImages((prev) => [...prev, ...added].slice(0, MAX_PRODUCT_IMAGES));
    setUploading(false);
  };

  const removeImage = async (path: string) => {
    setImages((prev) => prev.filter((i) => i.path !== path));
    // A photograph that was only just uploaded is binned immediately; one that
    // belongs to the saved product is cleaned up by the action when you save,
    // so cancelling the form leaves the live piece untouched.
    if (!savedPaths.current.has(path)) {
      await supabase.current.storage.from(PRODUCT_IMAGES_BUCKET).remove([path]);
    }
  };

  const move = (index: number, direction: -1 | 1) => {
    setImages((prev) => {
      const next = [...prev];
      const target = index + direction;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  };

  return (
    <div className="mx-auto max-w-4xl">
      <form action={formAction} className="space-y-8">
        {product && <input type="hidden" name="id" value={product.id} />}
        <input type="hidden" name="images" value={JSON.stringify(images)} />

        {/* ---------------------------------------------------- the piece */}
        <section className="adm-card p-6">
          <h2 className="font-serif text-xl font-light text-[var(--adm-ink)]">The piece</h2>

          <div className="mt-5 grid gap-5 md:grid-cols-2">
            <div className="md:col-span-2">
              <label htmlFor="product-title" className={label}>
                Title
              </label>
              <input
                id="product-title"
                name="title"
                required
                maxLength={160}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Celeste Diamond Ring"
                className={field}
              />
            </div>

            <div className="md:col-span-2">
              <label htmlFor="product-slug" className={label}>
                Web address
              </label>
              <div className="flex items-center gap-2">
                <span className="mt-2 font-body text-[0.78rem] text-[var(--adm-muted)]">/shop/</span>
                <input
                  id="product-slug"
                  name="slug"
                  maxLength={80}
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  onFocus={() => !slug && setSlug(slugify(title))}
                  placeholder={slugify(title || "celeste-diamond-ring")}
                  className={field}
                />
              </div>
              <p className="mt-1.5 font-body text-[0.68rem] text-[var(--adm-muted)]">
                Leave it empty and it is taken from the title. Duplicates get a number.
              </p>
            </div>

            <div className="md:col-span-2">
              <label htmlFor="product-description" className={label}>
                Description
              </label>
              <textarea
                id="product-description"
                name="description"
                rows={5}
                maxLength={8000}
                defaultValue={product?.description ?? ""}
                placeholder="A cathedral-set round brilliant lifted high above a tapering band…"
                className={`${field} resize-none`}
              />
            </div>

            <div>
              <label htmlFor="product-price" className={label}>
                Price (SGD)
              </label>
              <input
                id="product-price"
                name="price"
                inputMode="decimal"
                defaultValue={product?.price != null ? String(product.price) : ""}
                placeholder="Leave empty for “price upon request”"
                className={field}
              />
            </div>

            <div>
              <label htmlFor="product-category" className={label}>
                Category
              </label>
              <select
                id="product-category"
                name="categoryId"
                defaultValue={product?.category_id ?? ""}
                className={`${field} cursor-pointer`}
              >
                <option value="">Uncategorised</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </section>

        {/* ------------------------------------------------- photographs */}
        <section className="adm-card p-6">
          <div className="flex items-baseline justify-between">
            <h2 className="font-serif text-xl font-light text-[var(--adm-ink)]">Photographs</h2>
            <span className="font-sans text-[0.58rem] uppercase tracking-[0.2em] text-[var(--adm-muted)]">
              {images.length} / {MAX_PRODUCT_IMAGES}
            </span>
          </div>
          <p className="mt-1.5 font-body text-[0.78rem] text-[var(--adm-ink-soft)]">
            The first photograph is the one the shop grid shows. Up to five per piece.
          </p>

          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
            {images.map((image, index) => (
              <div
                key={image.path}
                className="group relative overflow-hidden adm-inset overflow-hidden"
              >
                <div className="aspect-square">
                  {/* eslint-disable-next-line @next/next/no-img-element -- admin preview, straight from the bucket CDN */}
                  <img
                    src={productImageUrl(image.path) ?? ""}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                </div>
                {index === 0 && (
                  <span className="absolute left-1.5 top-1.5 rounded-full bg-[#13294b]/80 px-2 py-0.5 font-sans text-[0.5rem] uppercase tracking-[0.16em] text-white">
                    Cover
                  </span>
                )}
                <div className="flex items-center justify-between bg-[var(--adm-inset)] px-1.5 py-1.5">
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => move(index, -1)}
                      disabled={index === 0}
                      aria-label="Move earlier"
                      className="rounded px-1.5 py-0.5 font-sans text-[0.7rem] text-[var(--adm-ink-soft)] transition-colors hover:text-[var(--adm-accent)] disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
                    >
                      ←
                    </button>
                    <button
                      type="button"
                      onClick={() => move(index, 1)}
                      disabled={index === images.length - 1}
                      aria-label="Move later"
                      className="rounded px-1.5 py-0.5 font-sans text-[0.7rem] text-[var(--adm-ink-soft)] transition-colors hover:text-[var(--adm-accent)] disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
                    >
                      →
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeImage(image.path)}
                    className="rounded px-1.5 py-0.5 font-sans text-[0.55rem] uppercase tracking-[0.14em] text-[var(--adm-ink-soft)] transition-colors hover:text-[var(--adm-danger)] cursor-pointer"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}

            {remaining > 0 && (
              <label className="flex aspect-square cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-[var(--adm-line)] bg-[var(--adm-inset)] p-3 text-center transition-colors hover:border-[var(--adm-accent)]">
                <span className="font-serif text-2xl font-light text-[var(--adm-accent)]">+</span>
                <span className="mt-1 font-sans text-[0.55rem] uppercase tracking-[0.16em] text-[var(--adm-ink-soft)]">
                  {uploading ? "Uploading…" : "Add photo"}
                </span>
                <input
                  type="file"
                  accept={ACCEPT}
                  multiple
                  disabled={uploading}
                  className="hidden"
                  onChange={(e) => {
                    void upload(e.target.files);
                    e.target.value = "";
                  }}
                />
              </label>
            )}
          </div>

          {uploadError && (
            <p className="mt-4 font-body text-[0.8rem] text-[var(--adm-danger)]" role="alert">
              {uploadError}
            </p>
          )}
        </section>

        {/* ------------------------------------------------- publishing */}
        <section className="adm-card p-6">
          <h2 className="font-serif text-xl font-light text-[var(--adm-ink)]">Publishing</h2>

          <div className="mt-5 grid gap-5 md:grid-cols-2">
            <div>
              <label htmlFor="product-status" className={label}>
                Status
              </label>
              <select
                id="product-status"
                name="status"
                defaultValue={product?.status ?? "draft"}
                className={`${field} cursor-pointer`}
              >
                {PRODUCT_STATUSES.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label}
                  </option>
                ))}
              </select>
              <p className="mt-1.5 font-body text-[0.68rem] text-[var(--adm-muted)]">
                Only <span className="text-[var(--adm-accent-strong)]">Live</span> pieces appear in the shop.
              </p>
            </div>

            <div className="flex flex-col justify-center gap-3 pt-2">
              <label className="flex cursor-pointer items-center gap-3 font-body text-[0.85rem] text-[var(--adm-ink-soft)]">
                <input
                  type="checkbox"
                  name="inStock"
                  defaultChecked={product?.in_stock ?? true}
                  className="h-4 w-4 accent-[#f0b429]"
                />
                Available to order
              </label>
              <label className="flex cursor-pointer items-center gap-3 font-body text-[0.85rem] text-[var(--adm-ink-soft)]">
                <input
                  type="checkbox"
                  name="featured"
                  defaultChecked={product?.featured ?? false}
                  className="h-4 w-4 accent-[#f0b429]"
                />
                Feature first in the shop
              </label>
            </div>
          </div>
        </section>

        {state.error && (
          <p className="font-body text-[0.85rem] text-[var(--adm-danger)]" role="alert">
            {state.error}
          </p>
        )}
        {state.ok && !pending && (
          <p className="font-body text-[0.85rem] text-emerald-700" role="status">
            Saved.
          </p>
        )}

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="submit"
            disabled={pending || uploading}
            className="adm-btn px-6 py-3"
          >
            {pending ? "Saving…" : product ? "Save changes" : "Create piece"}
          </button>
          <Link
            href="/admin/products"
            className="adm-btn-ghost px-5 py-3"
          >
            Back to products
          </Link>
          {product && (
            <Link
              href={`/shop/${product.slug}`}
              target="_blank"
              className="font-sans text-[0.62rem] uppercase tracking-[0.16em] text-[var(--adm-accent)] transition-colors hover:text-[var(--adm-accent)]"
            >
              View in shop ↗
            </Link>
          )}
        </div>
      </form>

      {/* Destructive, so it lives in its own form outside the editor. */}
      {product && (
        <form action={deleteProduct} className="mt-10 border-t border-[var(--adm-line)] pt-6">
          <input type="hidden" name="id" value={product.id} />
          <button
            type="submit"
            className="adm-danger-link"
          >
            Delete this piece and its photographs
          </button>
        </form>
      )}
    </div>
  );
}
