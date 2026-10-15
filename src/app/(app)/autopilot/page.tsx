"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { SkeletonKpis, SkeletonList } from "@/components/skeleton";
import { Glass, Kpi, PageHeader } from "@/components/ui";
import { apiRequest } from "@/lib/api";
import { useAuth } from "@/lib/auth";

type ProductMode = "OBSERVE" | "COPILOT" | "ASSISTED" | "AUTOPILOT";
const MODES: ProductMode[] = ["OBSERVE", "COPILOT", "ASSISTED", "AUTOPILOT"];

type AutopilotSettings = {
  autonomyMode: ProductMode;
  policies: Array<{
    id: string;
    intent: string;
    mode: ProductMode;
    minConfidence: number;
    riskLevel: string;
    enabled: boolean;
  }>;
  stats: { pendingApprovals: number; executedToday: number };
};

export default function AutopilotPage() {
  const { session } = useAuth();
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: ["autopilot-settings", session?.organization.id],
    queryFn: () => apiRequest<AutopilotSettings>("/api/autopilot/settings", { token: session?.token }),
    enabled: !!session?.token,
  });
  const modeMutation = useMutation({
    mutationFn: (mode: ProductMode) =>
      apiRequest("/api/autopilot/mode", { method: "PATCH", token: session?.token, body: { mode } }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["autopilot-settings"] }),
  });
  const policyMutation = useMutation({
    mutationFn: ({ intent, enabled }: { intent: string; enabled: boolean }) =>
      apiRequest(`/api/autopilot/policies/${intent}`, {
        method: "PATCH",
        token: session?.token,
        body: { enabled },
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["autopilot-settings"] }),
  });
  const data = query.data;

  if (query.isPending && !data) {
    return (
      <div>
        <PageHeader title="Autopilot" subtitle="How much Ocupai can do without asking you" />
        <SkeletonKpis count={2} />
        <SkeletonList rows={4} withAvatar={false} />
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Autopilot" subtitle="How much Ocupai can do without asking you" />
      <Glass className="mb-4">
        <div className="mb-3 text-[11px] font-medium uppercase tracking-[2.8px] text-[var(--text-muted)]">
          Organization mode
        </div>
        <div className="filter-row mb-0">
          {MODES.map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => modeMutation.mutate(mode)}
              className={`filter-chip ${data?.autonomyMode === mode ? "on" : ""}`}
            >
              {mode}
            </button>
          ))}
        </div>
      </Glass>
      <div className="mb-4 grid grid-cols-2 gap-3">
        <Kpi label="Auto actions today" value={String(data?.stats.executedToday ?? 0)} />
        <Kpi label="Waiting on you" value={String(data?.stats.pendingApprovals ?? 0)} />
      </div>
      {(data?.stats.pendingApprovals ?? 0) > 0 ? (
        <Link href="/pending-drafts" className="mb-4 inline-block text-sm font-semibold text-[var(--mist)]">
          Review pending drafts
        </Link>
      ) : null}
      {(data?.policies ?? []).length ? (
        <div className="list-stack">
          {(data?.policies ?? []).map((policy) => (
            <div key={policy.id} className="list-row">
              <div className="list-row-body">
                <div className="list-row-title">{policy.intent.replace(/_/g, " ")}</div>
                <div className="list-row-meta">
                  {policy.mode} · confidence {Math.round(policy.minConfidence * 100)}% · {policy.riskLevel}
                </div>
              </div>
              <button
                type="button"
                onClick={() => policyMutation.mutate({ intent: policy.intent, enabled: !policy.enabled })}
                className={`filter-chip ${policy.enabled ? "on" : ""}`}
              >
                {policy.enabled ? "On" : "Off"}
              </button>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
