"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { SkeletonList } from "@/components/skeleton";
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
      {isPending ? <SkeletonList rows={7} /> : null}
      {rows.length === 0 && !isPending ? <EmptyState title={t("inbox.empty")} /> : null}
      {rows.length ? (
        <div className="list-stack">
          {rows.map((row) => {
            const name = row.guest?.fullName ?? t("common.guest");
            const initials = name
              .split(" ")
              .filter(Boolean)
              .slice(0, 2)
              .map((part) => part[0])
              .join("")
              .toUpperCase();
            return (
              <Link key={row.id} href={`/conversation/${row.id}`} className="list-row">
                <div className="avatar">{initials || "?"}</div>
                <div className="list-row-body">
                  <div className="flex items-start justify-between gap-3">
                    <div className="list-row-title">{name}</div>
                    <div className="shrink-0 text-xs text-[var(--text-muted)]">
                      {row.lastMessageAt ? formatWhen(row.lastMessageAt) : ""}
                    </div>
                  </div>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="list-row-meta truncate">
                      {ocupaiPropertyName(row.property)}
                      {row.channel ? ` · ${row.channel}` : ""}
                    </span>
                    {row.status ? <StatusPill>{row.status}</StatusPill> : null}
                  </div>
                  <p className="list-row-sub line-clamp-2">{row.lastMessagePreview}</p>
                </div>
              </Link>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
