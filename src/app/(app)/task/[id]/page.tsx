"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { SkeletonDetail } from "@/components/skeleton";
import { Button, Glass, PageHeader, StatusPill } from "@/components/ui";
import { apiRequest } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { formatDate } from "@/lib/format";
import type { Task } from "@/lib/types";

export default function TaskDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { session } = useAuth();
  const queryClient = useQueryClient();
  const { data, isPending } = useQuery({
    queryKey: ["task", id],
    queryFn: () => apiRequest<Task>(`/api/tasks/${id}`, { token: session?.token }),
    enabled: !!session?.token && !!id,
  });
  const update = useMutation({
    mutationFn: (status: string) =>
      apiRequest(`/api/tasks/${id}`, {
        method: "PATCH",
        token: session?.token,
        body: { status },
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["task", id] });
      void queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });

  if (isPending && !data) {
    return (
      <div className="mx-auto max-w-xl">
        <SkeletonDetail />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl">
      <PageHeader title={data?.title ?? "Task"} action={<StatusPill>{data?.status}</StatusPill>} />
      <Glass>
        <div className="meta-line">
          <span>Property</span>
          <span>{data?.property?.publicName ?? "—"}</span>
        </div>
        <div className="meta-line">
          <span>Type</span>
          <span>{(data?.type ?? "").replace(/_/g, " ")}</span>
        </div>
        <div className="meta-line">
          <span>Priority</span>
          <span>{(data?.priority ?? "").replace(/_/g, " ")}</span>
        </div>
        <div className="meta-line">
          <span>Deadline</span>
          <span>{data?.deadline ? formatDate(data.deadline) : "—"}</span>
        </div>
        {data?.description ? <p className="mt-4 text-sm text-[var(--text-secondary)]">{data.description}</p> : null}
        <div className="mt-5 flex gap-2">
          <Button
            className="flex-1"
            variant="ghost"
            loading={update.isPending}
            onClick={() => update.mutate("IN_PROGRESS")}
          >
            In progress
          </Button>
          <Button className="flex-1" loading={update.isPending} onClick={() => update.mutate("COMPLETED")}>
            Done
          </Button>
        </div>
      </Glass>
    </div>
  );
}
