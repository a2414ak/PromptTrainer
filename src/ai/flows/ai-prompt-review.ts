'use server';

/**
 * @fileOverview 明確さ、コンテキスト、フォーマット、構造などの基準に基づいて、生成されたプロンプトをレビューします。
 *
 * @function generateAndReview - 選択されたシナリオとユーザー入力に基づいてプロンプトを分析し、フィードバックを提供します。
 * @typedef {Object} ReviewResult - AIの出力と評価を含む、プロンプトレビューの結果。
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ReviewResultSchema = z.object({
  aiOutput: z.string().describe('ユーザープロンプトに基づいてAIが生成した出力。'),
  evaluations: z.array(
    z.object({
      criteria: z.string().describe('評価基準（例：明確さ、コンテキスト）。'),
      status: z
        .enum(['非常に良い', '良好', '改善点'])
        .describe('評価ステータス：非常に良い、良好、または改善点。'),
      advice: z.string().describe('プロンプトを改善するための具体的なアドバイス。'),
    })
  ).describe('プロンプトの評価の配列。'),
});

export type ReviewResult = z.infer<typeof ReviewResultSchema>;

const GenerateAndReviewInputSchema = z.object({
  scenario: z.string().describe('ユーザーが選択したタスクシナリオ。'),
  prompt: z.string().describe('ユーザーが生成したプロンプト。'),
});

export type GenerateAndReviewInput = z.infer<typeof GenerateAndReviewInputSchema>;

export async function generateAndReview(scenario: string, prompt: string): Promise<ReviewResult> {
  return generateAndReviewFlow({
    scenario,
    prompt,
  });
}

const promptReviewPrompt = ai.definePrompt({
  name: 'promptReviewPrompt',
  input: {schema: GenerateAndReviewInputSchema},
  output: {schema: ReviewResultSchema},
  prompt: `あなたはAIプロンプトレビュアーです。選択されたシナリオに基づいて、ユーザーが提供したプロンプトを分析します。明確さ、コンテキスト、フォーマット、構造に関するフィードバックを提供してください。

シナリオはこちらです: {{{scenario}}}

プロンプトはこちらです: {{{prompt}}}

次のスキーマでJSONオブジェクトを出力します:
${ReviewResultSchema.description}

"status"フィールドが次の文字列のいずれかであることを確認してください: "非常に良い"、"良好"、または"改善点"。これらはそれぞれ "Excellent"、"Good"、"Needs Improvement"に対応します。改善のための具体的な "advice" を提供してください。
`,
});

const generateAndReviewFlow = ai.defineFlow(
  {
    name: 'generateAndReviewFlow',
    inputSchema: GenerateAndReviewInputSchema,
    outputSchema: ReviewResultSchema,
  },
  async input => {
    const {output} = await promptReviewPrompt(input);
    return output!;
  }
);
