"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { SkeletonList } from "@/components/skeleton";
import { EmptyState, Glass, PageHeader, StatusPill } from "@/components/ui";
import { apiRequest } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { formatDate } from "@/lib/format";
import type { Task } from "@/lib/types";

function dayKey(iso: string, timeZone?: string) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: timeZone || undefined,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(iso));
}

function isTodayTask(task: Task) {
  const today = dayKey(new Date().toISOString());
  const when = task.deadline;
  const open = ["ASSIGNED", "ACCEPTED", "IN_PROGRESS"].includes(task.status);
  if (!open) return false;
  if (task.priority === "URGENT" || task.priority === "HIGH") return true;
  if (when && new Date(when).getTime() < Date.now()) return true;
  return Boolean(when && dayKey(when) === today);
}

export default function StaffTodayPage() {
  const { session } = useAuth();
  const tasks = useQuery({
    queryKey: ["staff-tasks", session?.organization.id],
    queryFn: () => apiRequest<{ data: Task[] }>("/api/tasks?limit=100", { token: session?.token }),
    enabled: !!session?.token,
  });
  const today = (tasks.data?.data ?? []).filter(isTodayTask);

  return (
    <div>
      <PageHeader title="Today" subtitle={`${session?.organization.name ?? ""} · work assigned`} />
      {tasks.isPending ? <SkeletonList rows={5} /> : null}
      {today.length === 0 && !tasks.isPending ? <EmptyState title="Nothing due today." /> : null}
      <div className="space-y-3">
        {today.map((task) => (
          <Link key={task.id} href={`/task/${task.id}`}>
            <Glass>
              <div className="flex justify-between gap-3">
                <div>
                  <div className="font-semibold">{task.title}</div>
                  <div className="text-sm text-[var(--text-secondary)]">
                    {task.property?.publicName} {task.deadline ? `· ${formatDate(task.deadline)}` : ""}
                  </div>
                </div>
                <StatusPill>{task.status}</StatusPill>
              </div>
            </Glass>
          </Link>
        ))}
      </div>
    </div>
  );
}
