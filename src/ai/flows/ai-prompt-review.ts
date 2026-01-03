'use server';

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const EvaluationSchema = z.object({
  criteria: z.string().describe('評価基準（例：明確さ、コンテキスト）。'),
  status: z
    .enum(['非常に良い', '良好', '改善点'])
    .describe('評価ステータス：非常に良い、良好、または改善点。'),
  advice: z.string().describe('プロンプトを改善するための具体的なアドバイス。'),
});

const ReviewResultSchema = z.object({
  aiOutput: z.string().describe('ユーザープロンプトに基づいてAIが生成した出力。'),
  evaluations: z.array(EvaluationSchema).describe('プロンプトの評価の配列。'),
});

export type ReviewResult = z.infer<typeof ReviewResultSchema>;

const GenerateAndReviewInputSchema = z.object({
  scenario: z.string().describe('ユーザーが選択したタスクシナリオ。'),
  prompt: z.string().describe('ユーザーが生成したプロンプト。'),
});

export type GenerateAndReviewInput = z.infer<typeof GenerateAndReviewInputSchema>;

const generateAiOutputPrompt = ai.definePrompt({
  name: 'generateAiOutputPrompt',
  input: { schema: GenerateAndReviewInputSchema },
  // ✅ ここが原因なので output を削除（JSON5 parseさせない）
  prompt: `
あなたは業務アシスタントです。
シナリオ: {{{scenario}}}

以下の「ユーザープロンプト」に従って、AIの出力本文のみを作成してください。
（余計な説明は不要です）

ユーザープロンプト:
{{{prompt}}}
`.trim(),
});

const evaluatePrompt = ai.definePrompt({
  name: 'evaluatePrompt',
  input: { schema: z.object({ prompt: z.string() }) },
  output: { schema: z.object({ evaluations: z.array(EvaluationSchema) }) },
  // ✅ JSONのみ返す縛りを追加（構造化出力の事故対策）
  prompt: `
あなたはプロンプトレビュー担当です。
次のスキーマに一致する「JSONのみ」を返してください。
- 説明文、前置き、コードフェンス(\`\`\`)は禁止です。
- advice に改行を入れないでください（必要なら \\n を使ってください）。

スキーマ:
{ "evaluations": [ { "criteria": string, "status": "非常に良い" | "良好" | "改善点", "advice": string } ] }

対象プロンプト:
{{{prompt}}}
`.trim(),
});

export async function generateAndReview(
  scenario: string,
  prompt: string
): Promise<ReviewResult> {
  return generateAndReviewFlow({ scenario, prompt });
}

const generateAndReviewFlow = ai.defineFlow(
  {
    name: 'generateAndReviewFlow',
    inputSchema: GenerateAndReviewInputSchema,
    outputSchema: ReviewResultSchema,
  },
  async (input) => {
    const aiOutput = await generateAiOutputPrompt(input).then((res) => res.text);


    let evaluations: z.infer<typeof EvaluationSchema>[] = [];
    try {
      const evaluationResponse = await evaluatePrompt({ prompt: input.prompt });

      // ✅ output() / output の両対応（環境差分吸収）
      const output =
        typeof (evaluationResponse as any).output === 'function'
          ? (evaluationResponse as any).output()
          : (evaluationResponse as any).output;

      if (output?.evaluations) {
        evaluations = output.evaluations;
      } else {
        // 念のため：パースできてない時のログ
        console.error('[evaluatePrompt] output is empty. raw text:', (evaluationResponse as any).text);

      }
    } catch (error) {
      console.error('Error parsing evaluations:', error);
      evaluations = [
        {
          criteria: '評価不可',
          status: '改善点',
          advice:
            'AIの応答を解析できませんでした。プロンプトをより明確に、より具体的にしてみてください。',
        },
      ];
    }

    return { aiOutput, evaluations };
  }
);
