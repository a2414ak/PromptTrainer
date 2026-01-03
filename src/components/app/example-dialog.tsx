'use client';

import Image from 'next/image';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Terminal, TrendingUp } from "lucide-react";
import type { BusinessExample } from "@/lib/types";

interface ExampleDialogProps {
  example: BusinessExample | null;
  onClose: () => void;
  onTryPrompt: (prompt: string) => void;
}

export default function ExampleDialog({ example, onClose, onTryPrompt }: ExampleDialogProps) {
  if (!example) return null;

  return (
    <Dialog open={!!example} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl p-0 rounded-[40px] grid-cols-1 md:grid-cols-3 gap-0 border-2">
        <div className="hidden md:block md:col-span-1 h-full min-h-[400px] relative">
          <Image
            src={example.image}
            alt={example.title}
            fill
            data-ai-hint={example.imageHint}
            className="object-cover rounded-l-[38px]"
          />
        </div>
        <ScrollArea className="md:col-span-2 h-[90vh] md:h-auto md:max-h-[90vh]">
          <div className="p-8 md:p-12 flex flex-col gap-8">
            <DialogHeader>
              <DialogTitle className="text-4xl font-black tracking-tight text-foreground">{example.title}</DialogTitle>
              <span className="text-xs font-black uppercase tracking-widest text-primary pt-2">Case Study Details</span>
            </DialogHeader>

            <div className="flex flex-col gap-8">
              <div className="flex flex-col gap-3">
                <h4 className="text-sm font-black uppercase tracking-widest text-slate-700 dark:text-slate-400">解説</h4>
                <p className="text-xl text-slate-900 dark:text-slate-100 leading-loose">{example.description}</p>
              </div>

              <div className="flex flex-col gap-4 bg-muted p-8 rounded-3xl border-2 border-border shadow-inner">
                <h4 className="text-sm font-black uppercase tracking-widest text-primary flex items-center gap-3">
                  <Terminal size={20} />
                  推奨プロンプト案
                </h4>
                <p className="text-lg text-foreground italic leading-loose font-code whitespace-pre-wrap">
                  {example.recommendedPrompt}
                </p>
              </div>

              <div className="flex flex-col gap-3">
                <h4 className="text-sm font-black uppercase tracking-widest text-slate-700 dark:text-slate-400">期待される効果</h4>
                <div className="flex items-center gap-4 text-2xl font-black text-foreground">
                  <TrendingUp className="text-primary" size={32} />
                  {example.expectedEffect}
                </div>
              </div>
            </div>

            <DialogFooter className="mt-6 pt-8 border-t-2 border-border flex-col sm:flex-col md:flex-row gap-4">
              <Button
                onClick={() => onTryPrompt(example.recommendedPrompt)}
                className="flex-1 rounded-2xl py-6 text-xl h-auto"
                size="lg"
              >
                このプロンプトを試す
              </Button>
              <Button
                variant="outline"
                onClick={onClose}
                className="px-10 border-4 border-input font-black text-sm uppercase tracking-widest rounded-2xl py-6 text-foreground h-auto"
                size="lg"
              >
                閉じる
              </Button>
            </DialogFooter>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
