"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { Glass, PageHeader, StatusPill } from "@/components/ui";
import { apiRequest } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { formatCurrency } from "@/lib/format";

type Referral = {
  id: string;
  referralCode: string;
  source: string;
  status: string;
  localAuthority?: string;
  fundingMaxWeekly?: number;
  person?: { firstName?: string; lastName?: string } | null;
};

export default function SupportedReferralDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { session } = useAuth();
  const query = useQuery({
    queryKey: ["supported-referral", id],
    queryFn: () => apiRequest<Referral>(`/api/supported/referrals/${id}`, { token: session?.token }),
    enabled: !!session?.token && !!id,
  });
  const row = query.data;
  const name = `${row?.person?.firstName ?? ""} ${row?.person?.lastName ?? ""}`.trim() || row?.referralCode || "Referral";

  return (
    <div>
      <PageHeader title={name} action={<StatusPill>{row?.status}</StatusPill>} />
      <Glass>
        <div>{row?.source}</div>
        <div className="text-sm text-[var(--text-secondary)]">{row?.localAuthority}</div>
        {row?.fundingMaxWeekly ? <div className="mt-2">{formatCurrency(row.fundingMaxWeekly)} / week max</div> : null}
        <div className="mt-2 text-xs text-[var(--text-muted)]">{row?.referralCode}</div>
      </Glass>
    </div>
  );
}
