"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { Card, PageHeader, StatusPill } from "@/components/ui";
import { apiRequest } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import type { Task } from "@/lib/types";

export default function TaskDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { session } = useAuth();
  const { data } = useQuery({
    queryKey: ["task", id],
    queryFn: () => apiRequest<Task>(`/api/tasks/${id}`, { token: session?.token }),
    enabled: !!session?.token && !!id,
  });

  return (
    <div>
      <PageHeader title={data?.title ?? "Task"} action={<StatusPill>{data?.status}</StatusPill>} />
      <Card>
        <div className="text-sm text-[var(--text-secondary)]">
          {data?.type} · {data?.priority} · {data?.property?.publicName}
        </div>
        {data?.description ? <p className="mt-3">{data.description}</p> : null}
      </Card>
    </div>
  );
}
