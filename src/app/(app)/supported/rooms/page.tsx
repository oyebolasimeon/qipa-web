"use client";

import { useQuery } from "@tanstack/react-query";
import { Card, EmptyState, PageHeader, StatusPill } from "@/components/ui";
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
      <PageHeader title={t("supported.rooms")} subtitle={t("supported.roomsSubtitle")} />
      {rows.length === 0 && !query.isPending ? <EmptyState title={t("supported.emptyRooms")} /> : null}
      <div className="grid gap-3 md:grid-cols-2">
        {rows.map((row) => (
          <Card key={row.id}>
            {row.photoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={mediaUrl(row.photoUrl)} alt="" className="mb-3 h-36 w-full rounded-xl object-cover" />
            ) : null}
            <div className="flex justify-between gap-3">
              <div className="font-semibold">
                {row.propertyName} · {row.roomNumber}
              </div>
              <StatusPill>{row.status}</StatusPill>
            </div>
            <div className="mt-1 text-sm text-[var(--text-secondary)]">
              {row.city} · {formatCurrency(row.weeklyRate, row.currency)} / week
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
