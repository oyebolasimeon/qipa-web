"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { Card, EmptyState, PageHeader, StatusPill } from "@/components/ui";
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
        action={
          <Link href="/task/new" className="btn btn-primary">
            Add task
          </Link>
        }
      />
      {isPending ? <p className="text-[var(--text-muted)]">{t("common.loading")}</p> : null}
      {rows.length === 0 && !isPending ? <EmptyState title="No tasks yet." action="Add task" href="/task/new" /> : null}
      <div className="space-y-3">
        {rows.map((row) => (
          <Link key={row.id} href={`/task/${row.id}`}>
            <Card>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="font-semibold">{row.title}</div>
                  <div className="text-sm text-[var(--text-secondary)]">
                    {row.property?.publicName} {row.deadline ? `· ${formatDate(row.deadline)}` : ""}
                  </div>
                </div>
                <StatusPill>{row.status}</StatusPill>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
