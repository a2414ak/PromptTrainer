// src/ai/ai-chat-assistant.ts
'use server';
/**
 * @fileOverview プロンプトエンジニアリングに関するユーザーの質問に答えるためのAIチャットアシスタントフローを実装します。
 *
 * - getChatResponse - チャットメッセージとユーザー入力を受け取り、AIの応答を返す関数。
 * - ChatInputType - getChatResponse関数の入力タイプ。
 * - ChatOutputType - getChatResponse関数の戻り値のタイプ。
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const MessageSchema = z.object({
  role: z.enum(['user', 'ai']),
  text: z.string(),
  timestamp: z.date(),
});

const ChatInputSchema = z.object({
  messages: z.array(MessageSchema),
  userInput: z.string().describe('応答する最新のユーザーメッセージ。'),
});
export type ChatInputType = z.infer<typeof ChatInputSchema>;

const ChatOutputSchema = z.string();
export type ChatOutputType = z.infer<typeof ChatOutputSchema>;

export async function getChatResponse(messages: ChatInputType['messages'], userInput: string): Promise<string> {
  return chatAssistantFlow({
    messages,
    userInput,
  });
}

const chatAssistantPrompt = ai.definePrompt({
  name: 'chatAssistantPrompt',
  input: { schema: ChatInputSchema },
  output: { schema: ChatOutputSchema },
  prompt: `あなたはプロンプトエンジニアリングに特化したAIチャTアシスタントです。
  あなたの目標は、ユーザーがプロンプトエンジニアリングの概念とベストプラクティスを理解するのを助けることです。
  あなたはガイダンスを提供し、質問に答え、プロンプトを改善するための提案をすべきです。
  フレンドリーで親切なトーンを維持してください。

  これが現在のチャット履歴です:
  {{#each messages}}
    {{#ifEquals role "user"}}ユーザー: {{text}}
    {{else}}AI: {{text}}{{/ifEquals}}
  {{/each}}

  ユーザー入力: {{{userInput}}}

  AIの応答:`,
  // safetySettingsの設定は必要に応じて調整できます。
  config: {
    safetySettings: [
      {
        category: 'HARM_CATEGORY_HATE_SPEECH',
        threshold: 'BLOCK_ONLY_HIGH',
      },
      {
        category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
        threshold: 'BLOCK_NONE',
      },
      {
        category: 'HARM_CATEGORY_HARASSMENT',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE',
      },
      {
        category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
        threshold: 'BLOCK_LOW_AND_ABOVE',
      },
    ],
  },
});

const chatAssistantFlow = ai.defineFlow(
  {
    name: 'chatAssistantFlow',
    inputSchema: ChatInputSchema,
    outputSchema: ChatOutputSchema,
  },
  async input => {
    const { output } = await chatAssistantPrompt(input);
    return output!;
  }
);
