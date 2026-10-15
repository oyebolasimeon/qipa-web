"use client";

import { useQuery } from "@tanstack/react-query";
import { SkeletonList } from "@/components/skeleton";
import { EmptyState, Glass, PageHeader, StatusPill } from "@/components/ui";
import { apiRequest } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { useTranslation } from "@/lib/i18n";

type Decision = {
  id: string;
  title: string;
  summary: string;
  risk?: string;
  recommendedAction?: string;
};

function riskColor(risk?: string) {
  if (risk === "RED") return "var(--accent)";
  if (risk === "AMBER") return "#F5A524";
  return "var(--success)";
}

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
      {query.isPending ? <SkeletonList rows={5} /> : null}
      {rows.length === 0 && !query.isPending ? (
        <EmptyState title={t("home.inControl")} body={t("home.decisionsEmpty")} />
      ) : null}
      <div className="space-y-3">
        {rows.map((row) => (
          <Glass key={row.id} accent={row.risk === "RED" || row.risk === "AMBER"}>
            <div className="flex items-start justify-between gap-3">
              <div className="font-[family-name:var(--font-outfit)] text-[16px] font-semibold">{row.title}</div>
              {row.risk ? <StatusPill color={riskColor(row.risk)}>{row.risk}</StatusPill> : null}
            </div>
            <p className="mt-2 text-sm leading-relaxed text-[var(--text-secondary)]">{row.summary}</p>
            {row.recommendedAction ? (
              <p className="mt-3 rounded-xl bg-[var(--primary-muted)] px-3 py-2 text-sm text-[var(--mist)]">
                {row.recommendedAction}
              </p>
            ) : null}
          </Glass>
        ))}
      </div>
    </div>
  );
}
