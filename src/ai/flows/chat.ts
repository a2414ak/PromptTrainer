'use server';

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const ChatHistorySchema = z.array(
  z.object({
    role: z.enum(['user', 'ai']),
    text: z.string(),
  })
);

const ChatRequestSchema = z.object({
  history: ChatHistorySchema,
  message: z.string(),
});

export async function getChatResponse(
  history: z.infer<typeof ChatHistorySchema>,
  message: string
): Promise<string> {
  return chatFlow({ history, message });
}

const chatPrompt = ai.definePrompt({
  name: 'chatPrompt',
  input: { schema: ChatRequestSchema },
  prompt: `あなたは、プロンプト エンジニアリング トレーニングのためのフレンドリーで役立つ AI メンターです。あなたの目標は、プロンプト エンジニアリングについて学習しているユーザーを支援することです。回答は簡潔で、励みになり、理解しやすいものにしてください。日本語で回答してください。

  会話の履歴は次のとおりです:
  {{#each history}}
  - {{role}}: {{text}}
  {{/each}}
  
  新しいユーザー メッセージ: {{{message}}}
  
  あなたの応答:`,
});

const chatFlow = ai.defineFlow(
  {
    name: 'chatFlow',
    inputSchema: ChatRequestSchema,
    outputSchema: z.string(),
  },
  async (input) => {
    const { text } = await chatPrompt(input);
    return text!;
  }
);
