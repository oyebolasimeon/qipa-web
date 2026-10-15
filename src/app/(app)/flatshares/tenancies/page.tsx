"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { SkeletonList } from "@/components/skeleton";
import { Button, EmptyState, PageHeader, StatusPill } from "@/components/ui";
import { apiRequest } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { formatCurrency, formatDate } from "@/lib/format";
import { useTranslation } from "@/lib/i18n";

type Tenancy = { id: string; tenantName: string; status: string; rentAmount: number; startDate: string };

export default function FlatshareTenanciesPage() {
  const { t } = useTranslation();
  const { session } = useAuth();
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: ["flatshare-tenancies", session?.organization.id],
    queryFn: () => apiRequest<{ data: Tenancy[] }>("/api/flatshares/tenancies", { token: session?.token }),
    enabled: !!session?.token,
  });
  const activate = useMutation({
    mutationFn: (id: string) =>
      apiRequest(`/api/flatshares/tenancies/${id}/activate`, { method: "POST", token: session?.token }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["flatshare-tenancies"] });
    },
  });
  const rows = query.data?.data ?? [];

  return (
    <div>
      <PageHeader title={t("flatshares.tenancies")} />
      {query.isPending ? <SkeletonList rows={5} /> : null}
      {rows.length === 0 && !query.isPending ? <EmptyState title={t("flatshares.emptyTenancies")} /> : null}
      {rows.length ? (
        <div className="list-stack">
          {rows.map((row) => {
            const initials = row.tenantName
              .split(" ")
              .filter(Boolean)
              .slice(0, 2)
              .map((part) => part[0])
              .join("")
              .toUpperCase();
            return (
              <div key={row.id} className="list-row !items-start">
                <div className="avatar">{initials || "?"}</div>
                <div className="list-row-body">
                  <div className="flex items-start justify-between gap-3">
                    <div className="list-row-title">{row.tenantName}</div>
                    <StatusPill>{row.status.replace(/_/g, " ")}</StatusPill>
                  </div>
                  <div className="list-row-meta">
                    {formatCurrency(row.rentAmount)} · {formatDate(row.startDate)}
                  </div>
                  {row.status !== "ACTIVE" ? (
                    <Button size="sm" className="mt-3" onClick={() => activate.mutate(row.id)}>
                      {t("flatshares.activate")}
                    </Button>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
