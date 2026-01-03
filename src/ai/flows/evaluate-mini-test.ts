'use server';

/**
 * @fileOverview このファイルは、ミニテストに対するユーザーの回答を評価し、AIを使用してフィードバックを提供するためのGenkitフローを定義します。
 *
 * - evaluateMiniTest - ユーザーの回答を評価し、フィードバックを提供する関数。
 * - EvaluateMiniTestInput - evaluateMiniTest関数の入力タイプ。
 * - EvaluateMiniTestOutput - evaluateMiniTest関数の戻り値のタイプ。
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const EvaluateMiniTestInputSchema = z.object({
  testName: z.string().describe('ミニテストの名前。'),
  trainingContent: z.string().describe('テストに関連するトレーニングコンテンツ。'),
  userAnswer: z.string().describe('ユーザーが提供したテストの回答。'),
});

export type EvaluateMiniTestInput = z.infer<typeof EvaluateMiniTestInputSchema>;
export type EvaluateMiniTestOutput = string;

export async function evaluateMiniTest(testName: string, trainingContent: string, userAnswer: string): Promise<EvaluateMiniTestOutput> {
  return evaluateMiniTestFlow({
    testName,
    trainingContent,
    userAnswer,
  });
}

const evaluateMiniTestAForShijiPrompt = ai.definePrompt({
  name: 'evaluateMiniTestAForShijiPrompt',
  input: {schema: EvaluateMiniTestInputSchema},
  prompt: `ユーザーはミニテストAに「指示」と回答しました。これは正解です。

以下のフィードバックを生成してください：
大正解！良いプロンプトは、何をすべきか（命令・指示）を明確にすることが重要です。

条件：
- フィードバックは、50字以内にしてください。
- 自然な日本語にしてください。
- フレンドリーで建設的な回答にしてください。
`,
});

const evaluateMiniTestADefaultPrompt = ai.definePrompt({
  name: 'evaluateMiniTestADefaultPrompt',
  input: {schema: EvaluateMiniTestInputSchema},
  prompt: `ユーザーはミニテストAに「指示」以外の回答をしました。これは不正解です。

以下のうち、いずれか１つのフィードバックを生成してください：
- 回答が「指示」と近い単語の場合：おしい！研修スライドには、「良いプロンプトは、命令・指示が明確」だと書かれています。
- 回答が不正解の場合：研修スライドを見直してみましょう！「良いプロンプトは、命令・指示が明確」だと書かれています。

条件：
- フィードバックは、50字以内にしてください。
- 自然な日本語にしてください。
- フレンドリーで建設的な回答にしてください。
`,
});

const evaluateMiniTestBPrompt = ai.definePrompt({
  name: 'evaluateMiniTestBPrompt',
  input: {schema: EvaluateMiniTestInputSchema},
  prompt: `あなたは、提供されたトレーニングコンテンツに基づいて、
ミニテストに対するユーザーの回答を評価するAIアシスタントです。

このテストは、「プロンプトの構造化」ができているかを評価することが目的です。

ユーザーの回答:
{{{userAnswer}}}

以下の観点で評価してください。

【評価観点】
- ユーザーの回答が、非構造化な依頼文を
  「命令（タスク）」「条件」「テイスト／制約」などの要素に分解し、
  見出し・ラベル・記号（例：#命令：#条件：#テイスト：など）を用いて
  明示的に構造化しているか。
- 内容の正確さや表現の巧拙ではなく、
  「構造が分かりやすく整理されているか」を重視する。

【判定ルール】
- 「命令（何をさせたいか）」が明確に示されており、
  かつ条件やテイスト等が区別されて記述されていれば「正解」とする。
- 構造が不十分、または要素が混在している場合は「不正解」とする。

【出力】
- まず「正解！」または「残念、不正解…。」を明示する。
- 次に、1〜2文で簡潔かつ建設的なフィードバックを述べる。
- 学習者が「どこが構造化できていたか／不足していたか」を理解できる表現にする。
- 自然な日本語で回答すること。
- 文体は、フレンドリーで前向きにすること。
- 110字以内で回答すること。
`,
});


const evaluateMiniTestFlow = ai.defineFlow({
  name: 'evaluateMiniTestFlow',
  inputSchema: EvaluateMiniTestInputSchema,
  outputSchema: z.string(),
}, async (input) => {
  let result;
  if (input.testName.includes('A')) {
    if (input.userAnswer.trim() === '指示') {
      result = await evaluateMiniTestAForShijiPrompt(input);
    } else {
      result = await evaluateMiniTestADefaultPrompt(input);
    }
  } else if (input.testName.includes('B')) {
    result = await evaluateMiniTestBPrompt(input);
  } else {
    throw new Error(`Unsupported test name: ${input.testName}`);
  }
  return result.text!;
});
