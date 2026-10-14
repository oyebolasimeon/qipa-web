"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { Card, EmptyState, PageHeader } from "@/components/ui";
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
      <PageHeader title={t("more.items.guests")} />
      {isPending ? <p className="text-[var(--text-muted)]">{t("common.loading")}</p> : null}
      {rows.length === 0 && !isPending ? <EmptyState title="No guests yet." /> : null}
      <div className="space-y-3">
        {rows.map((row) => (
          <Link key={row.id} href={`/guest/${row.id}`}>
            <Card>
              <div className="font-semibold">{row.fullName}</div>
              <div className="text-sm text-[var(--text-secondary)]">
                {row.email ?? "No email"} · {row.phone ?? "No phone"}
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
