import { NextResponse } from "next/server";
import { upstashUpsertMany } from "@/lib/upstashVector";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    const vectors = body?.vectors;

    if (!Array.isArray(vectors) || vectors.length === 0) {
      return NextResponse.json(
        { ok: false, error: "body.vectors は配列で指定してください" },
        { status: 400 }
      );
    }

    // debug: true にするとサーバーログに payload preview が出ます
    const result = await upstashUpsertMany(vectors, { batchSize: 100, debug: true });

    return NextResponse.json({ ok: true, result });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message ?? String(e) },
      { status: 500 }
    );
  }
}
