import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { buildJewelPrompt, sanitizeConfig } from "@/lib/ring-options";

/**
 * POST /api/generate-ring
 * Renders the configured piece (ring, necklace or bracelet) as a photoreal
 * product shot on a pure white background using Gemini's image model.
 * Body: RingConfig JSON · Response: { image: "data:image/png;base64,..." }
 */

export const runtime = "nodejs";
export const maxDuration = 60;

const IMAGE_MODEL = process.env.GEMINI_IMAGE_MODEL || "gemini-2.5-flash-image";

export async function POST(req: Request) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      {
        error:
          "The AI atelier is not configured yet — add your GEMINI_API_KEY to .env.local and restart the server.",
      },
      { status: 503 },
    );
  }

  let payload: unknown;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const config = sanitizeConfig(payload);
  const prompt = buildJewelPrompt(config);

  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: IMAGE_MODEL,
      contents: prompt,
    });

    const parts = response.candidates?.[0]?.content?.parts ?? [];
    const imagePart = parts.find((p) => p.inlineData?.data);

    if (!imagePart?.inlineData?.data) {
      const text = parts.map((p) => p.text).filter(Boolean).join(" ").slice(0, 300);
      return NextResponse.json(
        { error: text || "The model returned no image. Please try again." },
        { status: 502 },
      );
    }

    const mime = imagePart.inlineData.mimeType || "image/png";
    return NextResponse.json({
      image: `data:${mime};base64,${imagePart.inlineData.data}`,
      config,
    });
  } catch (err) {
    console.error("[generate-ring]", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    const friendly = /api key|permission|401|403/i.test(message)
      ? "The Gemini API key was rejected — double-check GEMINI_API_KEY in .env.local."
      : /quota|429|resource.?exhausted/i.test(message)
        ? "The AI atelier is briefly over capacity (rate limit). Please try again in a moment."
        : "The render failed unexpectedly. Please try again.";
    return NextResponse.json({ error: friendly }, { status: 502 });
  }
}
