import { NextResponse } from "next/server";
import { normalizeUpstashHits, upstashQuery } from "@/lib/upstashVector";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const { vector, topK } = await req.json();

    if (!Array.isArray(vector) || typeof topK !== "number") {
      return NextResponse.json({ error: "vector (number[]) and topK (number) are required" }, { status: 400 });
    }

    const resp = await upstashQuery(vector, topK, { includeMetadata: true });
    const hits = normalizeUpstashHits(resp);

    return NextResponse.json({ ok: true, hits, raw: resp });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message ?? String(e) }, { status: 500 });
  }
}
