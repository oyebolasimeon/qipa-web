"use client";

import { useQuery } from "@tanstack/react-query";
import { Card, EmptyState, PageHeader, StatusPill } from "@/components/ui";
import { apiRequest } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { useTranslation } from "@/lib/i18n";

type Enquiry = { id: string; name: string; stage: string; message?: string; email?: string };

export default function FlatshareEnquiriesPage() {
  const { t } = useTranslation();
  const { session } = useAuth();
  const query = useQuery({
    queryKey: ["flatshare-enquiries", session?.organization.id],
    queryFn: () => apiRequest<{ data: Enquiry[] }>("/api/flatshares/enquiries", { token: session?.token }),
    enabled: !!session?.token,
  });
  const rows = query.data?.data ?? [];

  return (
    <div>
      <PageHeader title={t("flatshares.enquiries")} />
      {rows.length === 0 && !query.isPending ? <EmptyState title={t("flatshares.emptyEnquiries")} /> : null}
      <div className="space-y-3">
        {rows.map((row) => (
          <Card key={row.id}>
            <div className="flex justify-between gap-3">
              <div className="font-semibold">{row.name}</div>
              <StatusPill>{row.stage}</StatusPill>
            </div>
            <div className="mt-1 text-sm text-[var(--text-secondary)]">{row.email}</div>
            {row.message ? <p className="mt-2 text-sm">{row.message}</p> : null}
          </Card>
        ))}
      </div>
    </div>
  );
}
