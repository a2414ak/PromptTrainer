import type { ReviewResult as GenkitReviewResult } from '@/ai/flows/ai-prompt-review';
import type { LucideIcon } from 'lucide-react';

export type TaskScenarioLabel =
  | 'メール作成'
  | '議事録作成'
  | '質問リスト作成'
  | 'グループワーク企画作成'
  | '情報収集';

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
};

export type Message = {
  role: 'user' | 'ai';
  text: string;
  timestamp: Date;
};

export type PromptCriteria =
  | '指示の明確さ'
  | '背景情報が整理されているか'
  | '出力形式の指定'
  | '構造化されているか';

export type PromptEvaluationStatus = '非常に良い' | '良好' | '改善点';

export type PromptEvaluation = {
  criteria: PromptCriteria;
  status: PromptEvaluationStatus;
  advice: string;
};

export type ReviewResult =
  Omit<GenkitReviewResult, 'evaluations'> & {
    evaluations: PromptEvaluation[];
  };
