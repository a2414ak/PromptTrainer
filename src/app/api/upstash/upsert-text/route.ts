import { NextResponse } from "next/server";
import { upstashUpsertMany } from "@/lib/upstashVector";
import { embedText1536 } from "@/ai/embeddings";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function toPlainObject(v: unknown): Record<string, any> {
  if (v && typeof v === "object" && !Array.isArray(v)) return v as Record<string, any>;
  return {};
}

export async function POST(req: Request) {
  try {
    const body = (await req.json().catch(() => ({}))) as any;
    const items = body?.items;

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { ok: false, error: "body.items は [{id,text,metadata?}] の配列で指定してください" },
        { status: 400 }
      );
    }

    const vectors = await Promise.all(
      items.map(async (it: any, idx: number) => {
        const id = String(it?.id ?? "").trim();
        const text = String(it?.text ?? "").trim();
        const metadata = toPlainObject(it?.metadata);

        if (!id || !text) {
          throw new Error(`items[${idx}] に id と text が必要です`);
        }

        const vector = await embedText1536(text);

        // null/undefined を絶対に spread しないように Object.assign を使用
        const mergedMetadata = Object.assign({}, metadata, { text });

        return { id, vector, metadata: mergedMetadata };
      })
    );

    const result = await upstashUpsertMany(vectors, { batchSize: 50 });
    return NextResponse.json({ ok: true, result });
  } catch (e: any) {
    // ★原因特定のため、dev中はstackも返す
    return NextResponse.json(
      { ok: false, error: e?.message ?? String(e), stack: e?.stack ?? null },
      { status: 500 }
    );
  }
}
