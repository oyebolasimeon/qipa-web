"use client";

import { useQuery } from "@tanstack/react-query";
import { Card, EmptyState, Kpi, PageHeader, StatusPill } from "@/components/ui";
import { apiRequest } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { formatCurrency } from "@/lib/format";
import { useTranslation } from "@/lib/i18n";

type Invoice = { id: string; number: string; total: number; outstanding: number; status: string; currency: string };
type Revenue = { expected: number; invoiced: number; collected: number; outstanding: number; overdue: number };

export default function SupportedFinancePage() {
  const { t } = useTranslation();
  const { session } = useAuth();
  const invoices = useQuery({
    queryKey: ["supported-invoices", session?.organization.id],
    queryFn: () => apiRequest<{ data: Invoice[] }>("/api/supported/invoices", { token: session?.token }),
    enabled: !!session?.token,
  });
  const revenue = useQuery({
    queryKey: ["supported-billing-revenue", session?.organization.id],
    queryFn: () => apiRequest<Revenue>("/api/supported/analytics/revenue", { token: session?.token }),
    enabled: !!session?.token,
  });
  const rows = invoices.data?.data ?? [];

  return (
    <div>
      <PageHeader title={t("supported.finance")} subtitle={t("supported.financeSubtitle")} />
      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Kpi label={t("supported.expected")} value={formatCurrency(revenue.data?.expected ?? 0)} />
        <Kpi label={t("supported.invoiced")} value={formatCurrency(revenue.data?.invoiced ?? 0)} />
        <Kpi label={t("supported.collected")} value={formatCurrency(revenue.data?.collected ?? 0)} />
        <Kpi label={t("supported.outstanding")} value={formatCurrency(revenue.data?.outstanding ?? 0)} />
      </div>
      {rows.length === 0 && !invoices.isPending ? <EmptyState title={t("supported.emptyInvoices")} /> : null}
      <div className="space-y-3">
        {rows.map((row) => (
          <Card key={row.id}>
            <div className="flex justify-between gap-3">
              <div className="font-semibold">{row.number}</div>
              <StatusPill>{row.status}</StatusPill>
            </div>
            <div className="mt-1 text-sm text-[var(--text-secondary)]">
              {formatCurrency(row.total, row.currency)} · {formatCurrency(row.outstanding, row.currency)} due
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
