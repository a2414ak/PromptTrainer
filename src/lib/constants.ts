import { Mail, BookText, HelpCircle, Users, Search } from 'lucide-react';
import type { TaskScenario, BusinessExample } from './types';
import { PlaceHolderImages } from './placeholder-images';

export const SCENARIOS: TaskScenario[] = [
  {
    label: 'メール作成',
    icon: Mail,
    description: '課題：取引先へ、会議日程変更を丁寧に依頼するビジネスメールを作成してください。　ヒント：緊急性、件名などを構造化したプロンプトを作成することが重要です。',
  },
  {
    label: '議事録作成',
    icon: BookText,
    description: '課題：「4/3 ・明日面談。・この後Aさんに連絡。事前に打ち合わせするため」という会議のメモから、整形された議事録を作成してください。　ヒント：決定事項、日時などを構造化したプロンプトを作成することが重要です。',
  },
  {
    label: '質問リスト作成',
    icon: HelpCircle,
    description: '課題：あなたは突然、新しいタスクを割り振られてしまいました。この後、会議で詳細を説明してもらう手筈です。会議中に確認するべきことのリストを生成してください。　ヒント：あなたの状況などを構造化したプロンプトを作成することが重要です。',
  },
  {
    label: 'グループワーク企画作成',
    icon: Users,
    description: '課題：あなたの所属チームで行う、グループワークの企画案を作成してください。　ヒント：テーマ、目的、参加者などを構造化したプロンプトを作成することが重要です。',
  },
];

const findImage = (id: string) => {
  const img = PlaceHolderImages.find((p) => p.id === id);
  if (!img) {
    return {
      imageUrl: 'https://picsum.photos/seed/default/600/400',
      imageHint: 'office business'
    }
  }
  return { imageUrl: img.imageUrl, imageHint: img.imageHint };
};

export const BUSINESS_EXAMPLES: BusinessExample[] = [
  {
    id: 'example-1',
    title: '定例会議アジェンダ作成',
    description: '毎週のチーム定例会議のアジェンダ作成を自動化。主要トピックと時間を指定するだけで、構造化されたアジェンダを即座に生成します。',
    image: findImage('example-1').imageUrl,
    imageHint: findImage('example-1').imageHint,
    recommendedPrompt: `# 役割
あなたは優秀なプロジェクトマネージャーです。

# タスク
以下の情報に基づいて、チーム定例会議のアジェンダを作成してください。

# 条件
- 会議時間: 60分
- 主要トピック: 1. 先週の進捗確認 (20分), 2. 今週の課題共有 (30分), 3. その他連絡事項 (10分)
- 出力形式: マークダウン形式のリスト`,
  },
  {
    id: 'example-2',
    title: '採用候補者への連絡',
    description: '採用候補者への一次面接案内メールの文面を作成。候補者の経歴とポジションに合わせて、パーソナライズされた魅力的なメールを生成します。',
    image: findImage('example-2').imageUrl,
    imageHint: findImage('example-2').imageHint,
    recommendedPrompt: `# 役割
あなたは経験豊富なリクルーターです。

# タスク
以下の候補者情報とポジション情報に基づいて、一次面接の案内メールを作成してください。

# 条件
- 候補者名: 〇〇様
- ポジション: フロントエンドエンジニア
- 強調する点: 候補者のReactに関する豊富な経験
- 文体: 丁寧かつフレンドリー
- 出力形式: テキスト`,
  },
  {
    id: 'example-3',
    title: '新機能のリリース告知',
    description: '社内向けに新機能のリリースを告知する文章を作成。機能の概要、メリット、利用方法を簡潔にまとめ、全社員の認知度向上を図ります。',
    image: findImage('example-3').imageUrl,
    imageHint: findImage('example-3').imageHint,
    recommendedPrompt: `# 役割
あなたはプロダクトマーケティング担当者です。

# タスク
新機能「AIアシスト」の社内リリース告知文を作成してください。

# 条件
- 機能概要: ユーザーの問い合わせにAIが自動で回答する機能
- メリット: 問い合わせ対応工数の削減、顧客満足度の向上
- 利用開始日: 2023年10月1日
- 出力形式: Slack投稿用のフォーマット`,
  },
];