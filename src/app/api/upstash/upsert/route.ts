import { NextResponse } from "next/server";
import { upstashUpsertMany } from "@/lib/upstashVector";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const { vectors } = await req.json();

    if (!Array.isArray(vectors)) {
      return NextResponse.json({ error: "vectors must be an array" }, { status: 400 });
    }

    const result = await upstashUpsertMany(vectors, { batchSize: 100, debug: true });
    return NextResponse.json({ ok: true, result });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message ?? String(e) }, { status: 500 });
  }
}
