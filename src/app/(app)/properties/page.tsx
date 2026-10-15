"use client";

import { useQuery } from "@tanstack/react-query";
import { Home } from "lucide-react";
import Link from "next/link";
import { SkeletonCards } from "@/components/skeleton";
import { EmptyState, PageHeader, StatusPill } from "@/components/ui";
import { mediaUrl } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { formatCurrency } from "@/lib/format";
import { useTranslation } from "@/lib/i18n";
import { ocupaiPropertyName } from "@/lib/property-name";
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
        subtitle={`${rows.length} homes`}
        action={
          <Link href="/property/new" className="btn btn-primary btn-sm">
            Add property
          </Link>
        }
      />
      {isPending ? <SkeletonCards count={6} /> : null}
      {rows.length === 0 && !isPending ? (
        <EmptyState title="No properties yet." action="Add property" href="/property/new" />
      ) : null}
      {!isPending && rows.length ? (
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {rows.map((row) => {
          const cover = row.photos?.find((photo) => photo.isCover)?.url ?? row.photos?.[0]?.url;
          return (
            <Link key={row.id} href={`/property/${row.id}`} className="property-card">
              <div className="property-cover">
                {cover ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={mediaUrl(cover)} alt="" />
                ) : (
                  <div className="flex h-full items-center justify-center text-white/80">
                    <Home size={28} />
                  </div>
                )}
                <div className="absolute right-3 top-3">
                  <StatusPill>{row.status}</StatusPill>
                </div>
              </div>
              <div className="property-body">
                <div className="truncate font-[family-name:var(--font-outfit)] text-[16px] font-semibold">
                  {ocupaiPropertyName(row)}
                </div>
                <div className="mt-1 text-sm text-[var(--text-secondary)]">{row.city}</div>
                <div className="mt-2 text-xs text-[var(--text-muted)]">
                  {row.maxGuests} guests · {row.bedrooms} beds
                </div>
                <div className="mt-3 font-[family-name:var(--font-outfit)] text-lg font-bold">
                  {formatCurrency(row.basePrice, row.currency)}
                  <span className="ml-1 text-sm font-medium text-[var(--text-muted)]">/night</span>
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
