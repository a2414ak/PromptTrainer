'use client';

import Image from 'next/image';
import { BUSINESS_EXAMPLES } from "@/lib/constants";
import type { BusinessExample } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface ExamplesSectionProps {
  onExampleSelect: (example: BusinessExample) => void;
}

export default function ExamplesSection({ onExampleSelect }: ExamplesSectionProps) {
  return (
    <section className="flex flex-col gap-10 pt-16 pb-16">
      <div className="flex flex-col gap-4 border-l-8 border-primary pl-6">
        <h3 className="font-black text-sm uppercase tracking-[0.2em] text-slate-700 dark:text-slate-400">似たシチュエーションの社内取り組み</h3>
        <p className="text-2xl font-black text-slate-800 dark:text-slate-200 font-headline">各シチュエーションで、有効なプロンプトを知りましょう</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {BUSINESS_EXAMPLES.map((ex) => (
          <Card
            key={ex.id}
            onClick={() => onExampleSelect(ex)}
            className="group cursor-pointer rounded-3xl bg-card p-0 overflow-hidden hover:shadow-2xl transition-all hover:border-primary border-2 border-transparent"
          >
            <div className="h-48 relative overflow-hidden">
              <Image
                src={ex.image}
                alt={ex.title}
                width={600}
                height={400}
                data-ai-hint={ex.imageHint}
                className="h-full w-full object-cover group-hover:scale-[1.05] transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </div>
            <CardHeader className="p-8">
              <CardTitle className="text-2xl mb-2 text-foreground group-hover:text-primary transition-colors">{ex.title}</CardTitle>
              <CardDescription className="text-lg text-slate-800 dark:text-slate-300 leading-relaxed line-clamp-2">{ex.description}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>
    </section>
  );
}
