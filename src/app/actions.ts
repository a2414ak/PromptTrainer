'use server';

import { generateAndReview, type ReviewResult } from '@/ai/flows/ai-prompt-review';
import { evaluateMiniTest } from '@/ai/flows/evaluate-mini-test';
import { getChatResponse } from '@/ai/flows/chat';
import type { Message } from '@/lib/types';

export async function handleGenerateAndReview(
  scenario: string,
  prompt: string
): Promise<ReviewResult> {
  return await generateAndReview(scenario, prompt);
}

export async function handleEvaluateMiniTest(
  testName: string,
  trainingContent: string,
  userAnswer: string
): Promise<string> {
  return await evaluateMiniTest(testName, trainingContent, userAnswer);
}

export async function handleChatResponse(
  history: Omit<Message, 'timestamp'>[],
  newMessage: string
): Promise<string> {
  // The AI prompt expects a list of { role, text }, so we map the history
  const mappedHistory = history.map(({ role, text }) => ({ role, text }));
  return await getChatResponse(mappedHistory, newMessage);
}
