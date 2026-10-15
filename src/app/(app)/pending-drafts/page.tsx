"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { SkeletonList } from "@/components/skeleton";
import { Button, EmptyState, Field, Glass, PageHeader } from "@/components/ui";
import { apiRequest } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { canOperate } from "@/lib/roles";

type PendingAction = {
  id?: string;
  _id?: string;
  title?: string;
  summary?: string;
  draft?: string;
  intent?: string;
  actionKind?: string;
  conversationId?: string;
};

function reviewPath(id: string, action: "approve" | "reject" | "retry") {
  return `/api/autopilot/actions/${encodeURIComponent(id)}/${action}`;
}

export default function PendingDraftsPage() {
  const { session } = useAuth();
  const operate = canOperate(session?.membership.role);
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");

  const query = useQuery({
    queryKey: ["pending-drafts", session?.organization.id],
    queryFn: () => apiRequest<{ data: PendingAction[] }>("/api/autopilot/pending", { token: session?.token }),
    enabled: !!session?.token,
  });
  const rows = query.data?.data ?? [];

  const act = useMutation({
    mutationFn: ({ id, action, body }: { id: string; action: "approve" | "reject" | "retry"; body?: unknown }) =>
      apiRequest(reviewPath(id, action), { method: "POST", token: session?.token, body: body ?? {} }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["pending-drafts"] }),
  });

  return (
    <div>
      <PageHeader title="Pending AI drafts" subtitle="Approve, edit or reject before Ocupai acts" />
      {query.isPending ? <SkeletonList rows={5} /> : null}
      {rows.length === 0 && !query.isPending ? <EmptyState title="Nothing waiting on you." /> : null}
      <div className="space-y-3">
        {rows.map((row, index) => {
          const id = row.id ?? row._id ?? String(index);
          return (
            <Glass key={id}>
              <div className="text-xs uppercase tracking-wide text-[var(--text-muted)]">
                {(row.actionKind ?? row.intent ?? "draft").replace(/_/g, " ")}
              </div>
              <div className="font-semibold">{row.title ?? "Proposed action"}</div>
              <p className="mt-2 whitespace-pre-wrap text-sm text-[var(--text-secondary)]">
                {row.draft ?? row.summary}
              </p>
              {editingId === id ? (
                <>
                  <Field label="Edited reply" value={editText} onChange={setEditText} />
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => act.mutate({ id, action: "approve", body: { text: editText } })}>
                      Approve edited
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>
                      Cancel
                    </Button>
                  </div>
                </>
              ) : operate ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button size="sm" onClick={() => act.mutate({ id, action: "approve" })}>
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setEditingId(id);
                      setEditText(row.draft ?? row.summary ?? "");
                    }}
                  >
                    Edit
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => act.mutate({ id, action: "retry" })}>
                    Retry
                  </Button>
                  <Button size="sm" variant="danger" onClick={() => act.mutate({ id, action: "reject" })}>
                    Reject
                  </Button>
                </div>
              ) : null}
            </Glass>
          );
        })}
      </div>
    </div>
  );
}
