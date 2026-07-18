"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";

// three.js is ~150 KB of JS plus a WebGL warm-up. Load it only in the browser
// (ssr: false) and only once the About band is near the viewport, so it never
// weighs down the home page's initial bundle, execution or main-thread budget.
const Ring3D = dynamic(() => import("@/components/Ring3D"), { ssr: false });

export default function Ring3DLazy() {
  const ref = useRef<HTMLDivElement>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setShow(true);
          io.disconnect();
        }
      },
      // Pre-warm a little before it scrolls into view so the ring is ready.
      { rootMargin: "300px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={ref} className="h-full w-full">
      {show && <Ring3D />}
    </div>
  );
}
