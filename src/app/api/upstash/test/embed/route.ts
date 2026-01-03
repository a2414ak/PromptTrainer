import { NextResponse } from "next/server";
import { embedText1536 } from "@/ai/embeddings";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = (await req.json().catch(() => ({}))) as any;
    const text = String(body?.text ?? "").trim();

    if (!text) {
      return NextResponse.json({ ok: false, error: "body.text を指定してください" }, { status: 400 });
    }

    const v = await embedText1536(text);
    return NextResponse.json({ ok: true, dim: v.length, head: v.slice(0, 5) });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message ?? String(e), stack: e?.stack ?? null },
      { status: 500 }
    );
  }
}
