import { useState, useRef, useEffect, useCallback } from "react";
import {
  ArrowUp,
  Square,
  Headphones,
  AlertCircle,
  Sparkles,
  RotateCcw,
  Mail,
  CheckCircle2,
  WifiOff,
} from "lucide-react";
import LandingNavbar from "@/components/landing/LandingNavbar";
import LandingFooter from "@/components/landing/LandingFooter";
import SEOHead from "@/components/common/SEOHead";
import ChatMessage from "@/components/chat/ChatMessage";
import { supabase } from "@/integrations/supabase/client";
import { useCredits } from "@/hooks/useCredits";
import { toast } from "sonner";
import { buildSupportSystemPrompt } from "@/data/supportKnowledge";

const SUPPORT_VERSION = "v6";
const STORAGE_KEY = `megsy_support_chat_${SUPPORT_VERSION}`;
const MAX_HISTORY = 40;


// The full knowledge base (plans, services, FAQs, routes, blog, comparisons,
// landings, troubleshooting, behaviour rules) is auto-assembled at request
// time from the SAME data files the website renders. See:
//   src/data/supportKnowledge.ts  ← assembler
//   src/data/pricingData.ts       ← plans / services / FAQs (single source)
//   src/data/blogPosts.ts · comparisons.ts · serviceLandings.ts
// When site data changes anywhere, the assistant updates automatically.


interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

const QUICK_PROMPTS = [
  "How do credits work?",
  "How do I earn free credits?",
  "I was charged but didn't receive credits",
  "How do I cancel my subscription?",
  "Which image model is best for realism?",
  "How do I generate a video?",
] as const;

const loadHistory = (): Message[] => {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr.slice(-MAX_HISTORY) : [];
  } catch {
    return [];
  }
};

const saveHistory = (messages: Message[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(-MAX_HISTORY)));
  } catch {
    /* quota / private mode — ignore */
  }
};

