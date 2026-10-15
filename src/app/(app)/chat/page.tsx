"use client";

import { useMutation } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { Button, PageHeader } from "@/components/ui";
import { apiRequest } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { useTranslation } from "@/lib/i18n";
import type { QipaChatResponse } from "@/lib/types";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function ChatPage() {
  const { t } = useTranslation();
  const { session } = useAuth();
  const endRef = useRef<HTMLDivElement>(null);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Ask Ocupai about occupancy, arrivals, revenue, or what needs attention." },
  ]);

  const chat = useMutation({
    mutationFn: (message: string) =>
      apiRequest<QipaChatResponse>("/api/qipa/chat", {
        method: "POST",
        token: session?.token,
        body: { message, requestId: crypto.randomUUID() },
      }),
    onSuccess: (response) => {
      setMessages((prev) => [...prev, { role: "assistant", content: response.content }]);
    },
  });

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const send = () => {
    const message = input.trim();
    if (!message) return;
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: message }]);
    chat.mutate(message);
  };

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-3xl flex-col">
      <PageHeader title={t("more.askOcupai")} subtitle="Your AI operator for this business" />
      <div className="chat-thread flex-1">
        {messages.map((message, index) => (
          <div key={`${message.role}-${index}`} className={`bubble ${message.role === "user" ? "bubble-out" : "bubble-in"}`}>
            {message.content}
          </div>
        ))}
        <div ref={endRef} />
      </div>
      <div className="composer">
        <input
          className="field"
          value={input}
          placeholder={t("home.askPlaceholder")}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={(event) => event.key === "Enter" && send()}
        />
        <Button size="sm" loading={chat.isPending} onClick={send}>
          Send
        </Button>
      </div>
    </div>
  );
}
