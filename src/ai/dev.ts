import { GenkitError, run } from '@genkit-ai/core';
import {
  generate,
  GenerationCommonConfig,
  geminiPro,
  googleAI,
} from '@genkit-ai/googleai';
import { genkit, configure } from '@genkit-ai/core';
import { firebase } from '@genkit-ai/firebase';
import {
  dotprompt,
  prompt,
  definePrompt,
  loadPrompt,
} from '@genkit-ai/dotprompt';
import { z } from 'zod';
import { text } from '@genkit-ai/dotprompt/v1';
import * as dev from 'dotenv';
dev.config({ path: '.env.local' });

// This is a sample only. Do not use in production.
configure({
  plugins: [
    firebase(),
    googleAI({ apiKey: process.env.GOOGLE_API_KEY }),
    dotprompt(),
  ],
  logLevel: 'debug',
  enableTracingAndMetrics: true,
});

export const simpleModel = geminiPro;
export const simpleModelConfig: GenerationCommonConfig = {
  temperature: 0.3,
};
