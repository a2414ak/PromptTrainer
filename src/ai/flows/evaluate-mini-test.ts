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

const evaluateMiniTestPrompt = ai.definePrompt({
  name: 'evaluateMiniTestPrompt',
  input: {schema: EvaluateMiniTestInputSchema},
  prompt: `あなたは、提供されたトレーニングコンテンツに基づいてミニテストに対するユーザーの回答を評価するAIアシスタントです。

  テスト名: {{{testName}}}
  トレーニングコンテンツ: {{{trainingContent}}}
  ユーザーの回答: {{{userAnswer}}}

  トレーニングコンテンツとの関連でユーザーの回答を評価し、概念をよりよく理解するのに役立つ建設的なフィードバックを提供してください。具体的かつ簡潔にしてください。
  `,
});

const evaluateMiniTestFlow = ai.defineFlow({
  name: 'evaluateMiniTestFlow',
  inputSchema: EvaluateMiniTestInputSchema,
  outputSchema: z.string(),
}, async (input) => {
  const {text} = await evaluateMiniTestPrompt(input);
  return text!;
});
