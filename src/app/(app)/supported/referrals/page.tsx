"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { SkeletonList } from "@/components/skeleton";
import { EmptyState, PageHeader, StatusPill } from "@/components/ui";
import { apiRequest } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { useTranslation } from "@/lib/i18n";

type Referral = {
  id: string;
  referralCode: string;
  source: string;
  status: string;
  localAuthority?: string;
  person?: { firstName?: string; lastName?: string } | null;
};

export default function SupportedReferralsPage() {
  const { t } = useTranslation();
  const { session } = useAuth();
  const query = useQuery({
    queryKey: ["supported-referrals", session?.organization.id],
    queryFn: () => apiRequest<{ data: Referral[] }>("/api/supported/referrals", { token: session?.token }),
    enabled: !!session?.token,
  });
  const rows = query.data?.data ?? [];

  return (
    <div>
      <PageHeader
        title={t("supported.referrals")}
        subtitle={t("supported.referralsSubtitle")}
        action={
          <Link href="/supported/referrals/new" className="btn btn-primary btn-sm">
            New referral
          </Link>
        }
      />
      {query.isPending ? <SkeletonList rows={5} /> : null}
      {rows.length === 0 && !query.isPending ? (
        <EmptyState title={t("supported.emptyReferrals")} action="New referral" href="/supported/referrals/new" />
      ) : null}
      {rows.length ? (
        <div className="list-stack">
          {rows.map((row) => {
            const name = `${row.person?.firstName ?? ""} ${row.person?.lastName ?? ""}`.trim() || row.referralCode;
            const initials = name
              .split(" ")
              .filter(Boolean)
              .slice(0, 2)
              .map((part) => part[0])
              .join("")
              .toUpperCase();
            return (
              <Link key={row.id} href={`/supported/referrals/${row.id}`} className="list-row">
                <div className="avatar">{initials || "?"}</div>
                <div className="list-row-body">
                  <div className="flex items-start justify-between gap-3">
                    <div className="list-row-title">{name}</div>
                    <StatusPill>{row.status.replace(/_/g, " ")}</StatusPill>
                  </div>
                  <div className="list-row-meta">
                    {row.source}
                    {row.localAuthority ? ` · ${row.localAuthority}` : ""}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
