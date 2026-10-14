"use client";

import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { Button, Card, PageHeader } from "@/components/ui";
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

  const send = () => {
    const message = input.trim();
    if (!message) return;
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: message }]);
    chat.mutate(message);
  };

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title={t("more.askOcupai")} />
      <div className="space-y-3">
        {messages.map((message, index) => (
          <Card key={`${message.role}-${index}`} className={message.role === "user" ? "ml-8" : "mr-8"}>
            {message.content}
          </Card>
        ))}
      </div>
      <div className="mt-4 flex gap-2">
        <input className="field" value={input} onChange={(event) => setInput(event.target.value)} onKeyDown={(event) => event.key === "Enter" && send()} />
        <Button loading={chat.isPending} onClick={send}>
          Send
        </Button>
      </div>
    </div>
  );
}
