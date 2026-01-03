'use client';

import Image from 'next/image';
import { useMemo, useState } from 'react';
import { BUSINESS_EXAMPLES } from '@/lib/constants';
import type { BusinessExample } from '@/lib/types';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface ExamplesSectionProps {
  onExampleSelect: (example: BusinessExample) => void;
}

const LABELS = ['業務効率化', 'ナレッジ', '組織', '営業', 'プロジェクト', '人材育成', '計画'] as const;

type SuggestTitleItem = {
  id: string;
  title: string;
  category?: string;
  keywords?: string;
};

type SuggestTitlesOk = {
  ok: true;
  suggestions: SuggestTitleItem[];
};

export default function ExamplesSection({ onExampleSelect }: ExamplesSectionProps) {
  const [activeLabels, setActiveLabels] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [examples, setExamples] = useState<BusinessExample[]>(() => [...BUSINESS_EXAMPLES]);

  const queryText = useMemo(() => activeLabels.join(' '), [activeLabels]);

  const toggleLabel = (label: string) => {
    setActiveLabels((prev) =>
      prev.includes(label) ? prev.filter((x) => x !== label) : [...prev, label]
    );
  };

  const fetchSuggestTitles = async (): Promise<SuggestTitleItem[]> => {
    const res = await fetch('/api/upstash/suggest-titles', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: queryText, topK: 3 }),
    });

    if (!res.ok) throw new Error('suggest-titles failed');

    const data = (await res.json()) as SuggestTitlesOk;
    return data.suggestions;
  };

  const fetchGeneratedPrompt = async (item: SuggestTitleItem) => {
    const res = await fetch('/api/ai/generate-prompt', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: item.title,
        category: item.category,
        keywords: item.keywords,
        themes: activeLabels,
      }),
    });
  
    const data = await res.json().catch(() => null);
  
    if (!res.ok || !data?.ok) {
      throw new Error(data?.error || 'generate-prompt failed');
    }
  
    return {
      prompt: data.prompt,
      expectedEffect: data.expectedEffect,
    };
  };
  

  const reloadByThemes = async () => {
    if (!queryText) return;

    setIsLoading(true);

    try {
      const suggestions = await fetchSuggestTitles();

      // 先にカードを3件分差し替え（仮）
      setExamples(
        suggestions.map((s, i) => {
          const fallback = BUSINESS_EXAMPLES[i % BUSINESS_EXAMPLES.length];
          return {
            id: s.id,
            title: s.title,
            description: '（生成中…）',
            image: fallback.image,
            imageHint: fallback.imageHint,
          };
        })
      );

      // 順番に生成してカード更新
      for (let i = 0; i < suggestions.length; i++) {
        const s = suggestions[i];
        const out = await fetchGeneratedPrompt(s);

        setExamples((prev) => {
          const next = [...prev];
          const fallback = BUSINESS_EXAMPLES[i % BUSINESS_EXAMPLES.length];

          next[i] = {
            id: s.id,
            title: s.title,
            description: out.expectedEffect,
            image: fallback.image,
            imageHint: fallback.imageHint,
            recommendedPrompt: out.prompt,
            expectedEffect: out.expectedEffect,
          };

          return next;
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="flex flex-col gap-10 pt-16 pb-16">
      <div className="flex flex-col gap-4 border-l-8 border-primary pl-6">
        <h3 className="font-black text-sm uppercase tracking-[0.2em] text-slate-700 dark:text-slate-400">
          似たシチュエーションの社内取り組み
        </h3>
        <p className="text-2xl font-black text-slate-800 dark:text-slate-200 font-headline">
          各シチュエーションで、有効なプロンプトを知りましょう
        </p>
      </div>

      <div className="flex flex-wrap gap-3 pt-2">
        {LABELS.map((label) => {
          const isActive = activeLabels.includes(label);
          return (
            <button
              key={label}
              type="button"
              data-active={isActive ? 'true' : 'false'}
              onClick={() => toggleLabel(label)}
              className="rounded-full border border-slate-300 px-4 py-1.5 text-sm font-semibold
                         data-[active=true]:bg-primary data-[active=true]:text-white"
            >
              {label}
            </button>
          );
        })}

        <button
          type="button"
          onClick={reloadByThemes}
          disabled={isLoading}
          className="basis-full mt-2 rounded-xl bg-primary px-5 py-2.5
                     text-sm font-bold text-white disabled:opacity-60"
        >
          選択したテーマに基づき、再読み込みする
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {examples.map((ex) => (
          <Card
            key={ex.id}
            onClick={() => onExampleSelect(ex)}
            className="cursor-pointer rounded-3xl overflow-hidden"
          >
            <div className="h-48 relative">
              <Image
                src={ex.image}
                alt={ex.title}
                width={600}
                height={400}
                className="h-full w-full object-cover"
              />
            </div>
            <CardHeader className="p-8">
              <CardTitle className="text-2xl mb-2">{ex.title}</CardTitle>
              <CardDescription className="text-lg leading-relaxed">
                {ex.description}
              </CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>
    </section>
  );
}
