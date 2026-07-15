import Image from "next/image";
import Navbar from "@/components/Navbar";

type PageHeroProps = {
  eyebrow: string;
  title: string;
  titleAccent: string;
  body: string;
  image?: {
    src: string;
    /** CSS object-position, e.g. "center 30%" */
    position?: string;
  };
};

/**
 * PageHero
 * The dark cinematic opening band for interior pages (about / contact /
 * collections). Mirrors the home hero's rounded stage — navbar floating over
 * a dimmed portrait with bottom-anchored serif copy — without the scroll film.
 */
export default function PageHero({
  eyebrow,
  title,
  titleAccent,
  body,
  image,
}: PageHeroProps) {
  return (
    <section className="relative z-10 w-full">
      <div className="relative flex min-h-[68svh] w-full flex-col overflow-hidden rounded-[2rem] border border-gold-500/10 bg-[#070708] shadow-[0_0_80px_rgba(0,0,0,0.85)] md:min-h-[74svh] md:rounded-[3rem]">
        {/* Backdrop portrait */}
        {image && (
          <div className="absolute inset-0 z-0">
            <Image
              src={image.src}
              alt=""
              fill
              priority
              unoptimized
              sizes="100vw"
              className="object-cover"
              style={{ objectPosition: image.position ?? "center" }}
            />
          </div>
        )}

        {/* Readability overlays (same recipe as the home hero) */}
        <div className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-b from-black/70 via-black/35 to-black/85" />
        <div className="pointer-events-none absolute inset-0 z-10 bg-[radial-gradient(circle_at_center,transparent_35%,rgba(0,0,0,0.72)_100%)]" />

        {/* Ambient gold glow */}
        <div className="pointer-events-none absolute -bottom-32 left-1/2 z-10 h-[420px] w-[620px] -translate-x-1/2 rounded-full bg-gold-400/10 blur-[140px]" />

        {/* Navigation */}
        <div className="relative z-40">
          <Navbar />
        </div>

        {/* Copy — bottom-anchored like the home hero acts */}
        <div className="relative z-30 flex flex-1 items-end px-6 pb-14 pt-44 md:px-16 md:pb-20">
          <div data-reveal className="max-w-2xl">
            <p className="mb-4 font-sans text-[0.72rem] font-medium uppercase tracking-[0.42em] text-gold-300 md:text-xs">
              {eyebrow}
            </p>
            <h1 className="font-serif text-[2.6rem] font-light leading-[1.05] tracking-wide text-gold-50 md:text-6xl lg:text-[4.2rem]">
              {title}
              <br />
              <span className="italic text-gold-200">{titleAccent}</span>
            </h1>
            <p className="mt-5 max-w-xl font-sans text-[0.95rem] leading-relaxed text-gold-100/90 md:text-lg">
              {body}
            </p>
          </div>
        </div>

        {/* Gold hairline base */}
        <div className="absolute inset-x-0 bottom-0 z-30 h-[2px] bg-gradient-to-r from-transparent via-gold-400/60 to-transparent" />
      </div>
    </section>
  );
}
