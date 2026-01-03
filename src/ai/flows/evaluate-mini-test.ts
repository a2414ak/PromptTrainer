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
  prompt: `あなたは、提供されたトレーニングコンテンツに基づいてミニテストに対するユーザーの回答を評価するAIアシスタントです。
このテストは、プロンプトの「構造化」に関するものです。

テスト名: {{{testName}}}
トレーニングコンテンツ: {{{trainingContent}}}
ユーザーの回答: {{{userAnswer}}}

ユーザーの回答が、元の非構造化プロンプトを「役割」「タスク」「条件」などを含む構造化されたプロンプトに修正できているかを評価してください。
フィードバックは、概念をよりよく理解するのに役立つように、建設的かつ具体的、簡潔にしてください。
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
