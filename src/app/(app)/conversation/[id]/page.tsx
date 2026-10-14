"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { useState } from "react";
import { Button, Card, PageHeader } from "@/components/ui";
import { apiRequest } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { formatWhen } from "@/lib/format";
import type { Conversation } from "@/lib/types";

export default function ConversationPage() {
  const { id } = useParams<{ id: string }>();
  const { session } = useAuth();
  const queryClient = useQueryClient();
  const [reply, setReply] = useState("");
  const { data } = useQuery({
    queryKey: ["conversation", id],
    queryFn: () => apiRequest<Conversation>(`/api/conversations/${id}`, { token: session?.token }),
    enabled: !!session?.token && !!id,
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

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title={data?.guest?.fullName ?? "Conversation"} subtitle={data?.property?.publicName} />
      <div className="space-y-3">
        {(data?.messages ?? []).map((message) => (
          <Card key={message.id} className={message.direction === "OUTBOUND" ? "ml-8" : "mr-8"}>
            <div className="text-xs text-[var(--text-muted)]">
              {message.senderName ?? message.senderType} · {formatWhen(message.sentAt)}
            </div>
            <div className="mt-1 whitespace-pre-wrap">{message.content}</div>
          </Card>
        ))}
      </div>
      <div className="mt-4 flex gap-2">
        <input className="field" value={reply} onChange={(event) => setReply(event.target.value)} />
        <Button loading={send.isPending} onClick={() => reply.trim() && send.mutate(reply.trim())}>
          Send
        </Button>
      </div>
    </div>
  );
}
