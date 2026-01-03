import { NextResponse } from "next/server";
import { embedText1536 } from "@/ai/embeddings";
import { upstashQuery, normalizeUpstashHits } from "@/lib/upstashVector";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Suggestion = {
  id?: string;
  score?: number;
  title: string;
  category?: string;
  keywords?: string;
};

function uniqByTitle(items: Suggestion[]): Suggestion[] {
  const seen = new Set<string>();
  const out: Suggestion[] = [];
  for (const it of items) {
    const key = (it.title ?? "").trim();
    if (!key) continue;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(it);
  }
  return out;
}

export async function POST(req: Request) {
  try {
    const body = (await req.json().catch(() => ({}))) as any;

    // UI側からは tags を送っても text を送ってもOKにする
    const tags: string[] = Array.isArray(body?.tags) ? body.tags : [];
    const textRaw = String(body?.text ?? "").trim();

    const topK = Number(body?.topK ?? 3);
    if (!Number.isFinite(topK) || topK <= 0) {
      return NextResponse.json({ ok: false, error: "topK は正の数値で指定してください" }, { status: 400 });
    }

    // ★クエリ文字列：tags優先、無ければtext
    const queryText =
      tags.length > 0
        ? tags.map((t) => String(t).trim()).filter(Boolean).join(" ")
        : textRaw;

    if (!queryText) {
      return NextResponse.json({ ok: false, error: "tags または text を指定してください" }, { status: 400 });
    }

    // 1) tags/text を embedding
    const qvec = await embedText1536(queryText);

    // 2) Upstash query（title/keywordsベースの類似検索）
    //    重複除去を考えて少し多めに取る（例: topK*3）
    const fetchK = Math.min(Math.max(topK * 3, 10), 50);

    const resp = await upstashQuery(qvec, fetchK, { includeMetadata: true });
    const hits = normalizeUpstashHits(resp);

    // 3) titleだけ（＋必要ならcategory/keywords/score）に整形
    const suggestionsRaw: Suggestion[] = hits
      .map((h: any) => {
        const m = h?.metadata ?? {};
        const title = typeof m.title === "string" ? m.title : "";
        return {
          id: h?.id,
          score: h?.score,
          title,
          category: typeof m.category === "string" ? m.category : undefined,
          keywords: typeof m.keywords === "string" ? m.keywords : undefined,
        };
      })
      .filter((x) => x.title);

    // 4) title重複を除いて上位 topK 件
    const suggestions = uniqByTitle(suggestionsRaw).slice(0, topK);

    return NextResponse.json({ ok: true, queryText, suggestions });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message ?? String(e), stack: e?.stack ?? null },
      { status: 500 }
    );
  }
}
