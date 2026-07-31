"use client";

import { useState } from "react";
import Image from "next/image";

/**
 * The piece, shown large with its other photographs beneath. Up to five, so a
 * simple thumbnail row is the whole interaction — no carousel, no dots.
 */
export default function ProductGallery({
  images,
  title,
}: {
  images: { url: string; alt: string | null }[];
  title: string;
}) {
  const [active, setActive] = useState(0);
  const current = images[active] ?? images[0];

  if (!current) {
    return (
      <div className="flex aspect-square w-full items-center justify-center bg-black font-sans text-[0.7rem] uppercase tracking-[0.25em] text-[#5E7495]">
        Photograph coming
      </div>
    );
  }

  return (
    <div>
      <div className="relative aspect-square w-full overflow-hidden bg-black">
        <Image
          key={current.url}
          src={current.url}
          alt={current.alt || title}
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 50vw"
          className="object-contain p-6 md:p-10"
        />
      </div>

      {images.length > 1 && (
        <div className="mt-[1px] grid grid-cols-4 gap-[1px] bg-[#1D3D6B]">
          {images.map((image, index) => (
            <button
              key={image.url}
              type="button"
              onClick={() => setActive(index)}
              aria-label={`Photograph ${index + 1} of ${images.length}`}
              aria-pressed={index === active}
              className={`relative aspect-square cursor-pointer bg-black transition-opacity duration-300 ${
                index === active ? "opacity-100" : "opacity-55 hover:opacity-85"
              }`}
            >
              <Image
                src={image.url}
                alt=""
                fill
                sizes="12vw"
                className="object-contain p-2.5"
              />
              {index === active && (
                <span className="absolute inset-x-0 bottom-0 h-[2px] bg-gold-400" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
