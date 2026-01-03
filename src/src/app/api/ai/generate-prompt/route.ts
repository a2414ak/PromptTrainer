import { NextResponse } from "next/server";
import { z } from "zod";
import { generatePromptFromTitleFlow } from "@/ai/flows/generate-prompt-from-title";

export const runtime = "nodejs";

const BodySchema = z.object({
  title: z.string().min(1),
  category: z.string().optional(),
  keywords: z.string().optional(),
  themes: z.array(z.string()).optional(),
});

export async function POST(req: Request) {
  try {
    const body = BodySchema.parse(await req.json());
    const out = await generatePromptFromTitleFlow(body);
    return NextResponse.json({ ok: true, ...out });
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ ok: false, error: message }, { status: 400 });
  }
}
