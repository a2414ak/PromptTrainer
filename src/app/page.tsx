'use client';

import React, { useState, useEffect } from 'react';
import type { ReviewResult, BusinessExample, TaskScenarioLabel } from '@/lib/types';
import { handleGenerateAndReview } from '@/app/actions';
import { useToast } from "@/hooks/use-toast";

import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import StepOneSection from '@/components/app/step-one-section';
import StepTwoSection from '@/components/app/step-two-section';
import ExamplesSection from '@/components/app/examples-section';
import ExampleDialog from '@/components/app/example-dialog';
import FloatingChat from '@/components/app/floating-chat';

export default function Home() {
  const { toast } = useToast();
  
  // Application State
  const [selectedScenario, setSelectedScenario] = useState<TaskScenarioLabel>('メール作成');
  const [userPrompt, setUserPrompt] = useState('');
  const [isReviewLoading, setIsReviewLoading] = useState(false);
  const [reviewResult, setReviewResult] = useState<ReviewResult | null>(null);

  // Dialog State
  const [selectedExample, setSelectedExample] = useState<BusinessExample | null>(null);

  // Floating Chat State
  const [isChatOpen, setIsChatOpen] = useState(false);

  const isExampleOpen = !!selectedExample;

  // Handle ESC key for closing modals
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedExample(null);
        setIsChatOpen(false);
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  useEffect(() => {
    if (isExampleOpen) setIsChatOpen(false);
  }, [isExampleOpen]);

  const onGenerateAndReview = async () => {
    if (!userPrompt.trim() || isReviewLoading) return;
    setIsReviewLoading(true);
    setReviewResult(null);
    try {
      const result = await handleGenerateAndReview(selectedScenario, userPrompt);
      setReviewResult(result);
    } catch (error) {
      console.error('Error generating and reviewing prompt:', error);
      toast({
        variant: "destructive",
        title: "レビューエラー",
        description: "AIのレビュー中にエラーが発生しました。もう一度お試しください。",
      });
    } finally {
      setIsReviewLoading(false);
    }
  };

  const handleTryPrompt = (prompt: string) => {
    setUserPrompt(prompt);
    setSelectedExample(null);
    const step2Element = document.getElementById('step-2');
    if (step2Element) {
      step2Element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="relative flex flex-col items-center w-full min-h-screen">
      <Header />

      <main className="w-full max-w-5xl px-6 pt-12 flex flex-col gap-16">
        <div className="flex flex-col gap-4 text-center md:text-left">
          <h1 className="text-foreground text-4xl md:text-5xl font-black tracking-tight font-headline">
            生成AI研修　復習ページ
          </h1>
          <div className="text-slate-800 dark:text-slate-200 text-xl leading-relaxed">
            <p>ステップ１、ステップ２の課題を解いて、プロンプトエンジニアリングスキルを定着させましょう。</p>
            <p>間違っても大丈夫。生成AIがあなたに合ったフィードバックをします。</p>
            <p>疑問をAIメンターに相談することもできますよ。右下のボタンから気軽に聞いてくださいね。（チャット履歴は保存されません）</p>
            <p className="font-black text-primary mt-2">（所要時間目安：10分）</p>
          </div>
        </div>

        <StepOneSection />
        
        <StepTwoSection
          selectedScenario={selectedScenario}
          onScenarioChange={setSelectedScenario}
          userPrompt={userPrompt}
          onPromptChange={setUserPrompt}
          reviewResult={reviewResult}
          setReviewResult={setReviewResult}
          isReviewLoading={isReviewLoading}
          onGenerateAndReview={onGenerateAndReview}
        />

        <ExamplesSection onExampleSelect={setSelectedExample} />
      </main>

      <ExampleDialog 
        example={selectedExample}
        onClose={() => setSelectedExample(null)}
        onTryPrompt={handleTryPrompt}
      />

      <Footer />
    </div>
  );
}
