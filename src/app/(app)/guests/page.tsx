"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { SkeletonList } from "@/components/skeleton";
import { EmptyState, PageHeader } from "@/components/ui";
import { useAuth } from "@/lib/auth";
import { useTranslation } from "@/lib/i18n";
import { guestsQuery } from "@/lib/queries";

export default function GuestsPage() {
  const { session } = useAuth();
  const { t } = useTranslation();
  const { data, isPending } = useQuery(guestsQuery(session?.organization.id, session?.token));
  const rows = data?.data ?? [];

  return (
    <div>
      <PageHeader title={t("more.items.guests")} subtitle={`${rows.length} profiles`} />
      {isPending ? <SkeletonList rows={6} /> : null}
      {rows.length === 0 && !isPending ? <EmptyState title="No guests yet." /> : null}
      {rows.length ? (
        <div className="list-stack">
          {rows.map((row) => {
            const initials = row.fullName
              .split(" ")
              .filter(Boolean)
              .slice(0, 2)
              .map((part) => part[0])
              .join("")
              .toUpperCase();
            return (
              <Link key={row.id} href={`/guest/${row.id}`} className="list-row">
                <div className="avatar">{initials || "?"}</div>
                <div className="list-row-body">
                  <div className="list-row-title">{row.fullName}</div>
                  <div className="list-row-meta">
                    {row.email ?? "No email"}
                    {row.phone ? ` · ${row.phone}` : ""}
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
