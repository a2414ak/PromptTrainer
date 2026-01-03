import { NextResponse } from "next/server";
import { normalizeUpstashHits, upstashQuery } from "@/lib/upstashVector";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const EXPECTED_DIM = 1536;

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));

    const topK = body?.topK ?? 3;

    // ★vectorが無い場合はテスト用に1536次元ゼロベクトルを生成
    const vectorRaw = body?.vector ?? Array(EXPECTED_DIM).fill(0);

    if (!Array.isArray(vectorRaw) || vectorRaw.length !== EXPECTED_DIM) {
      return NextResponse.json(
        { ok: false, error: `body.vector は長さ ${EXPECTED_DIM} の number[] で指定してください` },
        { status: 400 }
      );
    }

    const vector = vectorRaw.map((n: any) => Number(n));

    const resp = await upstashQuery(vector, Number(topK));
    const hits = normalizeUpstashHits(resp);

    return NextResponse.json({ ok: true, hits, raw: resp });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message ?? String(e) }, { status: 500 });
  }
}
