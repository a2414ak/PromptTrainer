'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { LifeBuoy, X, Send, Loader2, MessageSquare } from 'lucide-react';
import { handleChatResponse } from '@/app/actions';
import { useToast } from "@/hooks/use-toast";
import type { Message } from '@/lib/types';
import { analytics } from '@/lib/firebase';
import { logEvent } from 'firebase/analytics';

interface FloatingChatProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

export default function FloatingChat({ isOpen, onOpenChange }: FloatingChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'ai', text: "こんにちは！何かお手伝いできることはありますか？", timestamp: new Date() }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({
        top: scrollAreaRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages, isOpen]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const analyticsInstance = await analytics;
    if (analyticsInstance) {
      logEvent(analyticsInstance, 'send_chat_message_button_clicked');
    }
    const userMsg: Message = { role: 'user', text: input, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const aiRes = await handleChatResponse(messages, input);
      setMessages(prev => [...prev, { role: 'ai', text: aiRes, timestamp: new Date() }]);
    } catch (error) {
      console.error("Chat error:", error);
      toast({
        variant: "destructive",
        title: "チャットエラー",
        description: "AIとの通信中にエラーが発生しました。",
      });
      setMessages(prev => prev.slice(0, -1)); // Remove the user message if AI fails
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 md:bottom-10 md:right-10 z-[60] flex flex-col items-end gap-3">
      {isOpen && (
        <Card className="w-[340px] sm:w-[460px] h-[600px] rounded-3xl shadow-2xl border-2 border-primary/40 flex flex-col overflow-hidden animate-in slide-in-from-bottom-8 duration-300 bg-card">
          <CardHeader className="bg-primary px-8 py-6 flex flex-row justify-between items-center shadow-lg">
            <div className="flex items-center gap-4 text-primary-foreground font-black text-lg uppercase tracking-wider">
              <LifeBuoy size={28} />
              AIメンター
            </div>
            <Button onClick={async () => {
                const analyticsInstance = await analytics;
                if (analyticsInstance) {
                  logEvent(analyticsInstance, 'close_chat_button_clicked');
                }
                onOpenChange(false)
              }}
              variant="ghost" size="icon" className="text-primary-foreground hover:bg-black/15 rounded-full p-2">
              <X size={28} />
            </Button>
          </CardHeader>

          <ScrollArea className="flex-1 bg-muted/60" viewportRef={scrollAreaRef}>
            <CardContent className="p-4 sm:p-8 flex flex-col gap-6">
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[90%] px-6 py-4 rounded-2xl text-base leading-loose font-bold shadow-sm ${
                    msg.role === 'user'
                      ? 'bg-primary text-primary-foreground rounded-br-none'
                      : 'bg-background text-foreground rounded-bl-none border-2 border-border'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex gap-2 items-center self-start px-8 py-4">
                   <div className="size-2.5 bg-primary rounded-full animate-bounce"></div>
                   <div className="size-2.5 bg-primary rounded-full animate-bounce [animation-delay:0.1s]"></div>
                   <div className="size-2.5 bg-primary rounded-full animate-bounce [animation-delay:0.2s]"></div>
                 </div>
              )}
            </CardContent>
          </ScrollArea>

          <CardFooter className="p-4 sm:p-6 bg-card border-t-4 border-muted">
            <div className="flex gap-4 w-full">
              <Input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="メッセージを入力..."
                className="flex-1 rounded-2xl border-2 border-input bg-background text-lg px-6 py-4 focus:ring-primary focus:border-primary text-foreground font-bold h-auto"
                disabled={isLoading}
              />
              <Button
                onClick={sendMessage}
                disabled={isLoading || !input.trim()}
                className="rounded-2xl px-4 py-4 shadow-xl h-auto"
                size="icon"
              >
                {isLoading ? <Loader2 className="animate-spin" size={28}/> : <Send size={28} />}
              </Button>
            </div>
          </CardFooter>
        </Card>
      )}
      
      {!isOpen && (
        <p className="text-right text-sm font-black text-slate-700 dark:text-slate-400 animate-in fade-in slide-in-from-right-2 duration-500 bg-background/60 px-4 py-2 rounded-xl backdrop-blur-sm shadow-sm border border-primary/20">
            気になることは何でも質問してください！
          </p>
      )}

      <Button
        onClick={async () => {
          const analyticsInstance = await analytics;
          if (analyticsInstance) {
            logEvent(analyticsInstance, 'toggle_chat_button_clicked', { is_open: !isOpen });
          }
          onOpenChange(!isOpen)
        }}
        className={`flex items-center gap-5 px-8 py-6 rounded-full font-black text-dark-text shadow-2xl transition-all active:scale-95 h-auto ${
          isOpen 
            ? 'bg-card text-foreground ring-4 ring-primary/40' 
            : 'bg-primary text-primary-foreground hover:bg-primary/90'
        }`}
      >
        {isOpen ? <X size={32} /> : <MessageSquare size={32} />}
        {!isOpen && <span className="uppercase tracking-[0.1em] text-lg">AIメンターに相談する</span>}
      </Button>
    </div>
  );
}
