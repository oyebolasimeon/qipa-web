"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { SkeletonChat } from "@/components/skeleton";
import { Button, PageHeader } from "@/components/ui";
import { apiRequest } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { formatWhen } from "@/lib/format";
import { ocupaiPropertyName } from "@/lib/property-name";
import type { Conversation } from "@/lib/types";

export default function ConversationPage() {
  const { id } = useParams<{ id: string }>();
  const { session } = useAuth();
  const queryClient = useQueryClient();
  const [reply, setReply] = useState("");
  const endRef = useRef<HTMLDivElement>(null);
  const { data, isPending } = useQuery({
    queryKey: ["conversation", id],
    queryFn: () => apiRequest<Conversation>(`/api/conversations/${id}`, { token: session?.token }),
    enabled: !!session?.token && !!id,
    refetchInterval: 8_000,
  });

  const send = useMutation({
    mutationFn: (content: string) =>
      apiRequest<Conversation>(`/api/conversations/${id}/messages`, {
        method: "POST",
        token: session?.token,
        body: { content, senderType: "STAFF" },
      }),
    onSuccess: (updated) => {
      setReply("");
      queryClient.setQueryData(["conversation", id], updated);
      void queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [data?.messages?.length]);

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-3xl flex-col">
      <PageHeader
        title={data?.guest?.fullName ?? "Conversation"}
        subtitle={[ocupaiPropertyName(data?.property), data?.channel].filter(Boolean).join(" · ")}
      />
      <div className="chat-thread flex-1">
        {isPending && !data ? <SkeletonChat /> : null}
        {(data?.messages ?? []).map((message) => {
          const outbound = message.direction === "OUTBOUND" || message.senderType === "STAFF" || message.senderType === "AI";
          return (
            <div key={message.id} className={`bubble ${outbound ? "bubble-out" : "bubble-in"}`}>
              <div className="bubble-meta">
                {message.senderName ?? message.senderType} · {formatWhen(message.sentAt)}
              </div>
              {message.content}
            </div>
          );
        })}
        <div ref={endRef} />
      </div>
      <div className="composer">
        <input
          className="field"
          value={reply}
          placeholder="Write a reply…"
          onChange={(event) => setReply(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey && reply.trim()) {
              event.preventDefault();
              send.mutate(reply.trim());
            }
          }}
        />
        <Button size="sm" loading={send.isPending} onClick={() => reply.trim() && send.mutate(reply.trim())}>
          Send
        </Button>
      </div>
    </div>
  );
}
