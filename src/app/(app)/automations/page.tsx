"use client";

import { useQuery } from "@tanstack/react-query";
import { SkeletonList } from "@/components/skeleton";
import { EmptyState, PageHeader, StatusPill } from "@/components/ui";
import { apiRequest } from "@/lib/api";
import { useAuth } from "@/lib/auth";

type Automation = { id?: string; name?: string; title?: string; status?: string; enabled?: boolean; intent?: string };

export default function AutomationsPage() {
  const { session } = useAuth();
  const query = useQuery({
    queryKey: ["automations", session?.organization.id],
    queryFn: () => apiRequest<Automation[] | { data: Automation[] }>("/api/automations", { token: session?.token }),
    enabled: !!session?.token,
  });
  const rows = Array.isArray(query.data) ? query.data : query.data?.data ?? [];

  return (
    <div>
      <PageHeader title="Automations" subtitle="Rules Ocupai can run without waiting on you" />
      {query.isPending ? <SkeletonList rows={5} /> : null}
      {rows.length === 0 && !query.isPending ? <EmptyState title="No automations yet." /> : null}
      {rows.length ? (
        <div className="list-stack">
          {rows.map((row, index) => (
            <div key={row.id ?? index} className="list-row">
              <div className="list-row-body">
                <div className="flex items-start justify-between gap-3">
                  <div className="list-row-title">{row.title ?? row.name ?? row.intent ?? "Automation"}</div>
                  <StatusPill color={row.enabled === false ? "var(--text-muted)" : "var(--success)"}>
                    {row.enabled === false ? "Off" : row.status ?? "On"}
                  </StatusPill>
                </div>
                {row.intent ? <div className="list-row-meta">{row.intent.replace(/_/g, " ")}</div> : null}
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
