import { GraduationCap } from 'lucide-react';

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full flex items-center justify-between border-b border-primary/20 bg-background/95 backdrop-blur px-6 py-6 md:px-10 lg:px-40">
      <div className="flex items-center gap-4 text-foreground">
        <div className="size-10 bg-primary rounded-lg flex items-center justify-center text-primary-foreground shadow-sm">
          <GraduationCap className="text-3xl font-black" size={28} />
        </div>
        <h2 className="text-xl font-black leading-tight tracking-tight font-headline">生成AI研修　復習ページ</h2>
      </div>
    </header>
  );
}
