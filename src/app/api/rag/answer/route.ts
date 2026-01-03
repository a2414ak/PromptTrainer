import { NextResponse } from "next/server";
import { ai } from "@/ai/genkit";
import { embedText1536 } from "@/ai/embeddings";
import { upstashQuery, normalizeUpstashHits } from "@/lib/upstashVector";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function buildContext(hits: any[]) {
  // hit.metadata に {question, answer} 形式 or {text} 形式が混在してもOKにする
  return hits
    .map((h, i) => {
      const m = h?.metadata ?? {};
      const title = m.title || m.category || h.id || `source-${i + 1}`;

      const qa =
        (m.question && m.answer)
          ? `Q: ${m.question}\nA: ${m.answer}`
          : null;

      const text = m.text ? String(m.text) : null;

      const body = qa ?? text ?? JSON.stringify(m);

      return `### Source ${i + 1}: ${title}\n${body}`;
    })
    .join("\n\n");
}

export async function POST(req: Request) {
  try {
    const body = (await req.json().catch(() => ({}))) as any;
    const question = String(body?.question ?? "").trim();
    const topK = Number(body?.topK ?? 5);

    if (!question) {
      return NextResponse.json({ ok: false, error: "body.question を指定してください" }, { status: 400 });
    }

    // 1) embed
    const qvec = await embedText1536(question);

    // 2) retrieve
    const resp = await upstashQuery(qvec, topK, { includeMetadata: true });
    const hits = normalizeUpstashHits(resp);

    // 3) build context
    const context = buildContext(hits);

    // 4) generate answer (Genkit: openai/gpt-4)
    const prompt = `
あなたは社内Q&Aアシスタントです。
次の「参考情報」に基づいて、ユーザーの質問に日本語で簡潔に回答してください。
参考情報に無いことは推測せず、「分かりません／人事・経理へ確認してください」など安全に案内してください。

# ユーザーの質問
${question}

# 参考情報（検索結果）
${context}
`.trim();

    const llm = await ai.generate({
      // genkit.ts の default model が openai/gpt-4 なので省略も可
      model: "openai/gpt-4",
      prompt,
    });

    const answer = llm.text ?? "";

    return NextResponse.json({
      ok: true,
      answer,
      sources: hits.map((h) => ({
        id: h.id,
        score: h.score,
        metadata: h.metadata,
      })),
    });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message ?? String(e), stack: e?.stack ?? null },
      { status: 500 }
    );
  }
}
