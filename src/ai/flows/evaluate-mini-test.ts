'use server';

/**
 * @fileOverview This file defines a Genkit flow for evaluating user answers to mini-tests
 * and providing feedback using AI.
 *
 * - evaluateMiniTest - A function that evaluates the user's answer and provides feedback.
 * - EvaluateMiniTestInput - The input type for the evaluateMiniTest function.
 * - EvaluateMiniTestOutput - The return type for the evaluateMiniTest function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const EvaluateMiniTestInputSchema = z.object({
  testName: z.string().describe('The name of the mini-test.'),
  trainingContent: z.string().describe('The relevant training content for the test.'),
  userAnswer: z.string().describe('The user provided answer to the test.'),
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
  prompt: `You are an AI assistant tasked with evaluating user answers to mini-tests based on provided training content.

  Test Name: {{{testName}}}
  Training Content: {{{trainingContent}}}
  User Answer: {{{userAnswer}}}

  Evaluate the user's answer in relation to the training content and provide constructive feedback to help them understand the concepts better. Be specific and concise.
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
