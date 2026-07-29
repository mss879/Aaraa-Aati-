import "server-only";
import { createHash } from "crypto";
import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Shared request-security helpers for the public API routes: client IP
 * extraction + salted hashing, same-origin checking, and the durable rate-limit
 * wrapper around the Postgres rate_limit_hit() function.
 */

/** Best-effort client IP from proxy headers (Vercel/hosts set x-forwarded-for). */
export function getClientIp(req: Request): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0]!.trim();
  return (
    req.headers.get("x-real-ip") ||
    req.headers.get("cf-connecting-ip") ||
    "0.0.0.0"
  );
}

/** Salted SHA-256 of the IP — we store this, never the raw address. */
export function hashIp(ip: string): string {
  const salt = process.env.RATE_LIMIT_SALT ?? "";
  return createHash("sha256").update(`${salt}:${ip}`).digest("hex").slice(0, 32);
}

/**
 * Reject cross-origin POSTs (basic CSRF / scripted-abuse guard). When an Origin
 * header is present it must match the request host; a missing Origin is allowed
 * (some legitimate same-origin requests omit it).
 */
export function isSameOrigin(req: Request): boolean {
  const origin = req.headers.get("origin");
  if (!origin) return true;
  try {
    const originHost = new URL(origin).host;
    const host = req.headers.get("host");
    return Boolean(host) && originHost === host;
  } catch {
    return false;
  }
}

/**
 * Record one hit and return whether the request is allowed. Fails OPEN if the
 * RPC errors (never block a real visitor because the limiter had a hiccup) —
 * the lead-gate and origin checks remain as defenses.
 */
export async function rateLimit(
  supabase: SupabaseClient,
  key: string,
  max: number,
  windowSeconds: number,
): Promise<boolean> {
  const { data, error } = await supabase.rpc("rate_limit_hit", {
    p_key: key,
    p_max: max,
    p_window_seconds: windowSeconds,
  });
  if (error) return true;
  return data !== false;
}

/** Trim + cap a free-text field; returns "" for non-strings. */
export function cleanText(value: unknown, max: number): string {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, max);
}

/** Loose email sanity check (server-side; the client also validates). */
export function isEmailish(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}
