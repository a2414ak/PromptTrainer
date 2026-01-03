import { NextResponse } from "next/server";
import { upstashUpsertMany } from "@/lib/upstashVector";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DIM = 1536;

function vecWithOneHot(index: number) {
  const v = Array(DIM).fill(0);
  v[index] = 1;
  return v;
}

export async function POST() {
  try {
    const vectors = [
      {
        id: "demo-vec-1",
        vector: vecWithOneHot(0),
        metadata: { title: "demo1", category: "test" },
      },
      {
        id: "demo-vec-2",
        vector: vecWithOneHot(1),
        metadata: { title: "demo2", category: "test" },
      },
    ];

    const result = await upstashUpsertMany(vectors, { batchSize: 100, debug: true });
    return NextResponse.json({ ok: true, result });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message ?? String(e) }, { status: 500 });
  }
}
