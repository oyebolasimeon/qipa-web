"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { SkeletonList } from "@/components/skeleton";
import { EmptyState, PageHeader, StatusPill } from "@/components/ui";
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
          <Link href="/maintenance/issues/new" className="btn btn-primary btn-sm">
            {t("maintenance.addIssue")}
          </Link>
        }
      />
      {query.isPending ? <SkeletonList rows={5} /> : null}
      {rows.length === 0 && !query.isPending ? (
        <EmptyState title={t("maintenance.emptyIssues")} action={t("maintenance.addIssue")} href="/maintenance/issues/new" />
      ) : null}
      {rows.length ? (
        <div className="list-stack">
          {rows.map((row) => (
            <Link key={row.id} href={`/maintenance/issues/${row.id}`} className="list-row">
              <div className="list-row-body">
                <div className="flex items-start justify-between gap-3">
                  <div className="list-row-title">{row.title}</div>
                  <StatusPill>{row.status.replace(/_/g, " ")}</StatusPill>
                </div>
                <div className="list-row-meta">
                  {row.urgency.replace(/_/g, " ")}
                  {row.propertyName ? ` · ${row.propertyName}` : ""}
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : null}
    </div>
  );
}
