import "server-only";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { GENERATIONS_BUCKET, hasServiceRole } from "@/lib/supabase/env";

/**
 * Create a short-lived signed URL for a private generation image so the
 * dashboard can render thumbnails. Returns null when Storage isn't configured
 * or the path is missing.
 */
export async function signGenerationUrl(
  path: string | null | undefined,
  expiresIn = 3600,
): Promise<string | null> {
  if (!hasServiceRole || !path) return null;
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase.storage
    .from(GENERATIONS_BUCKET)
    .createSignedUrl(path, expiresIn);
  if (error) return null;
  return data?.signedUrl ?? null;
}
