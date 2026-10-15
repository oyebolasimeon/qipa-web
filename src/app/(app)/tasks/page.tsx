"use client";

import { useQuery } from "@tanstack/react-query";
import { Wrench } from "lucide-react";
import Link from "next/link";
import { SkeletonList } from "@/components/skeleton";
import { EmptyState, PageHeader, StatusPill } from "@/components/ui";
import { useAuth } from "@/lib/auth";
import { formatDate } from "@/lib/format";
import { useTranslation } from "@/lib/i18n";
import { tasksQuery } from "@/lib/queries";

export default function TasksPage() {
  const { session } = useAuth();
  const { t } = useTranslation();
  const { data, isPending } = useQuery(tasksQuery(session?.organization.id, session?.token));
  const rows = data?.data ?? [];

  return (
    <div>
      <PageHeader
        title={t("more.items.tasks")}
        subtitle={`${rows.length} open and recent`}
        action={
          <Link href="/task/new" className="btn btn-primary btn-sm">
            Add task
          </Link>
        }
      />
      {isPending ? <SkeletonList rows={6} /> : null}
      {rows.length === 0 && !isPending ? <EmptyState title="No tasks yet." action="Add task" href="/task/new" /> : null}
      {rows.length ? (
        <div className="list-stack">
          {rows.map((row) => (
            <Link key={row.id} href={`/task/${row.id}`} className="list-row">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] bg-[#F5A52418] text-[#F5A524]">
                <Wrench size={18} />
              </div>
              <div className="list-row-body">
                <div className="flex items-start justify-between gap-3">
                  <div className="list-row-title">{row.title}</div>
                  <StatusPill>{row.status}</StatusPill>
                </div>
                <div className="list-row-meta">
                  {row.property?.publicName ?? "Property"}
                  {row.deadline ? ` · ${formatDate(row.deadline)}` : ""}
                </div>
                <div className="list-row-sub">
                  {row.type?.replace(/_/g, " ")} · {row.priority?.replace(/_/g, " ")}
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : null}
    </div>
  );
}
