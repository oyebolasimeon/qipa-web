"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { Card, EmptyState, PageHeader, StatusPill } from "@/components/ui";
import { apiRequest } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { useTranslation } from "@/lib/i18n";

type Issue = { id: string; title: string; status: string; urgency: string; propertyName?: string };

export default function MaintenanceIssuesPage() {
  const { t } = useTranslation();
  const { session } = useAuth();
  const query = useQuery({
    queryKey: ["maintenance-issues", session?.organization.id],
    queryFn: () => apiRequest<{ data: Issue[] }>("/api/maintenance/issues", { token: session?.token }),
    enabled: !!session?.token,
  });
  const rows = query.data?.data ?? [];

  return (
    <div>
      <PageHeader
        title={t("maintenance.issues")}
        action={
          <Link href="/maintenance/issues/new" className="btn btn-primary">
            {t("maintenance.addIssue")}
          </Link>
        }
      />
      {rows.length === 0 && !query.isPending ? (
        <EmptyState title={t("maintenance.emptyIssues")} action={t("maintenance.addIssue")} href="/maintenance/issues/new" />
      ) : null}
      <div className="space-y-3">
        {rows.map((row) => (
          <Link key={row.id} href={`/maintenance/issues/${row.id}`}>
            <Card>
              <div className="flex justify-between gap-3">
                <div className="font-semibold">{row.title}</div>
                <StatusPill>{row.status}</StatusPill>
              </div>
              <div className="mt-1 text-sm text-[var(--text-secondary)]">
                {row.urgency}
                {row.propertyName ? ` · ${row.propertyName}` : ""}
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