const SupportPage = () => {
  const [messages, setMessages] = useState<Message[]>(() => loadHistory());
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [escalated, setEscalated] = useState(false);
  const [networkError, setNetworkError] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const lastUserMsgRef = useRef<string>("");
  const { credits, plan } = useCredits();

  // Auto-scroll on new content
  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  // Persist messages
  useEffect(() => {
    saveHistory(messages);
  }, [messages]);

  // Auto-grow textarea
  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = `${Math.min(ta.scrollHeight, 160)}px`;
  }, [input]);

  // Focus on mount and after sending
  useEffect(() => {
    if (!isStreaming) textareaRef.current?.focus();
  }, [isStreaming]);

  const buildSystemPrompt = useCallback(async (): Promise<string> => {
    const ctx: string[] = [];
    try {
      const { data } = await supabase.auth.getUser();
      if (data?.user?.email) {
        ctx.push(`Signed-in user: ${data.user.email}`);
      } else {
        ctx.push("User is not signed in (browsing as guest).");
      }
    } catch {
      /* ignore */
    }
    if (typeof credits === "number") ctx.push(`Current credit balance: ${credits} MC`);
    if (plan) ctx.push(`Current plan: ${plan}`);
    ctx.push(`Page: /support  •  Time: ${new Date().toISOString()}`);

    return `${buildSupportSystemPrompt()}\n\n## Live user context\n${ctx.join("\n")}`;
  }, [credits, plan]);

  const stop = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    setIsStreaming(false);
  }, []);

  const send = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || isStreaming) return;

      lastUserMsgRef.current = trimmed;
      setNetworkError(false);
      setEscalated(false);

      const userMsg: Message = { id: crypto.randomUUID(), role: "user", content: trimmed };
      const assistantMsg: Message = { id: crypto.randomUUID(), role: "assistant", content: "" };
      setMessages((prev) => [...prev, userMsg, assistantMsg]);
      setInput("");
      setIsStreaming(true);

      const history = [...messages, userMsg]
        .slice(-MAX_HISTORY)
        .map((m) => ({ role: m.role, content: m.content }));

      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const customSystem = await buildSystemPrompt();
        const resp = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat-alibaba`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
            },
            body: JSON.stringify({
              messages: history,
              customSystem,
              model: "qwen-max",
              tier: "max",
              useTools: false,
            }),
            signal: controller.signal,
          },
        );

        if (!resp.ok || !resp.body) {
          throw new Error(`status_${resp.status}`);
        }

        const reader = resp.body.getReader();
        const decoder = new TextDecoder();
        let textBuffer = "";
        let fullResponse = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          textBuffer += decoder.decode(value, { stream: true });

          let newlineIndex: number;
          while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
            let line = textBuffer.slice(0, newlineIndex);
            textBuffer = textBuffer.slice(newlineIndex + 1);
            if (line.endsWith("\r")) line = line.slice(0, -1);
            if (!line.startsWith("data: ")) continue;
            const jsonStr = line.slice(6).trim();
            if (jsonStr === "[DONE]") break;
            try {
              const parsed = JSON.parse(jsonStr);
              const content = parsed.choices?.[0]?.delta?.content as string | undefined;
              if (content) {
                fullResponse += content;
                setMessages((prev) => {
                  const copy = [...prev];
                  const last = copy[copy.length - 1];
                  if (last && last.role === "assistant") {
                    copy[copy.length - 1] = { ...last, content: last.content + content };
                  }
                  return copy;
                });
              }
            } catch {
              break;
            }
          }
        }

        // Handle escalation tag
        if (fullResponse.includes("[ESCALATE_FINANCIAL]")) {
          setMessages((prev) => {
            const copy = [...prev];
            const last = copy[copy.length - 1];
            if (last && last.role === "assistant") {
              copy[copy.length - 1] = {
                ...last,
                content: last.content.replace(/\[ESCALATE_FINANCIAL\]/g, "").trim(),
              };
            }
            return copy;
          });
          setEscalated(true);
          try {
            await supabase.functions.invoke("send-email", {
              body: {
                to: "support@megsyai.com",
                template: "support_escalation",
                type: "system",
                variables: {
                  user_message: trimmed,
                  ai_response: fullResponse.replace(/\[ESCALATE_FINANCIAL\]/g, ""),
                  timestamp: new Date().toISOString(),
                },
              },
            });
          } catch {
            /* silent — user already got reply */
          }
        }
      } catch (err: unknown) {
        const aborted =
          err instanceof Error && (err.name === "AbortError" || err.message === "cancelled");
        if (!aborted) {
          setNetworkError(true);
          setMessages((prev) => {
            const copy = [...prev];
            const last = copy[copy.length - 1];
            if (last && last.role === "assistant" && !last.content) {
              copy.pop();
            }
            return copy;
          });
        }
      } finally {
        abortRef.current = null;
        setIsStreaming(false);
      }
    },
    [buildSystemPrompt, isStreaming, messages],
  );

  const retry = useCallback(() => {
    if (lastUserMsgRef.current) void send(lastUserMsgRef.current);
  }, [send]);

  const newChat = useCallback(() => {
    if (isStreaming) abortRef.current?.abort();
    setMessages([]);
    setEscalated(false);
    setNetworkError(false);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
    textareaRef.current?.focus();
  }, [isStreaming]);

  const copyEmail = useCallback(() => {
    navigator.clipboard?.writeText("support@megsyai.com").then(
      () => toast.success("support@megsyai.com copied"),
      () => toast.error("Couldn't copy — please copy manually"),
    );
  }, []);

  return (
    <div className="min-h-dvh bg-background text-foreground flex flex-col">
      <SEOHead
        title="Support Chat — Megsy AI"
        description="24/7 AI support chat for Megsy AI. Get instant answers about features, pricing, billing, and account questions — escalates to a human for sensitive requests."
        path="/support"
      />
      <LandingNavbar />

      <div className="flex-1 flex flex-col max-w-3xl mx-auto w-full px-4 pt-20 pb-4">
        {/* Header */}
        <div className="flex items-center justify-between gap-3 py-3 border-b border-border/60">
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative shrink-0">
              <div className="w-9 h-9 rounded-2xl bg-primary/10 flex items-center justify-center">
                <Headphones className="w-4.5 h-4.5 text-primary" />
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-background" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <p className="text-sm font-semibold truncate">Megsy Support</p>
                <Sparkles className="w-3 h-3 text-primary shrink-0" />
              </div>
              <p className="text-[11px] text-muted-foreground">
                Online 24/7 · usually replies instantly
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={copyEmail}
              className="hidden sm:inline-flex items-center gap-1.5 h-8 px-3 rounded-full text-[11px] font-medium border border-border text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors"
              aria-label="Copy support email"
            >
              <Mail className="w-3 h-3" /> support@megsyai.com
            </button>
            {messages.length > 0 && (
              <button
                type="button"
                onClick={newChat}
                className="inline-flex items-center gap-1.5 h-8 px-3 rounded-full text-[11px] font-medium border border-border text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors"
                aria-label="Start a new chat"
              >
                <RotateCcw className="w-3 h-3" /> New chat
              </button>
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto py-6">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center min-h-[40vh] text-center">
              <div className="w-20 h-20 rounded-3xl bg-primary/10 flex items-center justify-center mb-6">
                <Headphones className="w-9 h-9 text-primary" />
              </div>
              <h1 className="font-display text-3xl font-black uppercase tracking-tight mb-2 sm:text-4xl">
                How can we <span className="text-primary">help?</span>
              </h1>
              <div className="mb-6" />


              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-lg">
                {QUICK_PROMPTS.map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => void send(q)}
                    className="text-left text-[13px] px-3.5 py-3 rounded-xl border border-border bg-card hover:bg-muted/40 hover:border-primary/40 transition-colors"
                  >
                    {q}
                  </button>
                ))}
              </div>

              <div className="mt-6 flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-[11px] text-muted-foreground">
                <AlertCircle className="h-3.5 w-3.5 text-primary shrink-0" />
                <span>Billing, refunds, or account changes are escalated to our human team.</span>
              </div>
            </div>
          )}

          {messages.map((msg) => (
            <ChatMessage
              key={msg.id}
              role={msg.role}
              content={msg.content}
              isStreaming={
                isStreaming &&
                msg.id === messages[messages.length - 1]?.id &&
                msg.role === "assistant"
              }
              isThinking={isStreaming && msg.role === "assistant" && !msg.content}
            />
          ))}

          {escalated && (
            <div className="mt-3 flex items-start gap-2.5 rounded-xl border border-emerald-500/30 bg-emerald-500/5 px-4 py-3">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <div className="text-[12px] leading-relaxed">
                <p className="font-semibold text-foreground">Forwarded to our human team</p>
                <p className="text-muted-foreground">
                  A specialist will reply by email within 24 hours.
                </p>
              </div>
            </div>
          )}

          {networkError && (
            <div className="mt-3 flex items-start gap-2.5 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3">
              <WifiOff className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
              <div className="flex-1 text-[12px] leading-relaxed">
                <p className="font-semibold text-foreground">Couldn't reach support</p>
                <p className="text-muted-foreground">
                  Check your connection and try again, or email{" "}
                  <a
                    href="mailto:support@megsyai.com"
                    className="text-primary underline underline-offset-2"
                  >
                    support@megsyai.com
                  </a>
                  .
                </p>
              </div>
              <button
                type="button"
                onClick={retry}
                className="shrink-0 h-7 px-3 rounded-full text-[11px] font-semibold bg-destructive text-destructive-foreground hover:opacity-90"
              >
                Retry
              </button>
            </div>
          )}
        </div>

        {/* Composer */}
        <div className="pb-4 pt-3 border-t border-border">
          <div className="relative flex items-end gap-2 rounded-2xl border border-border bg-secondary/40 focus-within:ring-2 focus-within:ring-primary/40 focus-within:border-primary/60 transition-all px-3 py-2">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (
                  e.key === "Enter" &&
                  !e.shiftKey &&
                  (typeof window === "undefined" || window.innerWidth >= 768)
                ) {
                  e.preventDefault();
                  void send(input);
                }
              }}
              placeholder="Ask anything about Megsy — features, billing, account…"
              rows={1}
              aria-label="Message Megsy Support"
              className="flex-1 bg-transparent px-1.5 py-2 text-sm text-foreground outline-none resize-none placeholder:text-muted-foreground/50 max-h-40 selectable"
            />
            <button
              type="button"
              onClick={isStreaming ? stop : () => void send(input)}
              disabled={!isStreaming && !input.trim()}
              aria-label={isStreaming ? "Stop generating" : "Send message"}
              className="shrink-0 w-9 h-9 rounded-xl bg-primary text-primary-foreground flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed hover:bg-primary/90 transition-colors active:scale-95"
            >
              {isStreaming ? (
                <Square className="w-3.5 h-3.5 fill-current" />
              ) : (
                <ArrowUp className="w-4 h-4" />
              )}
            </button>
          </div>
          <p className="text-[10px] text-muted-foreground/50 text-center mt-2">
            AI assistant · responses may be inaccurate · for urgent issues email{" "}
            <a href="mailto:support@megsyai.com" className="text-primary/60 hover:underline">
              support@megsyai.com
            </a>
          </p>
        </div>
      </div>

      <LandingFooter />
    </div>
  );
};

export default SupportPage;
