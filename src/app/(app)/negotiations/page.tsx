"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { SkeletonList } from "@/components/skeleton";
import { Button, EmptyState, PageHeader, StatusPill } from "@/components/ui";
import { apiRequest } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { formatCurrency } from "@/lib/format";
import { ocupaiPropertyName } from "@/lib/property-name";
import { canOperate } from "@/lib/roles";

type Negotiation = {
  id?: string;
  _id?: string;
  originalRate: number;
  floorRate: number;
  currency: string;
  status?: string;
  property?: { publicName?: string; internalName?: string };
  offers?: Array<{ amount: number }>;
};

export default function NegotiationsPage() {
  const { session } = useAuth();
  const operate = canOperate(session?.membership.role);
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: ["negotiations", session?.organization.id],
    queryFn: () => apiRequest<Negotiation[]>("/api/negotiations?status=ACTIVE", { token: session?.token }),
    enabled: !!session?.token,
  });
  const resolve = useMutation({
    mutationFn: ({ id, action }: { id: string; action: "ACCEPT" | "REJECT" }) =>
      apiRequest(`/api/negotiations/${id}/resolve`, { method: "POST", token: session?.token, body: { action } }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["negotiations"] });
      void queryClient.invalidateQueries({ queryKey: ["briefing"] });
    },
  });
  const rows = query.data ?? [];

  return (
    <div>
      <PageHeader title="Negotiations" subtitle="Guest offers that need a commercial decision" />
      {query.isPending ? <SkeletonList rows={5} /> : null}
      {rows.length === 0 && !query.isPending ? <EmptyState title="No active negotiations." /> : null}
      {rows.length ? (
        <div className="list-stack">
          {rows.map((row) => {
            const id = row.id ?? row._id ?? "";
            const latest = row.offers?.[row.offers.length - 1];
            return (
              <div key={id} className="list-row !items-start">
                <div className="list-row-body">
                  <div className="flex items-start justify-between gap-3">
                    <Link href={`/negotiation/${id}`} className="list-row-title hover:text-[var(--mist)]">
                      {ocupaiPropertyName(row.property)}
                    </Link>
                    <StatusPill>{(row.status ?? "active").replace(/_/g, " ")}</StatusPill>
                  </div>
                  <div className="list-row-meta">
                    Listed {formatCurrency(row.originalRate, row.currency)} · floor{" "}
                    {formatCurrency(row.floorRate, row.currency)}
                    {latest ? ` · latest ${formatCurrency(latest.amount, row.currency)}` : ""}
                  </div>
                  {operate ? (
                    <div className="mt-3 flex gap-2">
                      <Button size="sm" onClick={() => resolve.mutate({ id, action: "ACCEPT" })}>
                        Accept
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => resolve.mutate({ id, action: "REJECT" })}>
                        Reject
                      </Button>
                    </div>
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
