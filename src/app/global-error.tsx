"use client";

import { useEffect } from "react";

/**
 * Last-resort boundary — this one catches failures in the root layout itself,
 * which is why it has to render its own <html> and <body>: at this point the
 * layout that normally provides them is the thing that broke.
 *
 * For the same reason it can rely on neither the font variables nor the
 * stylesheet, so the handful of styles it needs are inline. It should be
 * unreachable in practice; it exists so that "unreachable" doesn't mean a blank
 * white screen if it ever happens.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Root layout error", error.digest ?? error);
  }, [error]);

  return (
    <html lang="en-SG">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#0A1F3D",
          color: "#F1E6C8",
          fontFamily: "Georgia, 'Times New Roman', serif",
          textAlign: "center",
          padding: "2rem",
        }}
      >
        <div style={{ maxWidth: "34rem" }}>
          <p
            style={{
              fontSize: "0.7rem",
              letterSpacing: "0.4em",
              textTransform: "uppercase",
              color: "#C9A961",
              margin: 0,
            }}
          >
            Ceylon Gem Maison
          </p>
          <h1 style={{ fontSize: "2.25rem", fontWeight: 300, margin: "1.25rem 0 0" }}>
            The site is briefly unavailable
          </h1>
          <p
            style={{
              fontSize: "1rem",
              lineHeight: 1.75,
              color: "#A9B8D0",
              margin: "1.25rem 0 0",
            }}
          >
            Please try again in a moment. If you need us urgently, write to{" "}
            <a href="mailto:support@ceylongemmaison.com" style={{ color: "#C9A961" }}>
              support@ceylongemmaison.com
            </a>
            .
          </p>
          <button
            type="button"
            onClick={reset}
            style={{
              marginTop: "2rem",
              padding: "0.85rem 2.25rem",
              fontSize: "0.7rem",
              letterSpacing: "0.28em",
              textTransform: "uppercase",
              color: "#0A1F3D",
              backgroundColor: "#C9A961",
              border: "none",
              borderRadius: "999px",
              cursor: "pointer",
            }}
          >
            Try Again
          </button>
        </div>
      </body>
    </html>
  );
}
