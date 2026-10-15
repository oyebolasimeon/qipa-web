"use client";

import { useQuery } from "@tanstack/react-query";
import { SkeletonKpis, SkeletonList } from "@/components/skeleton";
import { Glass, Kpi, PageHeader } from "@/components/ui";
import { apiRequest } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { formatCurrency } from "@/lib/format";

type Month = {
  start?: string;
  label?: string;
  revenue?: number;
  costs?: number;
  profit?: number;
  occupancy?: number;
  currency?: string;
};

export default function PnlJournalPage() {
  const { session } = useAuth();
  const query = useQuery({
    queryKey: ["pnl-journal", session?.organization.id],
    queryFn: () => apiRequest<{ months?: Month[] } | Month[]>("/api/pnl/journal", { token: session?.token }),
    enabled: !!session?.token,
  });
  const months = Array.isArray(query.data) ? query.data : query.data?.months ?? [];

  if (query.isPending) {
    return (
      <div>
        <PageHeader title="P&L journal" subtitle="Revenue, costs and profit by month" />
        <SkeletonKpis count={3} />
        <SkeletonList rows={4} withAvatar={false} />
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="P&L journal" subtitle="Revenue, costs and profit by month" />
      {months[0] ? (
        <div className="mb-4 grid grid-cols-3 gap-3">
          <Kpi label="Revenue" value={formatCurrency(months[0].revenue ?? 0, months[0].currency)} />
          <Kpi label="Costs" value={formatCurrency(months[0].costs ?? 0, months[0].currency)} />
          <Kpi label="Profit" value={formatCurrency(months[0].profit ?? 0, months[0].currency)} />
        </div>
      ) : null}
      <div className="space-y-3">
        {months.map((month, index) => (
          <Glass key={month.start ?? index}>
            <div className="flex justify-between gap-3">
              <div className="font-semibold">
                {month.label ??
                  (month.start
                    ? new Date(month.start).toLocaleDateString("en-GB", { month: "long", year: "numeric" })
                    : `Month ${index + 1}`)}
              </div>
              <div>{formatCurrency(month.profit ?? 0, month.currency)}</div>
            </div>
            <div className="mt-1 text-sm text-[var(--text-secondary)]">
              In {formatCurrency(month.revenue ?? 0, month.currency)} · out {formatCurrency(month.costs ?? 0, month.currency)}
            </div>
          </Glass>
        ))}
      </div>
    </div>
  );
}
