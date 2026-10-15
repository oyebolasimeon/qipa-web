"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { SkeletonList } from "@/components/skeleton";
import { Button, Card, EmptyState, Field, PageHeader } from "@/components/ui";
import { apiRequest } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { useTranslation } from "@/lib/i18n";

type Contractor = { id: string; name: string; trades: string[]; phone?: string };

export default function MaintenanceContractorsPage() {
  const { t } = useTranslation();
  const { session } = useAuth();
  const queryClient = useQueryClient();
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");
  const [trades, setTrades] = useState("");
  const query = useQuery({
    queryKey: ["maintenance-contractors", session?.organization.id],
    queryFn: () => apiRequest<{ data: Contractor[] }>("/api/maintenance/contractors", { token: session?.token }),
    enabled: !!session?.token,
  });
  const save = useMutation({
    mutationFn: () =>
      apiRequest("/api/maintenance/contractors", {
        method: "POST",
        token: session?.token,
        body: { name: name.trim(), trades: trades.split(",").map((item) => item.trim()).filter(Boolean) },
      }),
    onSuccess: async () => {
      setAdding(false);
      setName("");
      setTrades("");
      await queryClient.invalidateQueries({ queryKey: ["maintenance-contractors"] });
    },
  });
  const rows = query.data?.data ?? [];

  return (
    <div>
      <PageHeader
        title={t("maintenance.contractors")}
        action={
          <Button onClick={() => setAdding((value) => !value)}>{t("maintenance.addContractor")}</Button>
        }
      />
      {adding ? (
        <Card className="mb-4">
          <Field label="Name" value={name} onChange={setName} />
          <Field label={t("maintenance.trades")} value={trades} onChange={setTrades} placeholder="plumbing, electrical" />
          <Button loading={save.isPending} onClick={() => save.mutate()}>
            {t("common.save")}
          </Button>
        </Card>
      ) : null}
      {query.isPending ? <SkeletonList rows={5} /> : null}
      {rows.length === 0 && !query.isPending ? <EmptyState title={t("maintenance.emptyContractors")} /> : null}
      <div className="space-y-3">
        {rows.map((row) => (
          <Card key={row.id}>
            <div className="font-semibold">{row.name}</div>
            <div className="text-sm text-[var(--text-secondary)]">{row.trades?.join(", ")}</div>
          </Card>
        ))}
      </div>
    </div>
  );
}
