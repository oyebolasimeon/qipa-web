"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { SkeletonList } from "@/components/skeleton";
import { EmptyState, PageHeader, StatusPill } from "@/components/ui";
import { apiRequest } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { formatCurrency } from "@/lib/format";
import { useTranslation } from "@/lib/i18n";

type Room = {
  id: string;
  code: string;
  propertyName?: string;
  advertisedRent: number;
  availabilityState: string;
  maxOccupants: number;
};

export default function FlatshareRoomsPage() {
  const { t } = useTranslation();
  const { session } = useAuth();
  const query = useQuery({
    queryKey: ["flatshare-rooms", session?.organization.id],
    queryFn: () => apiRequest<{ data: Room[] }>("/api/flatshares/rooms", { token: session?.token }),
    enabled: !!session?.token,
  });
  const rooms = query.data?.data ?? [];

  return (
    <div>
      <PageHeader
        title={t("flatshares.rooms")}
        action={
          <Link href="/flatshares/rooms/new" className="btn btn-primary btn-sm">
            {t("flatshares.addRoom")}
          </Link>
        }
      />
      {query.isPending ? <SkeletonList rows={5} /> : null}
      {rooms.length === 0 && !query.isPending ? (
        <EmptyState title={t("flatshares.emptyRooms")} action={t("flatshares.addRoom")} href="/flatshares/rooms/new" />
      ) : null}
      {rooms.length ? (
        <div className="list-stack">
          {rooms.map((room) => (
            <div key={room.id} className="list-row">
              <div className="list-row-body">
                <div className="flex items-start justify-between gap-3">
                  <div className="list-row-title">
                    {room.propertyName ?? "Property"} · {room.code}
                  </div>
                  <StatusPill>{room.availabilityState.replace(/_/g, " ")}</StatusPill>
                </div>
                <div className="list-row-meta">
                  {formatCurrency(room.advertisedRent)} · {room.maxOccupants} guests
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
