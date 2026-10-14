"use client";

import { useQuery } from "@tanstack/react-query";
import { Kpi, PageHeader } from "@/components/ui";
import { useAuth } from "@/lib/auth";
import { formatCurrency, occupancyPct } from "@/lib/format";
import { briefingQuery } from "@/lib/queries";

export default function AnalyticsPage() {
  const { session } = useAuth();
  const { data } = useQuery(briefingQuery(session?.organization.id, session?.token));

  return (
    <div>
      <PageHeader title="Revenue & analytics" />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Kpi label="Revenue" value={formatCurrency(data?.kpis.revenueThisMonth ?? 0)} />
        <Kpi label="Occupancy" value={occupancyPct(data?.kpis.occupancy ?? 0)} />
        <Kpi label="ADR" value={formatCurrency(data?.kpis.adr ?? 0)} />
        <Kpi label="RevPAR" value={formatCurrency(data?.kpis.revpar ?? 0)} />
      </div>
    </div>
  );
}
