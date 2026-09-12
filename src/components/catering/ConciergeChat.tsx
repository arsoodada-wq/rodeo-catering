"use client";

import { useEffect, useRef, useState } from "react";
import { Send, Loader2, PartyPopper, Sparkles } from "lucide-react";
import { cn } from "@/lib/cn";
import { business } from "@/lib/site-content";

type ChatMessage = { role: "user" | "assistant"; content: string };

const GREETING =
  "Hi! I'm the catering concierge. Tell me a bit about your event — what it's for, roughly how many guests, and when — and I'll help get you a quote.";

export function ConciergeChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: "assistant", content: GREETING },
  ]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [leadSubmitted, setLeadSubmitted] = useState(false);
  const [notConfigured, setNotConfigured] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, sending]);

  async function send() {
    const text = input.trim();
    if (!text || sending) return;

    const nextMessages: ChatMessage[] = [...messages, { role: "user", content: text }];
    setMessages(nextMessages);
    setInput("");
    setError(null);
    setSending(true);

    try {
      const res = await fetch("/api/concierge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nextMessages }),
      });
      const data = await res.json();

      if (data.notConfigured) {
        setNotConfigured(true);
      } else if (data.ok) {
        setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
        if (data.leadSubmitted) setLeadSubmitted(true);
      } else {
        setError(data.error ?? "Something went wrong.");
      }
    } catch {
      setError("Couldn't reach the concierge. Please try again or call us directly.");
    } finally {
      setSending(false);
    }
  }

  if (notConfigured) {
    return (
      <div className="rounded-2xl border border-ink-900/8 bg-white p-8 text-center">
        <Sparkles className="mx-auto h-8 w-8 text-ink-300" />
        <p className="mt-3 font-semibold text-ink-900">The AI concierge isn&apos;t set up yet.</p>
        <p className="mt-1 text-sm text-ink-500">
          Use the guided builder instead, or call us at{" "}
          <a href={business.phoneHref} className="font-semibold text-rodeo-600">
            {business.phone}
          </a>
          .
        </p>
      </div>
    );
  }

  if (leadSubmitted) {
    return (
      <div className="rounded-3xl border border-rodeo-200 bg-rodeo-50 p-10 text-center">
        <PartyPopper className="mx-auto h-10 w-10 text-rodeo-600" />
        <h3 className="mt-4 text-2xl font-extrabold text-ink-900">Request received!</h3>
        <p className="mx-auto mt-2 max-w-md text-ink-600">
          Our catering team will follow up soon to confirm details and pricing. If it&apos;s
          urgent, call us directly at{" "}
          <a href={business.phoneHref} className="font-semibold text-rodeo-600">
            {business.phone}
          </a>
          .
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-ink-900/8 bg-white">
      <div className="flex items-center gap-2 border-b border-ink-900/8 p-4">
        <Sparkles className="h-4 w-4 text-rodeo-600" />
        <p className="text-sm font-semibold text-ink-900">AI Catering Concierge</p>
      </div>

      <div ref={scrollRef} className="max-h-[28rem] min-h-[16rem] space-y-3 overflow-y-auto p-4">
        {messages.map((m, i) => (
          <div key={i} className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}>
            <div
              className={cn(
                "max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
                m.role === "user"
                  ? "bg-rodeo-500 text-white"
                  : "bg-cream-100 text-ink-800"
              )}
            >
              {m.content}
            </div>
          </div>
        ))}
        {sending && (
          <div className="flex justify-start">
            <div className="flex items-center gap-1.5 rounded-2xl bg-cream-100 px-4 py-2.5 text-sm text-ink-400">
              <Loader2 className="h-3.5 w-3.5 animate-spin" /> Thinking…
            </div>
          </div>
        )}
      </div>

      <div className="border-t border-ink-900/8 p-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            send();
          }}
          className="flex items-center gap-2"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Tell me about your event..."
            className="input flex-1"
            disabled={sending}
          />
          <button
            type="submit"
            disabled={sending || !input.trim()}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-rodeo-500 text-white hover:bg-rodeo-600 disabled:opacity-50"
            aria-label="Send"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
        {error && <p className="mt-2 text-xs text-rodeo-600">{error}</p>}
        <p className="mt-2 text-xs text-ink-400">
          AI assistant — for anything urgent, call {business.phone} directly.
        </p>
      </div>
    </div>
  );
}
