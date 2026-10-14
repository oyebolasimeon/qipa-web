"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Card, PageHeader, StatusPill } from "@/components/ui";
import { apiRequest } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { formatCurrency, formatDate } from "@/lib/format";
import type { Reservation } from "@/lib/types";

export default function ReservationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { session } = useAuth();
  const { data } = useQuery({
    queryKey: ["reservation", id],
    queryFn: () => apiRequest<Reservation>(`/api/reservations/${id}`, { token: session?.token }),
    enabled: !!session?.token && !!id,
  });

  return (
    <div>
      <PageHeader title={data?.guest?.fullName ?? "Booking"} action={<StatusPill>{data?.status}</StatusPill>} />
      <Card>
        <div className="font-medium">{data?.property?.publicName}</div>
        <div className="text-sm text-[var(--text-secondary)]">
          {data ? `${formatDate(data.checkIn)} – ${formatDate(data.checkOut)} · ${data.nights} nights` : ""}
        </div>
        <div className="mt-3">{formatCurrency(data?.totalAmount ?? 0, data?.currency)}</div>
        <div className="mt-2 text-sm text-[var(--text-muted)]">{data?.confirmationCode} · {data?.source}</div>
        {data?.guestId ? (
          <Link href={`/guest/${data.guestId}`} className="mt-4 inline-block text-sm text-[var(--mist)]">
            Open guest
          </Link>
        ) : null}
      </Card>
    </div>
  );
}
