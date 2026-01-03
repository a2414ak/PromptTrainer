import { NextResponse } from "next/server";
import { embedText1536 } from "@/ai/embeddings";
import { upstashQuery, normalizeUpstashHits } from "@/lib/upstashVector";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = (await req.json().catch(() => ({}))) as any;
    const text = String(body?.text ?? "").trim();
    const topK = Number(body?.topK ?? 5);

    if (!text) {
      return NextResponse.json({ ok: false, error: "body.text を指定してください" }, { status: 400 });
    }

    const qvec = await embedText1536(text);
    const resp = await upstashQuery(qvec, topK);
    const hits = normalizeUpstashHits(resp);

    return NextResponse.json({ ok: true, hits });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message ?? String(e), stack: e?.stack ?? null },
      { status: 500 }
    );
  }
}
