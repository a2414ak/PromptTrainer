'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Loader2, Sparkles, type LucideIcon } from 'lucide-react';
import { handleEvaluateMiniTest } from '@/app/actions';
import { useToast } from "@/hooks/use-toast";

type MiniTestCardProps = {
  id: 'A' | 'B';
  title: string;
  icon: LucideIcon;
  description: string;
  prompt: string;
  inputType: 'input' | 'textarea';
  placeholder: string;
  trainingContent: string;
  testName: string;
};

export default function MiniTestCard({
  id,
  title,
  icon: Icon,
  description,
  prompt,
  inputType,
  placeholder,
  trainingContent,
  testName
}: MiniTestCardProps) {
  const [inputValue, setInputValue] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!inputValue.trim() || isLoading) return;
    setIsLoading(true);
    setFeedback(null);
    try {
      const res = await handleEvaluateMiniTest(testName, trainingContent, inputValue);
      setFeedback(res);
    } catch (error) {
      console.error(`Error submitting test ${id}:`, error);
      toast({
        variant: "destructive",
        title: "評価エラー",
        description: "テストの評価中にエラーが発生しました。もう一度お試しください。",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && inputType === 'input' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <Card className="rounded-3xl border-primary/20 bg-card p-4 sm:p-8 shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-4">
          <Icon className="text-primary" size={32} />
          <h3 className="font-black text-2xl text-foreground">{title}</h3>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        <p className="text-lg text-slate-800 dark:text-slate-300">{description}</p>
        <div className="bg-muted p-5 rounded-xl text-muted-foreground font-bold border-l-8 border-primary font-code">
          {prompt}
        </div>
        
        {inputType === 'input' ? (
          <div className="flex gap-4">
            <Input
              className="flex-1 rounded-2xl border-2 border-input bg-background px-6 py-4 text-lg h-auto focus:border-primary focus:ring-primary text-foreground font-bold"
              placeholder={placeholder}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              disabled={isLoading}
              onKeyDown={handleKeyDown}
            />
            <Button
              onClick={handleSubmit}
              disabled={isLoading || !inputValue.trim()}
              className="font-black px-10 rounded-2xl text-lg h-auto shadow-lg shadow-primary/20"
              size="lg"
            >
              {isLoading ? <Loader2 className="animate-spin" /> : '送信'}
            </Button>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <Textarea
              className="w-full h-56 rounded-2xl border-2 border-input bg-background px-6 py-4 text-lg focus:border-primary focus:ring-primary text-foreground font-bold resize-none leading-relaxed"
              placeholder={placeholder}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              disabled={isLoading}
              onKeyDown={handleKeyDown}
            />
            <div className="flex justify-end">
              <Button
                onClick={handleSubmit}
                disabled={isLoading || !inputValue.trim()}
                className="font-black px-12 py-4 rounded-2xl text-lg h-auto shadow-xl shadow-primary/20"
                size="lg"
              >
                {isLoading ? <Loader2 className="animate-spin" /> : '評価する'}
              </Button>
            </div>
          </div>
        )}

        {feedback && (
          <div className="mt-4 p-6 rounded-2xl bg-primary/10 border-2 border-primary/30 animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center gap-3 mb-2">
              <Sparkles className="text-primary text-xl" />
              <span className="text-xs font-black uppercase tracking-widest text-primary">AIフィードバック</span>
            </div>
            <p className="text-lg text-slate-900 dark:text-slate-100 leading-loose">{feedback}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
