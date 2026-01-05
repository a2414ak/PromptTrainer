'use client';

import { SCENARIOS } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Info, Loader2, Sparkles } from "lucide-react";
import type { ReviewResult, TaskScenarioLabel } from "@/lib/types";
import ReviewResults from "./review-results";
import { analytics } from '@/lib/firebase';
import { logEvent } from 'firebase/analytics';

interface StepTwoSectionProps {
  selectedScenario: TaskScenarioLabel;
  onScenarioChange: (scenario: TaskScenarioLabel) => void;
  userPrompt: string;
  onPromptChange: (prompt: string) => void;
  reviewResult: ReviewResult | null;
  setReviewResult: (result: ReviewResult | null) => void;
  isReviewLoading: boolean;
  onGenerateAndReview: () => void;
}

export default function StepTwoSection({
  selectedScenario,
  onScenarioChange,
  userPrompt,
  onPromptChange,
  reviewResult,
  setReviewResult,
  isReviewLoading,
  onGenerateAndReview,
}: StepTwoSectionProps) {
  
  const currentScenarioData = SCENARIOS.find(s => s.label === selectedScenario);

  const handleRetry = () => {
    setReviewResult(null);
    const promptEditor = document.getElementById('prompt-editor');
    promptEditor?.focus();
  }

  return (
    <section id="step-2" className="flex flex-col gap-10 pt-6 scroll-mt-24">
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-4">
          <div className="bg-primary/20 text-foreground p-3 rounded-xl flex items-center justify-center size-12">
            <span className="text-2xl font-black">2</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-black tracking-tight text-foreground font-headline">ステップ 2：プロンプトを作成しよう</h2>
        </div>
        <div className="ml-16 text-lg text-slate-900 dark:text-slate-200 leading-loose bg-white/50 dark:bg-card p-6 rounded-2xl border-2 border-border shadow-sm">
          <p>課題を読んで、実際にプロンプトを作成してみましょう！</p>
          <p>生成AIが良いプロンプトの条件を満たしているか三段階でチェックします。</p>
          <p>すべて「〇良好」か「◎非常に良い」が取れるまで、繰り返し解いてみましょう。</p>
        </div>
      </div>

      <div className="flex flex-col gap-8">
        <div className="flex flex-col gap-6">
          <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-700 dark:text-slate-400">シチュエーションを選択</h3>
          <div className="flex flex-wrap gap-4">
            {SCENARIOS.map((s) => {
              const Icon = s.icon;
              return (
                <Button
                  key={s.label}
                  onClick={async () => {
                    const analyticsInstance = await analytics;
                    if (analyticsInstance) {
                      logEvent(analyticsInstance, 'scenario_button_clicked', { scenario: s.label });
                    }
                    onScenarioChange(s.label)
                  }}
                  variant={selectedScenario === s.label ? 'default' : 'outline'}
                  className={`flex items-center gap-3 rounded-2xl border-2 px-8 py-4 transition-all text-lg font-black h-auto ${
                    selectedScenario === s.label
                      ? 'border-primary bg-primary/20 text-foreground ring-4 ring-primary/20'
                      : 'border-input bg-card text-muted-foreground hover:bg-muted'
                  }`}
                >
                  <Icon className="text-2xl" size={24} />
                  {s.label}
                </Button>
              );
            })}
          </div>
        </div>

        {currentScenarioData && (
          <div className="p-8 rounded-3xl bg-card border-2 border-primary/30 shadow-md animate-in fade-in slide-in-from-left-2">
            <div className="flex items-center gap-3 mb-3">
              <Info className="text-primary" size={24} />
              <h4 className="font-black text-xl text-foreground">シチュエーション：{selectedScenario}</h4>
            </div>
            <p className="text-lg text-slate-900 dark:text-slate-300 leading-loose">
              {currentScenarioData.description}
            </p>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-8">
        <div className="relative group">
          <Textarea
            id="prompt-editor"
            value={userPrompt}
            onChange={(e) => onPromptChange(e.target.value)}
            className="w-full h-80 rounded-3xl border-2 border-input bg-card p-10 text-xl shadow-inner focus:border-primary focus:ring-primary text-foreground font-code resize-none leading-relaxed transition-all"
            placeholder={`ここに回答を入力...`}
          />
        </div>

        <div className="flex justify-end">
          <Button
            onClick={async () => {
              const analyticsInstance = await analytics;
              if (analyticsInstance) {
                logEvent(analyticsInstance, 'generate_and_review_button_clicked');
              }
              onGenerateAndReview();
            }}
            disabled={isReviewLoading || !userPrompt.trim()}
            className="group relative disabled:opacity-50 font-black rounded-3xl px-16 py-6 transition-all active:scale-95 shadow-2xl shadow-primary/40 h-auto"
            size="lg"
          >
            <div className="relative flex items-center gap-4 text-xl">
              {isReviewLoading ? 
                <Loader2 className="text-2xl animate-spin" /> : 
                <Sparkles className="text-2xl group-hover:rotate-12 transition-transform" />
              }
              {isReviewLoading ? '解析中...' : '生成する'}
            </div>
          </Button>
        </div>
      </div>

      {isReviewLoading && (
         <div className="flex justify-center items-center gap-4 my-10">
          <Loader2 className="size-8 animate-spin text-primary" />
          <p className="text-lg text-muted-foreground">AIがレビューを生成しています...</p>
        </div>
      )}

      {reviewResult && (
        <ReviewResults reviewResult={reviewResult} onRetry={handleRetry} />
      )}
    </section>
  );
}
