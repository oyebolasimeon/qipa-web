"use client";

import { useQuery } from "@tanstack/react-query";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { SkeletonList } from "@/components/skeleton";
import { EmptyState, Glass, Kpi, PageHeader, StatusPill } from "@/components/ui";
import { apiRequest } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { formatCurrency, formatDate } from "@/lib/format";
import { ocupaiPropertyName } from "@/lib/property-name";

type OwnerRow = {
  id?: string;
  _id?: string;
  name: string;
  email?: string;
  property?: { publicName?: string; internalName?: string };
  ownershipPercent?: number;
  pendingPayout?: number;
  currency?: string;
};

type OwnerPortalSummary = {
  ownerCount: number;
  pendingPayouts: number;
  owners: OwnerRow[];
  recentStatements?: Array<{
    id?: string;
    _id?: string;
    periodStart?: string;
    periodEnd?: string;
    status?: string;
    netAmount?: number;
    currency?: string;
  }>;
};

export default function OwnersPage() {
  const { session } = useAuth();
  const canManage = ["SUPER_ADMIN", "ADMIN", "MANAGER", "ACCOUNTANT"].includes(session?.membership.role ?? "");
  const query = useQuery({
    queryKey: ["owners", session?.organization.id],
    queryFn: () => apiRequest<OwnerPortalSummary>("/api/owners", { token: session?.token }),
    enabled: !!session?.token,
  });
  const owners = query.data?.owners ?? [];
  const statements = query.data?.recentStatements ?? [];

  return (
    <div>
      <PageHeader
        title="Owner portal"
        subtitle="Statements, payouts and property shares"
        action={
          canManage ? (
            <Link href="/owner/new" className="btn btn-primary btn-sm">
              Add owner
            </Link>
          ) : (
            <Link href="/contact-manager" className="btn btn-ghost btn-sm">
              Message manager
            </Link>
          )
        }
      />
      <div className="mb-4 grid grid-cols-2 gap-3">
        <Kpi label="Owners" value={String(query.data?.ownerCount ?? 0)} />
        <Kpi label="Unpaid" value={String(query.data?.pendingPayouts ?? 0)} />
      </div>
      <Link href="/pnl-journal" className="mb-4 block">
        <Glass>
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="font-[family-name:var(--font-outfit)] font-semibold">P&L journal</div>
              <div className="text-sm text-[var(--text-secondary)]">Month-by-month revenue and costs</div>
            </div>
            <ChevronRight size={16} className="text-[var(--text-muted)]" />
          </div>
        </Glass>
      </Link>
      {query.isPending ? <SkeletonList rows={5} /> : null}
      {owners.length === 0 && !query.isPending ? (
        <EmptyState title="No owners yet." action={canManage ? "Add owner" : undefined} href="/owner/new" />
      ) : null}
      {owners.length ? (
        <div className="list-stack mb-6">
          {owners.map((owner) => {
            const id = owner.id ?? owner._id ?? "";
            const initials = owner.name
              .split(" ")
              .filter(Boolean)
              .slice(0, 2)
              .map((part) => part[0])
              .join("")
              .toUpperCase();
            return (
              <Link key={id} href={`/owner/${id}`} className="list-row">
                <div className="avatar">{initials || "?"}</div>
                <div className="list-row-body">
                  <div className="list-row-title">{owner.name}</div>
                  <div className="list-row-meta">
                    {ocupaiPropertyName(owner.property)}
                    {owner.ownershipPercent != null ? ` · ${owner.ownershipPercent}%` : ""}
                  </div>
                  <div className="list-row-sub">
                    {owner.email ?? "No email"}
                    {owner.pendingPayout
                      ? ` · pending ${formatCurrency(owner.pendingPayout, owner.currency)}`
                      : ""}
                  </div>
                </div>
                <ChevronRight size={16} className="text-[var(--text-muted)]" />
              </Link>
            );
          })}
        </div>
      ) : null}
      {statements.length ? (
        <div>
          <div className="mb-3 text-[11px] font-medium uppercase tracking-[2.8px] text-[var(--text-muted)]">
            Recent statements
          </div>
          <div className="list-stack">
            {statements.map((statement) => {
              const id = statement.id ?? statement._id ?? "";
              return (
                <Link key={id} href={`/owner/statement/${id}`} className="list-row">
                  <div className="list-row-body">
                    <div className="flex items-start justify-between gap-3">
                      <div className="list-row-title">
                        {formatDate(statement.periodStart ?? "")} – {formatDate(statement.periodEnd ?? "")}
                      </div>
                      <StatusPill>{(statement.status ?? "draft").replace(/_/g, " ")}</StatusPill>
                    </div>
                    <div className="list-row-meta">
                      {formatCurrency(statement.netAmount ?? 0, statement.currency)}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}
