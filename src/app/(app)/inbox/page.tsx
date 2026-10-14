"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { EmptyState, PageHeader, StatusPill } from "@/components/ui";
import { useAuth } from "@/lib/auth";
import { formatWhen } from "@/lib/format";
import { useTranslation } from "@/lib/i18n";
import { ocupaiPropertyName } from "@/lib/property-name";
import { conversationsQuery } from "@/lib/queries";
import {
  isFlatsharesWorkspace,
  isMaintenanceWorkspace,
  isSupportedWorkspace,
} from "@/lib/workspace-mode";
import FlatshareEnquiriesPage from "../flatshares/enquiries/page";
import MaintenanceContractorsPage from "../maintenance/contractors/page";
import SupportedReferralsPage from "../supported/referrals/page";

export default function InboxPage() {
  const { session } = useAuth();
  if (isSupportedWorkspace(session?.organization.kind)) return <SupportedReferralsPage />;
  if (isFlatsharesWorkspace(session?.organization.kind)) return <FlatshareEnquiriesPage />;
  if (isMaintenanceWorkspace(session?.organization.kind)) return <MaintenanceContractorsPage />;
  return <InboxInner />;
}

function InboxInner() {
  const { session } = useAuth();
  const { t } = useTranslation();
  const { data, isPending } = useQuery(conversationsQuery(session?.organization.id, session?.token));
  const rows = data?.data ?? [];

  return (
    <div>
      <PageHeader title={t("inbox.title")} subtitle={t("inbox.subtitle")} />
      {isPending ? <p className="text-[var(--text-muted)]">{t("common.loading")}</p> : null}
      {rows.length === 0 && !isPending ? <EmptyState title={t("inbox.empty")} /> : null}
      <div className="divide-y divide-[var(--border)] overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--glass-inner)]">
        {rows.map((row) => (
          <Link key={row.id} href={`/conversation/${row.id}`} className="block px-4 py-3.5 hover:bg-white/[0.03]">
            <div className="flex items-start justify-between gap-3">
              <div className="font-semibold">{row.guest?.fullName ?? t("common.guest")}</div>
              <div className="text-xs text-[var(--text-muted)]">{row.lastMessageAt ? formatWhen(row.lastMessageAt) : ""}</div>
            </div>
            <div className="mt-1 flex items-center gap-2 text-[13px] text-[var(--text-secondary)]">
              <span className="truncate">
                {ocupaiPropertyName(row.property)}
                {row.channel ? ` · ${row.channel}` : ""}
              </span>
              {row.status ? <StatusPill>{row.status}</StatusPill> : null}
            </div>
            <p className="mt-1 line-clamp-2 text-sm text-[var(--text-muted)]">{row.lastMessagePreview}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
