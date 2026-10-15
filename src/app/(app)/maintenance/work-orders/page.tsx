"use client";

import { useQuery } from "@tanstack/react-query";
import { SkeletonList } from "@/components/skeleton";
import { EmptyState, PageHeader, StatusPill } from "@/components/ui";
import { apiRequest } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { formatCurrency } from "@/lib/format";
import { useTranslation } from "@/lib/i18n";

type WorkOrder = { id: string; title?: string; status: string; priority: string; estimatedCost?: number };

export default function MaintenanceWorkOrdersPage() {
  const { t } = useTranslation();
  const { session } = useAuth();
  const query = useQuery({
    queryKey: ["maintenance-work-orders", session?.organization.id],
    queryFn: () => apiRequest<{ data: WorkOrder[] }>("/api/maintenance/work-orders", { token: session?.token }),
    enabled: !!session?.token,
  });
  const rows = query.data?.data ?? [];

  return (
    <div>
      <PageHeader title={t("maintenance.workOrders")} />
      {query.isPending ? <SkeletonList rows={5} /> : null}
      {rows.length === 0 && !query.isPending ? <EmptyState title={t("maintenance.emptyWorkOrders")} /> : null}
      {rows.length ? (
        <div className="list-stack">
          {rows.map((row) => (
            <div key={row.id} className="list-row">
              <div className="list-row-body">
                <div className="flex items-start justify-between gap-3">
                  <div className="list-row-title">{row.title ?? t("maintenance.workOrders")}</div>
                  <StatusPill>{row.status.replace(/_/g, " ")}</StatusPill>
                </div>
                <div className="list-row-meta">
                  {row.priority.replace(/_/g, " ")}
                  {row.estimatedCost ? ` · ${formatCurrency(row.estimatedCost)}` : ""}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
