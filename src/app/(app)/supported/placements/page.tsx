"use client";

import { useQuery } from "@tanstack/react-query";
import { SkeletonList } from "@/components/skeleton";
import { Card, EmptyState, PageHeader, StatusPill } from "@/components/ui";
import { apiRequest } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { formatCurrency, formatDate } from "@/lib/format";
import { useTranslation } from "@/lib/i18n";

type Placement = {
  id: string;
  status: string;
  weeklyRate: number;
  currency: string;
  startDate: string;
  personName?: string;
  roomNumber?: string;
};

export default function SupportedPlacementsPage() {
  const { t } = useTranslation();
  const { session } = useAuth();
  const query = useQuery({
    queryKey: ["supported-placements", session?.organization.id],
    queryFn: () => apiRequest<{ data: Placement[] }>("/api/supported/placements", { token: session?.token }),
    enabled: !!session?.token,
  });
  const rows = query.data?.data ?? [];

  return (
    <div>
      <PageHeader title={t("supported.placements")} subtitle={t("supported.placementsSubtitle")} />
      {query.isPending ? <SkeletonList rows={5} /> : null}
      {rows.length === 0 && !query.isPending ? <EmptyState title={t("supported.emptyPlacements")} /> : null}
      <div className="space-y-3">
        {rows.map((row) => (
          <Card key={row.id}>
            <div className="flex justify-between gap-3">
              <div className="font-semibold">{row.personName ?? "Resident"}</div>
              <StatusPill>{row.status}</StatusPill>
            </div>
            <div className="mt-1 text-sm text-[var(--text-secondary)]">
              Room {row.roomNumber} · {formatCurrency(row.weeklyRate, row.currency)} · {formatDate(row.startDate)}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
