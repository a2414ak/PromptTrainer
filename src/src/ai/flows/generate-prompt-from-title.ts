import { z } from "zod";
import { ai } from "@/ai/genkit";
import JSON5 from "json5";

export const GeneratePromptFromTitleInput = z.object({
  title: z.string().min(1),
  category: z.string().optional(),
  keywords: z.string().optional(),
  themes: z.array(z.string()).optional(),
});

export const GeneratePromptFromTitleOutput = z.object({
  prompt: z.string(),
  expectedEffect: z.string(),
  outputFormat: z.string(),
});

function extractJsonObject(raw: string) {
  // 1) ```json ``` などのコードフェンス除去
  const cleaned = raw
    .replace(/^\s*```(?:json|json5)?\s*/i, "")
    .replace(/\s*```\s*$/i, "")
    .trim();

  // 2) 最初の { 〜 最後の } を抜き出し
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) {
    throw new Error(`JSONが見つかりません。head=${cleaned.slice(0, 200)}`);
  }
  return cleaned.slice(start, end + 1);
}

export const generatePromptFromTitleFlow = ai.defineFlow(
  {
    name: "generatePromptFromTitleFlow",
    inputSchema: GeneratePromptFromTitleInput,
    outputSchema: GeneratePromptFromTitleOutput,
  },
  async (input) => {
    const themesText = input.themes?.length ? `テーマ: ${input.themes.join(" / ")}` : "";
    const categoryText = input.category ? `カテゴリ: ${input.category}` : "";
    const keywordsText = input.keywords ? `キーワード: ${input.keywords}` : "";

    const prompt = `
あなたは「生成AI研修（プロンプトエンジニアリング基礎）」の教材作成者です。
次のタイトルの業務を実現するために、受講者がそのままコピペして使える「完成プロンプト」を1つ作ってください。

【必須条件】完成プロンプトは必ず以下4条件を満たすこと：
1. 指示の明確さ
2. 背景情報が整理されているか
3. 出力形式の指定
4. 構造化されているか

【タイトル】
${input.title}

【補助情報】（あれば参照）
${[themesText, categoryText, keywordsText].filter(Boolean).join("\n")}

【出力ルール】
以下のJSONのみを出力してください（前置き/説明/コードフェンスは禁止）。最初の文字は { 、最後の文字は } にしてください。
{
  "prompt": "（完成プロンプト本文）",
  "expectedEffect": "（このプロンプトで期待できる効果を1〜2文）",
  "outputFormat": "（AIの出力形式指定を短く要約：Markdown/表/箇条書き等）"
}

【完成プロンプト本文の推奨構造】
- 目的
- 背景/前提（必要なら仮定質問も含む）
- 入力（ユーザーが埋める変数欄）
- 作業手順
- 出力形式（厳密に）
- 注意事項（機密/曖昧さの扱い等）
`.trim();

    // ★ここが重要：output.schema を外して「まずは生テキスト」をもらう
    const result = await ai.generate({ prompt });

    // Genkitの戻りは環境で違うので両対応
    const raw =
      (typeof (result as any).text === "function" ? (result as any).text() : (result as any).text) ??
      (result as any).outputText ??
      "";

    const jsonText = extractJsonObject(String(raw));
    const parsed = JSON5.parse(jsonText);

    // Zodで最終保証（フィールド欠け・型違いをここで弾く）
    return GeneratePromptFromTitleOutput.parse(parsed);
  }
);
