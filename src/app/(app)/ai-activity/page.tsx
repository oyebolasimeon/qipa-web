"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { SkeletonList } from "@/components/skeleton";
import { EmptyState, Glass, PageHeader, StatusPill } from "@/components/ui";
import { apiRequest } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { formatWhen } from "@/lib/format";

type Entry = {
  id?: string;
  trigger: string;
  timestamp: string;
  status: string;
  recommendation: string;
  effect: string;
  actionKind?: string;
  context?: Array<{ factId: string; relevance: string }>;
};

const FILTERS = ["ALL", "EXECUTED", "PENDING", "REJECTED"] as const;

export default function AiActivityPage() {
  const { session } = useAuth();
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("ALL");
  const query = useQuery({
    queryKey: ["ai-activity", filter, session?.organization.id],
    queryFn: () =>
      apiRequest<{ data?: Entry[] } | Entry[]>(
        `/api/ai-activity${filter === "ALL" ? "" : `?filter=${filter}`}`,
        { token: session?.token },
      ),
    enabled: !!session?.token,
  });
  const rows = Array.isArray(query.data) ? query.data : query.data?.data ?? [];

  return (
    <div>
      <PageHeader title="AI activity" subtitle="What Ocupai recommended and what actually happened" />
      <div className="filter-row">
        {FILTERS.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setFilter(item)}
            className={`filter-chip ${filter === item ? "on" : ""}`}
          >
            {item}
          </button>
        ))}
      </div>
      {query.isPending ? <SkeletonList rows={5} /> : null}
      {rows.length === 0 && !query.isPending ? <EmptyState title="No AI activity yet." /> : null}
      <div className="space-y-3">
        {rows.map((entry, index) => (
          <Glass key={entry.id ?? index}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="font-[family-name:var(--font-outfit)] font-semibold">
                  {entry.trigger.replace(/_/g, " ")}
                </div>
                <div className="text-xs text-[var(--text-muted)]">{formatWhen(entry.timestamp)}</div>
              </div>
              <StatusPill>{entry.status.replace(/_/g, " ")}</StatusPill>
            </div>
            <div className="mt-3 rounded-xl bg-[var(--surface)] px-3 py-2.5 text-sm">
              <div className="text-[11px] uppercase tracking-[0.18em] text-[var(--text-muted)]">Recommendation</div>
              <p className="mt-1 whitespace-pre-wrap text-[var(--text-secondary)]">{entry.recommendation}</p>
            </div>
            <div className="mt-2 rounded-xl bg-[var(--primary-muted)] px-3 py-2.5 text-sm">
              <div className="text-[11px] uppercase tracking-[0.18em] text-[var(--text-muted)]">Final action</div>
              <p className="mt-1 whitespace-pre-wrap">{entry.effect}</p>
            </div>
          </Glass>
        ))}
      </div>
    </div>
  );
}
