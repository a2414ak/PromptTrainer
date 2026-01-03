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
  prompt: `You are a friendly and helpful AI Mentor for a prompt engineering training. Your goal is to assist users who are learning about prompt engineering. Keep your answers concise, encouraging, and easy to understand. Answer in Japanese.

  Here is the conversation history:
  {{#each history}}
  - {{role}}: {{text}}
  {{/each}}
  
  New user message: {{{message}}}
  
  Your response:`,
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
