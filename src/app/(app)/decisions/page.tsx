"use client";

import { useQuery } from "@tanstack/react-query";
import { EmptyState, Glass, PageHeader } from "@/components/ui";
import { apiRequest } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { useTranslation } from "@/lib/i18n";

type Decision = { id: string; title: string; summary: string; risk?: string; recommendedAction?: string };

export default function DecisionsPage() {
  const { t } = useTranslation();
  const { session } = useAuth();
  const query = useQuery({
    queryKey: ["decisions", session?.organization.id],
    queryFn: () => apiRequest<{ data: Decision[] }>("/api/decisions?status=OPEN", { token: session?.token }),
    enabled: !!session?.token,
  });
  const rows = query.data?.data ?? [];

  return (
    <div>
      <PageHeader title={t("more.items.decisionsNeeded")} subtitle={t("home.requiresJudgment")} />
      {rows.length === 0 && !query.isPending ? (
        <EmptyState title={t("home.inControl")} body={t("home.decisionsEmpty")} />
      ) : null}
      <div className="space-y-3">
        {rows.map((row) => (
          <Glass key={row.id}>
            <div className="font-semibold">{row.title}</div>
            <p className="mt-1 text-sm text-[var(--text-secondary)]">{row.summary}</p>
            {row.recommendedAction ? <p className="mt-2 text-sm text-[var(--mist)]">{row.recommendedAction}</p> : null}
          </Glass>
        ))}
      </div>
    </div>
  );
}
