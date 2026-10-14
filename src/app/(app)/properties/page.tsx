"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { Card, EmptyState, PageHeader, StatusPill } from "@/components/ui";
import { mediaUrl } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { useTranslation } from "@/lib/i18n";
import { propertiesQuery } from "@/lib/queries";

export default function PropertiesPage() {
  const { session } = useAuth();
  const { t } = useTranslation();
  const { data, isPending } = useQuery(propertiesQuery(session?.organization.id, session?.token));
  const rows = data?.data ?? [];

  return (
    <div>
      <PageHeader
        title={t("more.items.properties")}
        action={
          <Link href="/property/new" className="btn btn-primary">
            Add property
          </Link>
        }
      />
      {isPending ? <p className="text-[var(--text-muted)]">{t("common.loading")}</p> : null}
      {rows.length === 0 && !isPending ? <EmptyState title="No properties yet." action="Add property" href="/property/new" /> : null}
      <div className="grid gap-3 md:grid-cols-2">
        {rows.map((row) => {
          const cover = row.photos?.find((photo) => photo.isCover)?.url ?? row.photos?.[0]?.url;
          return (
            <Link key={row.id} href={`/property/${row.id}`}>
              <Card>
                {cover ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={mediaUrl(cover)} alt="" className="mb-3 h-36 w-full rounded-xl object-cover" />
                ) : null}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="font-semibold">{row.publicName || row.internalName}</div>
                    <div className="text-sm text-[var(--text-secondary)]">
                      {row.city} {row.postcode}
                    </div>
                  </div>
                  <StatusPill>{row.status}</StatusPill>
                </div>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
