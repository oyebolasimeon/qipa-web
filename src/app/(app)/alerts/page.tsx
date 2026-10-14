"use client";

import { useQuery } from "@tanstack/react-query";
import { Card, EmptyState, PageHeader } from "@/components/ui";
import { useAuth } from "@/lib/auth";
import { briefingQuery } from "@/lib/queries";

export default function AlertsPage() {
  const { session } = useAuth();
  const { data } = useQuery(briefingQuery(session?.organization.id, session?.token));
  const items = data?.needsAttention ?? [];

  return (
    <div>
      <PageHeader title="Alerts & updates" />
      {items.length === 0 ? <EmptyState title="Nothing needs attention right now." /> : null}
      <div className="space-y-3">
        {items.map((item) => (
          <Card key={item.id}>
            <div className="text-xs uppercase tracking-wider text-[var(--text-muted)]">{item.propertyName}</div>
            <div className="mt-1">{item.message}</div>
          </Card>
        ))}
      </div>
    </div>
  );
}
