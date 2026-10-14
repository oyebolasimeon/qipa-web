"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { Card, EmptyState, PageHeader, StatusPill } from "@/components/ui";
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
          <Link href="/flatshares/rooms/new" className="btn btn-primary">
            {t("flatshares.addRoom")}
          </Link>
        }
      />
      {rooms.length === 0 && !query.isPending ? (
        <EmptyState title={t("flatshares.emptyRooms")} action={t("flatshares.addRoom")} href="/flatshares/rooms/new" />
      ) : null}
      <div className="space-y-3">
        {rooms.map((room) => (
          <Card key={room.id}>
            <div className="flex justify-between gap-3">
              <div className="font-semibold">
                {room.propertyName ?? "Property"} · {room.code}
              </div>
              <StatusPill>{room.availabilityState}</StatusPill>
            </div>
            <div className="mt-1 text-sm text-[var(--text-secondary)]">
              {formatCurrency(room.advertisedRent)} · {room.maxOccupants} guests
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
