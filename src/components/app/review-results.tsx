'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bot, FileEdit, MessageSquareQuote } from "lucide-react";
import type { ReviewResult } from "@/lib/types";

const CRITERIA_ORDER = [
  '指示の明確さ',
  '背景情報が整理されているか',
  '出力形式の指定',
  '構造化されているか',
] as const;

type Criteria = typeof CRITERIA_ORDER[number];
type Status = '非常に良い' | '良好' | '改善点';

type Evaluation = {
  criteria: Criteria;
  status: Status;
  advice: string;
};

interface ReviewResultsProps {
  reviewResult: ReviewResult;
  onRetry: () => void;
}

function normalizeEvaluations(evaluations: any[]): Evaluation[] {
  const map = new Map<Criteria, { status: Status; advice: string }>();

  for (const ev of Array.isArray(evaluations) ? evaluations : []) {
    // criteria が固定4つのどれかだけ拾う（それ以外は無視）
    if (CRITERIA_ORDER.includes(ev?.criteria)) {
      map.set(ev.criteria, {
        status: (ev?.status ?? '改善点') as Status,
        advice: String(ev?.advice ?? ''),
      });
    }
  }

  // 4つ必ず返す（不足は補完）
  return CRITERIA_ORDER.map((c) => {
    const v = map.get(c);
    if (v) return { criteria: c, ...v };
    return {
      criteria: c,
      status: '改善点',
      advice: '評価結果が不足していました。プロンプトをより具体的にしてください。',
    };
  });
}

export default function ReviewResults({ reviewResult, onRetry }: ReviewResultsProps) {
  const normalizedEvaluations = normalizeEvaluations(reviewResult.evaluations);

  const hasImprovementNeeded = normalizedEvaluations.some(ev => ev.status === '改善点');

  const getStatusBadge = (status: Status) => {
    switch (status) {
      case '非常に良い':
        return <Badge className="bg-green-100 text-green-900 border-green-300 hover:bg-green-100 text-sm">◎ 非常に良い</Badge>;
      case '良好':
        return <Badge className="bg-blue-100 text-blue-900 border-blue-300 hover:bg-blue-100 text-sm">〇 良好</Badge>;
      case '改善点':
        return <Badge className="bg-yellow-100 text-yellow-900 border-yellow-300 hover:bg-yellow-100 text-sm">△ 改善点</Badge>;
    }
  };

  return (
    <div className="flex flex-col gap-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid lg:grid-cols-2 gap-10">
        <Card className="rounded-3xl border-2 border-border bg-card overflow-hidden flex flex-col shadow-lg min-h-[500px]">
          <CardHeader className="bg-muted px-8 py-5 border-b-2 border-border flex flex-row justify-between items-center">
            <CardTitle className="font-black text-xl text-foreground flex items-center gap-3">
              <Bot className="text-primary" size={24} />
              AIの出力
            </CardTitle>
            <span className="text-xs text-muted-foreground font-black uppercase tracking-widest">プロンプトへの回答</span>
          </CardHeader>
          <CardContent className="p-10 text-lg leading-loose text-foreground whitespace-pre-wrap font-bold flex-1">
            {reviewResult.aiOutput}
          </CardContent>
        </Card>

        <div className="flex flex-col gap-4">
          <Card className="rounded-3xl border-2 border-border bg-card overflow-hidden flex flex-col shadow-lg h-fit">
            <CardHeader className="bg-muted px-8 py-5 border-b-2 border-border">
              <CardTitle className="font-black text-xl text-foreground flex items-center gap-3">
                <MessageSquareQuote className="text-primary" size={24} />
                評価とフィードバック
              </CardTitle>
            </CardHeader>

            <div className="overflow-x-auto">
              <Table className="w-full text-base text-left">
                <TableHeader className="text-sm font-black uppercase tracking-widest text-muted-foreground bg-slate-200 dark:bg-white/10">
                  <TableRow>
                    <TableHead className="px-8 py-5 w-[30%]">評価項目</TableHead>
                    <TableHead className="px-8 py-5 w-[30%]">ステータス</TableHead>
                    <TableHead className="px-8 py-5 w-[40%]">アドバイス</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody className="divide-y-2 divide-border">
                  {normalizedEvaluations.map((ev, i) => (
                    <TableRow key={i} className="group hover:bg-muted/50 transition-colors">
                      <TableCell className="px-8 py-6 font-black text-foreground align-top leading-relaxed">
                        {ev.criteria}
                      </TableCell>
                      <TableCell className="px-8 py-6 align-top">
                        {getStatusBadge(ev.status)}
                      </TableCell>
                      <TableCell className="px-8 py-6 text-slate-900 dark:text-slate-200 text-base leading-loose align-top">
                        {ev.advice}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>

              </Table>
            </div>

            <div className="p-4 bg-muted border-t-2 border-border text-center">
              <Button
                variant="link"
                onClick={onRetry}
                className="text-sm text-primary font-black uppercase tracking-widest hover:brightness-110"
              >
                <FileEdit className="mr-2 h-4 w-4" />
                プロンプトを修正して再試行
              </Button>
            </div>
          </Card>

          <div className={`rounded-3xl border-2 p-8 shadow-2xl text-center transition-colors duration-300 ${
            hasImprovementNeeded
              ? 'border-yellow-300 bg-yellow-50 dark:bg-yellow-900/20'
              : 'border-primary bg-primary/10'
          }`}>
            <p className="text-xl font-black text-foreground leading-loose">
              {hasImprovementNeeded
                ? 'すべて〇以上になるまで繰り返しましょう！'
                : 'おつかれさま！生成は何度もできます。いろいろなプロンプトを作ってみましょう！'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
