import type { ReviewResult as GenkitReviewResult } from '@/ai/flows/ai-prompt-review';
import type { LucideIcon } from 'lucide-react';

export type TaskScenarioLabel = 'メール作成' | '議事録作成' | 'ブレインストーミング' | '情報収集';

export type TaskScenario = {
  label: TaskScenarioLabel;
  icon: LucideIcon;
  description: string;
};

export type BusinessExample = {
  id: string;
  title: string;
  description: string;
  image: string;
  imageHint: string;
  recommendedPrompt: string;
  expectedEffect: string;
};

export type Message = {
  role: 'user' | 'ai';
  text: string;
  timestamp: Date;
};

export type ReviewResult = GenkitReviewResult;
