'use server';

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const CriteriaEnum = z.enum([
  '指示の明確さ',
  '背景情報が整理されているか',
  '出力形式の指定',
  '構造化されているか',
]);

const REQUIRED_CRITERIA = [
  '指示の明確さ',
  '背景情報が整理されているか',
  '出力形式の指定',
  '構造化されているか',
] as const;

const EvaluationSchema = z.object({
  criteria: CriteriaEnum.describe('評価基準（固定：4つのみ）'),
  status: z
    .enum(['非常に良い', '良好', '改善点'])
    .describe('評価ステータス：非常に良い、良好、または改善点。'),
  advice: z.string().describe('プロンプトを改善するための具体的なアドバイス。'),
});

const ReviewResultSchema = z.object({
  aiOutput: z.string().describe('ユーザープロンプトに基づいてAIが生成した出力。'),
  evaluations: z
    .array(EvaluationSchema)
    .min(4)
    .max(4)
    .describe('プロンプトの評価（4件固定）。'),
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
  output: { schema: z.object({ evaluations: z.array(EvaluationSchema).min(4).max(4) }) },
  prompt: `
あなたはプロンプトレビュー担当です。
次のスキーマに一致する「JSONのみ」を返してください。
- 説明文、前置き、コードフェンス(\`\`\`)は禁止です。
- advice に改行を入れないでください（必要なら \\n を使ってください）。
- advice は30字以内にしてください。
- evaluations は必ず4件、次のcriteriaを「この順番で」1回ずつ必ず使ってください（増減禁止）:
  1. 指示の明確さ
  2. 背景情報が整理されているか
  3. 出力形式の指定
  4. 構造化されているか

スキーマ:
{ "evaluations": [ { "criteria": "指示の明確さ" | "背景情報が整理されているか" | "出力形式の指定" | "構造化されているか", "status": "非常に良い" | "良好" | "改善点", "advice": string } ] }

対象プロンプト:
{{{prompt}}}
`.trim(),
});

function normalizeEvaluations(
  raw: any[]
): z.infer<typeof EvaluationSchema>[] {
  const map = new Map<string, any>();

  for (const item of Array.isArray(raw) ? raw : []) {
    const c = item?.criteria;
    if (REQUIRED_CRITERIA.includes(c)) {
      map.set(c, {
        criteria: c,
        status: item?.status ?? '改善点',
        advice: String(item?.advice ?? '').replace(/\n/g, '\\n'),
      });
    }
  }

  return REQUIRED_CRITERIA.map((c) => {
    const v = map.get(c);
    if (v) return v;

    return {
      criteria: c,
      status: '改善点',
      advice: '評価結果が不足していました。指示をより具体化してください。',
    };
  });
}

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

      const output =
        typeof (evaluationResponse as any).output === 'function'
          ? (evaluationResponse as any).output()
          : (evaluationResponse as any).output;

      if (output?.evaluations) {
        evaluations = normalizeEvaluations(output.evaluations);
      } else {
        console.error(
          '[evaluatePrompt] output is empty. raw text:',
          (evaluationResponse as any).text
        );
      }
    } catch (error) {
      console.error('Error parsing evaluations:', error);
      evaluations = normalizeEvaluations([]);
    }

    return { aiOutput, evaluations };
  }
);
