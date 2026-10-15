"use client";

import { useQuery } from "@tanstack/react-query";
import { SkeletonList } from "@/components/skeleton";
import { EmptyState, PageHeader, StatusPill } from "@/components/ui";
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
      {query.isPending ? <SkeletonList rows={5} /> : null}
      {rows.length === 0 && !query.isPending ? <EmptyState title={t("flatshares.emptyEnquiries")} /> : null}
      {rows.length ? (
        <div className="list-stack">
          {rows.map((row) => {
            const initials = row.name
              .split(" ")
              .filter(Boolean)
              .slice(0, 2)
              .map((part) => part[0])
              .join("")
              .toUpperCase();
            return (
              <div key={row.id} className="list-row !items-start">
                <div className="avatar">{initials || "?"}</div>
                <div className="list-row-body">
                  <div className="flex items-start justify-between gap-3">
                    <div className="list-row-title">{row.name}</div>
                    <StatusPill>{row.stage.replace(/_/g, " ")}</StatusPill>
                  </div>
                  <div className="list-row-meta">{row.email}</div>
                  {row.message ? <p className="mt-2 text-sm text-[var(--text-secondary)]">{row.message}</p> : null}
                </div>
              </div>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
