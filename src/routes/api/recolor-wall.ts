import { GoogleGenAI } from "@google/genai";
import { createFileRoute } from "@tanstack/react-router";

export const ARCHITECTURAL_RECOLOR_PROMPT_TEMPLATE = `You are an expert architectural interior visualizer.
Recolor ONLY the main interior wall shown in this room image to the paint color {colorName} ({colorCode}, HEX: {hexCode}).

Strict requirements:
1. Preserve all existing light sources, window sunbeams, shadows, ambient occlusion, and reflections.
2. Do not modify, blur, or paint over picture frames, switch plates, skirting boards, crown moldings, ceiling, flooring, or furniture.
3. Simulate an authentic {finishType} wall paint sheen (e.g. eggshell/matte).
4. The output must be a clean, photorealistic interior photo matching the exact original geometry and composition.`;

export function formatRecolorPrompt(params: {
  colorName: string;
  colorCode: string;
  hexCode: string;
  finishType?: string;
}): string {
  const finish = params.finishType || "סופרקריל מט+ (eggshell/matte)";
  return ARCHITECTURAL_RECOLOR_PROMPT_TEMPLATE.replace("{colorName}", params.colorName)
    .replace("{colorCode}", params.colorCode)
    .replace("{hexCode}", params.hexCode)
    .replace("{finishType}", finish);
}

interface RecolorRequestBody {
  image?: string; // base64 data url or raw base64 string
  colorName?: string;
  colorCode?: string;
  hexCode?: string;
  finishType?: string;
}

export const Route = createFileRoute("/api/recolor-wall")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const body = (await request.json()) as RecolorRequestBody;

          const colorName = body.colorName || "לבן שלג מודרני";
          const colorCode = body.colorCode || "0021P";
          const hexCode = body.hexCode || "#F9F9F7";
          const finishType = body.finishType || "סופרקריל מט+ משי (eggshell/matte)";

          const prompt = formatRecolorPrompt({
            colorName,
            colorCode,
            hexCode,
            finishType,
          });

          // Check if image data is provided
          let rawBase64 = "";
          let mimeType = "image/jpeg";

          if (body.image) {
            const matches = body.image.match(/^data:([A-Za-z\-+/]+);base64,(.+)$/);
            if (matches && matches.length === 3) {
              mimeType = matches[1];
              rawBase64 = matches[2];
            } else {
              rawBase64 = body.image.replace(/\s+/g, "");
            }
          }

          const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;

          if (apiKey && rawBase64) {
            try {
              const ai = new GoogleGenAI({
                apiKey,
                httpOptions: {
                  headers: {
                    "User-Agent": "aistudio-build",
                  },
                },
              });

              // Call Gemini Image model
              const response = await ai.models.generateContent({
                model: "gemini-3.1-flash-lite-image",
                contents: {
                  parts: [
                    {
                      inlineData: {
                        data: rawBase64,
                        mimeType,
                      },
                    },
                    {
                      text: prompt,
                    },
                  ],
                },
              });

              // Extract resulting image from response candidates
              const candidate = response.candidates?.[0];
              if (candidate?.content?.parts) {
                for (const part of candidate.content.parts) {
                  if (part.inlineData?.data) {
                    const outputMime = part.inlineData.mimeType || "image/png";
                    const outputDataUrl = `data:${outputMime};base64,${part.inlineData.data}`;
                    return Response.json({
                      success: true,
                      recoloredImage: outputDataUrl,
                      source: "gemini-ai",
                      prompt,
                      color: { colorName, colorCode, hexCode, finishType },
                    });
                  }
                }
              }
            } catch (geminiError) {
              console.warn(
                "Gemini AI wall recolor call failed or rate-limited; using client photometric pipeline:",
                geminiError,
              );
            }
          }

          // Return response indicating prompt formulation and fallback metadata
          return Response.json({
            success: true,
            recoloredImage: null, // Client visualizer will apply local photometric pipeline
            source: "photometric-fallback",
            prompt,
            color: { colorName, colorCode, hexCode, finishType },
            message: "Prompt ready for photometric rendering",
          });
        } catch (error) {
          console.error("Recolor wall API error:", error);
          return Response.json(
            {
              success: false,
              error: error instanceof Error ? error.message : "Internal server error",
            },
            { status: 500 },
          );
        }
      },
    },
  },
});
