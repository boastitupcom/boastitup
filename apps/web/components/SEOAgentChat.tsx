'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@boastitup/ui';
import { Button } from '@boastitup/ui';
import { Input } from '@boastitup/ui';
import { ScrollArea } from '@boastitup/ui';
import { Avatar, AvatarFallback } from '@boastitup/ui';
import { Send, Bot, User, Loader2, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

import { useSEOAgent } from '@boastitup/hooks';
import useSEOOutline from '@boastitup/hooks';

interface SEOAgentChatProps {
  sessionId: string;
  mode?: 'chat' | 'outline'; // Default: chat
}

export default function SEOAgentChat({ sessionId, mode = 'chat' }: SEOAgentChatProps) {
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const [topic, setTopic] = useState('');
  const [focusKeyword, setFocusKeyword] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [formSubmitted, setFormSubmitted] = useState(false);

  // Chat mode state
  const {
    messages: rawMessages,
    isConnected,
    isTyping,
    sendMessage,
    connectionStatus
  } = useSEOAgent(sessionId);

  // Outline mode state
  const {
    outline,
    fetchOutline,
    isLoading: isGeneratingOutline,
    error: outlineError
  } = useSEOOutline();

  const messages = rawMessages.map((msg, idx) => ({
    id: `${idx}`,
    role: msg.type === 'response' ? 'assistant' : 'user',
    content: msg.message,
    timestamp: new Date(msg.timestamp)
  }));

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages, outline]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic || !focusKeyword) return;

    if (mode === 'chat') {
      sendMessage({
        message: "Start SEO blog planning",
        topic,
        focusKeyword,
        targetAudience
      });
    } else {
      fetchOutline({ topic, focusKeyword, targetAudience });
    }

    setFormSubmitted(true);
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          {mode === 'chat' ? <Bot className="h-5 w-5" /> : <FileText className="h-5 w-5" />}
          {mode === 'chat' ? 'SEO Content Strategist (Chat)' : 'Structured SEO Outline Generator'}
          {mode === 'chat' && !isConnected && (
            <span className="text-xs text-muted-foreground ml-auto">
              {connectionStatus === 'connecting' ? 'Connecting...' : 'Offline'}
            </span>
          )}
        </CardTitle>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0">
        {!formSubmitted ? (
          <form onSubmit={handleSubmit} className="space-y-4 px-4 py-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Topic</label>
              <Input
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g., AI in Retail"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Focus Keyword</label>
              <Input
                value={focusKeyword}
                onChange={(e) => setFocusKeyword(e.target.value)}
                placeholder="e.g., AI customer insights"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Target Audience (optional)</label>
              <Input
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value)}
                placeholder="e.g., Ecommerce founders"
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={mode === 'chat' ? !isConnected : isGeneratingOutline}
            >
              <Send className="h-4 w-4 mr-2" />
              {mode === 'chat' ? 'Plan My Blog Strategy' : 'Generate SEO Outline'}
            </Button>
          </form>
        ) : mode === 'chat' ? (
          <ScrollArea className="flex-1 px-4" ref={scrollAreaRef}>
            <div className="space-y-4 py-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn("flex gap-3", message.role === 'user' && "justify-end")}
                >
                  {message.role === 'assistant' && (
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>
                        <Bot className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <div
                    className={cn(
                      "max-w-[80%] rounded-lg px-4 py-2",
                      message.role === 'assistant'
                        ? "bg-muted"
                        : "bg-primary text-primary-foreground"
                    )}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    <p className="text-xs opacity-50 mt-1">
                      {message.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                  {message.role === 'user' && (
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>
                        <User className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))}
              {isTyping && (
                <div className="flex gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>
                      <Bot className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="bg-muted rounded-lg px-4 py-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        ) : (
          <ScrollArea className="flex-1 px-4 py-6" ref={scrollAreaRef}>
            {isGeneratingOutline ? (
              <div className="flex items-center justify-center text-sm opacity-75">
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Generating outline...
              </div>
            ) : outlineError ? (
              <p className="text-red-500">{outlineError}</p>
            ) : (
              <pre className="text-sm whitespace-pre-wrap bg-muted p-4 rounded-lg max-h-[600px] overflow-auto">
                {JSON.stringify(outline, null, 2)}
              </pre>
            )}
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
