"use client";

import { useQuery } from "@tanstack/react-query";
import { Card, EmptyState, PageHeader, StatusPill } from "@/components/ui";
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
      {rows.length === 0 && !query.isPending ? <EmptyState title={t("maintenance.emptyWorkOrders")} /> : null}
      <div className="space-y-3">
        {rows.map((row) => (
          <Card key={row.id}>
            <div className="flex justify-between gap-3">
              <div className="font-semibold">{row.title ?? t("maintenance.workOrders")}</div>
              <StatusPill>{row.status}</StatusPill>
            </div>
            <div className="mt-1 text-sm text-[var(--text-secondary)]">
              {row.priority}
              {row.estimatedCost ? ` · ${formatCurrency(row.estimatedCost)}` : ""}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
