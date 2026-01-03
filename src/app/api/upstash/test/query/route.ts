import { NextResponse } from "next/server";
import { normalizeUpstashHits, upstashQuery } from "@/lib/upstashVector";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DIM = 1536;

function oneHot(i: number) {
  const v = Array(DIM).fill(0);
  v[i] = 1;
  return v;
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const topK = body?.topK ?? 3;

    // ★ mode があれば one-hot を使う（seed確認用）
    const mode = body?.mode as string | undefined;

    let vectorRaw: any = body?.vector;

    if (mode === "onehot0") vectorRaw = oneHot(0);
    if (mode === "onehot1") vectorRaw = oneHot(1);

    // vector が無い場合はゼロベクトル（疎通用）
    if (!vectorRaw) vectorRaw = Array(DIM).fill(0);

    if (!Array.isArray(vectorRaw) || vectorRaw.length !== DIM) {
      return NextResponse.json(
        { ok: false, error: `body.vector は長さ ${DIM} の number[] で指定してください` },
        { status: 400 }
      );
    }

    const vector = vectorRaw.map((n: any) => Number(n));
    const resp = await upstashQuery(vector, Number(topK));
    const hits = normalizeUpstashHits(resp);

    return NextResponse.json({ ok: true, hits, raw: resp });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message ?? String(e) },
      { status: 500 }
    );
  }
}
