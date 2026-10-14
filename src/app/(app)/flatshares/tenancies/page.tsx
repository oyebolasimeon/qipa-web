"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button, Card, EmptyState, PageHeader, StatusPill } from "@/components/ui";
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
      {rows.length === 0 && !query.isPending ? <EmptyState title={t("flatshares.emptyTenancies")} /> : null}
      <div className="space-y-3">
        {rows.map((row) => (
          <Card key={row.id}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="font-semibold">{row.tenantName}</div>
                <div className="text-sm text-[var(--text-secondary)]">
                  {formatCurrency(row.rentAmount)} · {formatDate(row.startDate)}
                </div>
              </div>
              <StatusPill>{row.status}</StatusPill>
            </div>
            {row.status !== "ACTIVE" ? (
              <Button className="mt-3" onClick={() => activate.mutate(row.id)}>
                {t("flatshares.activate")}
              </Button>
            ) : null}
          </Card>
        ))}
      </div>
    </div>
  );
}
