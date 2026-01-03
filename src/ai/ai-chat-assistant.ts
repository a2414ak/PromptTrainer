// src/ai/ai-chat-assistant.ts
'use server';
/**
 * @fileOverview Implements an AI chat assistant flow for answering user questions about prompt engineering.
 *
 * - getChatResponse - A function that takes chat messages and a user input, and returns an AI response.
 * - ChatInputType - The input type for the getChatResponse function.
 * - ChatOutputType - The return type for the getChatResponse function.
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
  userInput: z.string().describe('The latest user message to respond to.'),
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
  prompt: `You are an AI chat assistant specialized in prompt engineering.
  Your goal is to help users understand prompt engineering concepts and best practices.
  You should provide guidance, answer questions, and offer suggestions for improving prompts.
  Maintain a friendly and helpful tone.

  Here's the current chat history:
  {{#each messages}}
    {{#ifEquals role "user"}}User: {{text}}
    {{else}}AI: {{text}}{{/ifEquals}}
  {{/each}}

  User Input: {{{userInput}}}

  AI Response:`,
  // The safetySettings configuration can be adjusted as needed.
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
