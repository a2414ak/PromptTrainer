import { z } from "zod";
import { ai } from "@/ai/genkit";

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

export const generatePromptFromTitleFlow = ai.defineFlow(
  {
    name: "generatePromptFromTitleFlow",
    inputSchema: GeneratePromptFromTitleInput,
    outputSchema: GeneratePromptFromTitleOutput,
  },
  async (input) => {
    const themesText = input.themes?.length ? input.themes.join(" / ") : "";
    const categoryText = input.category ? `カテゴリ: ${input.category}` : "";
    const keywordsText = input.keywords ? `キーワード: ${input.keywords}` : "";

    // 重要：あなたの研修要件（4条件）をプロンプト生成ルールに埋め込みます
    const instruction = `
あなたは「生成AI研修（プロンプトエンジニアリング基礎）」の教材作成者です。
次のタイトルの業務を実現するために、受講者がそのままコピペして使える「完成プロンプト」を1つ作ってください。

【必須条件】完成プロンプトは必ず以下4条件を満たすこと：
1. 指示が明確
2. 背景情報が整理されている
3. 出力形式の指定がある
4. 構造化されている（見出し・箇条書き・手順など）

【タイトル】
${input.title}

【補助情報】（あれば参照）
${[themesText, categoryText, keywordsText].filter(Boolean).join("\n")}

【出力ルール】
以下のJSONのみを出力してください（余計な文章は不要）:
{
  "prompt": "（完成プロンプト本文）",
  "expectedEffect": "（このプロンプトで期待できる効果を1〜2文）",
  "outputFormat": "（AIの出力形式の指定を短く要約。例：Markdown/表/箇条書き等）"
}

【完成プロンプト本文の推奨構造】
- 目的
- 背景/前提（必要なら仮定質問も含む）
- 入力（ユーザーが埋める変数欄）
- 作業手順
- 出力形式（厳密に）
- 注意事項（機密/曖昧さの扱い等）

【重要】
- JSON以外は絶対に出力しない
- フィールド名は必ず prompt / expectedEffect / outputFormat
- 文字列はすべてダブルクォートで囲む
`.trim();

    const result = await ai.generate({
      prompt: instruction,
      output: { schema: GeneratePromptFromTitleOutput },
    });

    return result.output!;
  }
);
