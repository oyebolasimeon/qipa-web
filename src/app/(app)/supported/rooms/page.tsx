"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { SkeletonCards } from "@/components/skeleton";
import { EmptyState, PageHeader, StatusPill } from "@/components/ui";
import { apiRequest, mediaUrl } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { formatCurrency } from "@/lib/format";
import { useTranslation } from "@/lib/i18n";

type Room = {
  id: string;
  roomNumber: string;
  status: string;
  weeklyRate: number;
  currency: string;
  propertyName?: string;
  city?: string;
  photoUrl?: string;
};

export default function SupportedRoomsPage() {
  const { t } = useTranslation();
  const { session } = useAuth();
  const query = useQuery({
    queryKey: ["supported-rooms", session?.organization.id],
    queryFn: () => apiRequest<{ data: Room[] }>("/api/supported/rooms", { token: session?.token }),
    enabled: !!session?.token,
  });
  const rows = query.data?.data ?? [];

  return (
    <div>
      <PageHeader
        title={t("supported.rooms")}
        subtitle={t("supported.roomsSubtitle")}
        action={
          <Link href="/supported/rooms/new" className="btn btn-primary btn-sm">
            Add room
          </Link>
        }
      />
      {query.isPending ? <SkeletonCards count={4} /> : null}
      {rows.length === 0 && !query.isPending ? (
        <EmptyState title={t("supported.emptyRooms")} action="Add room" href="/supported/rooms/new" />
      ) : null}
      <div className="grid gap-3 md:grid-cols-2">
        {rows.map((row) => (
          <Link key={row.id} href={`/supported/rooms/${row.id}`} className="property-card block">
            <div className="property-cover">
              {row.photoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={mediaUrl(row.photoUrl)} alt="" />
              ) : null}
            </div>
            <div className="property-body">
              <div className="flex items-start justify-between gap-3">
                <div className="list-row-title">
                  {row.propertyName} · {row.roomNumber}
                </div>
                <StatusPill>{row.status.replace(/_/g, " ")}</StatusPill>
              </div>
              <div className="list-row-meta">
                {row.city} · {formatCurrency(row.weeklyRate, row.currency)} / week
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
