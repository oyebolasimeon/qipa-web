"use client";

import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, Info } from "lucide-react";
import Link from "next/link";
import { SkeletonList } from "@/components/skeleton";
import { EmptyState, Glass, PageHeader } from "@/components/ui";
import { useAuth } from "@/lib/auth";
import { briefingQuery } from "@/lib/queries";

export default function AlertsPage() {
  const { session } = useAuth();
  const { data, isPending } = useQuery(briefingQuery(session?.organization.id, session?.token));
  const items = data?.needsAttention ?? [];
  const activity = data?.qipaActivity ?? [];

  return (
    <div>
      <PageHeader title="Alerts & updates" subtitle="What needs eyes and what Ocupai already handled" />
      {isPending ? <SkeletonList rows={4} /> : null}
      {items.length === 0 && !isPending ? <EmptyState title="Nothing needs attention right now." /> : null}
      <div className="space-y-3">
        {items.map((item) => {
          const critical = item.severity === "critical" || item.severity === "warning";
          return (
            <Glass key={item.id} accent={critical}>
              <div className="flex gap-3">
                <span
                  className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px]"
                  style={{
                    background: critical ? "rgba(155,40,72,0.15)" : "var(--primary-muted)",
                    color: critical ? "var(--accent)" : "var(--primary)",
                  }}
                >
                  {critical ? <AlertTriangle size={16} /> : <Info size={16} />}
                </span>
                <div>
                  <div className="text-xs uppercase tracking-[0.18em] text-[var(--text-muted)]">{item.propertyName}</div>
                  <div className="mt-1 font-medium">{item.message}</div>
                </div>
              </div>
            </Glass>
          );
        })}
      </div>
      {activity.length ? (
        <div className="mt-8">
          <div className="mb-3 text-[11px] font-medium uppercase tracking-[2.8px] text-[var(--text-muted)]">Recent activity</div>
          <div className="list-stack">
            {activity.slice(0, 8).map((item) => (
              <div key={item.id} className="list-row">
                <div className="list-row-body">
                  <div className="list-row-title">{item.title}</div>
                  <div className="list-row-meta">{item.description}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}
      <Link href="/pending-drafts" className="mt-6 inline-block text-sm font-semibold text-[var(--mist)]">
        Review pending AI drafts
      </Link>
    </div>
  );
}
