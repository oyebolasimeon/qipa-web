"use client";

import { useQuery } from "@tanstack/react-query";
import { Card, EmptyState, PageHeader, StatusPill } from "@/components/ui";
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
      <PageHeader title={t("supported.referrals")} subtitle={t("supported.referralsSubtitle")} />
      {rows.length === 0 && !query.isPending ? <EmptyState title={t("supported.emptyReferrals")} /> : null}
      <div className="space-y-3">
        {rows.map((row) => {
          const name = `${row.person?.firstName ?? ""} ${row.person?.lastName ?? ""}`.trim() || row.referralCode;
          return (
            <Card key={row.id}>
              <div className="flex justify-between gap-3">
                <div className="font-semibold">{name}</div>
                <StatusPill>{row.status}</StatusPill>
              </div>
              <div className="mt-1 text-sm text-[var(--text-secondary)]">
                {row.source} {row.localAuthority ? `· ${row.localAuthority}` : ""}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
