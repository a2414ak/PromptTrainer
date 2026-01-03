import { Separator } from "@/components/ui/separator"
import MiniTestCard from "./mini-test-card"
import { FileText, SlidersHorizontal } from "lucide-react"

export default function StepOneSection() {
  return (
    
    <section id="step-1" className="flex flex-col gap-10 scroll-mt-24">
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-4">
          <div className="bg-primary/20 text-foreground p-3 rounded-xl flex items-center justify-center size-12">
            <span className="text-2xl font-black">1</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-black tracking-tight text-foreground font-headline">ステップ 1：良いプロンプトの条件を思い出そう</h2>
        </div>
        <div className="ml-16 text-base text-slate-900 dark:text-slate-200 leading-relaxed bg-white/50 dark:bg-card p-6 rounded-2xl border-2 border-slate-200 dark:border-border shadow-sm">
          <div className="font-bold text-slate-900 dark:text-white">
            <p className="text-primary text-lg">★良いプロンプトの条件</p>
            <div className="mt-3 space-y-2 text-lg">
              <p>① 命令・指示が明確</p>
              <p>② 文脈や背景情報が整理されている</p>
              <p>③ 出力形式が指定されている</p>
              <p>④ 構造化されている</p>
            </div>
          </div>
        </div>
      </div>

      <Separator />

      <div className="flex flex-col gap-8">
        <MiniTestCard
          id="A"
          title="ミニテストA：研修理解"
          icon={FileText}
          description="〇〇に入る漢字２文字は何か。研修スライドに基づいて回答してください。"
          prompt="良いプロンプトは、命令・〇〇が明確である。"
          inputType="input"
          placeholder="ここに解答を入力..."
          trainingContent="研修内容：良いプロンプトは、命令・条件が明確である。〇〇に入る漢字文字は何か？（正解は「条件」です）"
          testName="ミニテストA：研修理解"
        />

        <MiniTestCard
          id="B"
          title="ミニテストB：構造化"
          icon={SlidersHorizontal}
          description="次のプロンプトを、構造化されたプロンプトに修正してください。"
          prompt="「報告メール作成。今日の進捗と課題を伝えたい。例文がほしい。文体はビジネスカジュアル。」"
          inputType="textarea"
          placeholder="ここに回答を入力..."
          trainingContent="次の非構造化プロンプトを、役割・タスク・条件などを含む構造化されたプロンプトに修正してください：『報告メール作成。今日の進捗と課題を伝えたい。例文がほしい。文体はビジネスカジュアル。』"
          testName="ミニテストB：プロンプト構造化"
        />
        
        <div className="mt-6 p-6 text-center">
          <p className="text-xl font-black text-slate-800 dark:text-slate-200 leading-relaxed">
            良いプロンプトの条件を思い出せましたか？
            <br />
            ステップ２では、実際にプロンプトを作成してみましょう！
          </p>
        </div>
      </div>
    </section>
  );
}
