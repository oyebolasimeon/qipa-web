"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useParams } from "next/navigation";
import { SkeletonDetail } from "@/components/skeleton";
import { Button, Glass, PageHeader, StatusPill } from "@/components/ui";
import { apiRequest } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { bookingSourceColor } from "@/lib/booking-source";
import { formatCurrency, formatDate } from "@/lib/format";
import { ocupaiPropertyName } from "@/lib/property-name";
import { canOperate } from "@/lib/roles";
import type { Reservation } from "@/lib/types";

export default function ReservationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { session } = useAuth();
  const operate = canOperate(session?.membership.role);
  const { data, isPending } = useQuery({
    queryKey: ["reservation", id],
    queryFn: () => apiRequest<Reservation>(`/api/reservations/${id}`, { token: session?.token }),
    enabled: !!session?.token && !!id,
  });
  const color = bookingSourceColor(data?.source);
  const checkout = useMutation({
    mutationFn: () =>
      apiRequest<{ url: string }>("/api/payments/checkout", {
        method: "POST",
        token: session?.token,
        body: { reservationId: id },
      }),
    onSuccess: (result) => {
      if (result.url) window.location.href = result.url;
    },
  });

  if (isPending && !data) {
    return (
      <div className="mx-auto max-w-2xl">
        <SkeletonDetail />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader
        title={data?.guest?.fullName ?? "Booking"}
        subtitle={ocupaiPropertyName(data?.property)}
        action={<StatusPill color={color}>{data?.status}</StatusPill>}
      />
      <Glass accent className="mb-4">
        <div className="font-[family-name:var(--font-outfit)] text-3xl font-bold">
          {formatCurrency(data?.totalAmount ?? 0, data?.currency)}
        </div>
        <div className="mt-2 text-sm text-[var(--text-secondary)]">
          {data ? `${formatDate(data.checkIn)} – ${formatDate(data.checkOut)} · ${data.nights} nights` : ""}
        </div>
      </Glass>
      <Glass>
        <div className="meta-line">
          <span>Property</span>
          <span>{ocupaiPropertyName(data?.property)}</span>
        </div>
        <div className="meta-line">
          <span>Source</span>
          <span style={{ color }}>{data?.source?.replace(/_/g, " ")}</span>
        </div>
        <div className="meta-line">
          <span>Confirmation</span>
          <span>{data?.confirmationCode || "—"}</span>
        </div>
        <div className="meta-line">
          <span>Payment</span>
          <span>{data?.paymentStatus?.replace(/_/g, " ") || "—"}</span>
        </div>
        <div className="mt-4 flex flex-wrap gap-3">
          {data?.guestId ? (
            <Link href={`/guest/${data.guestId}`} className="text-sm font-semibold text-[var(--mist)]">
              Open guest
            </Link>
          ) : null}
          {data?.propertyId ? (
            <Link href={`/property/${data.propertyId}`} className="text-sm font-semibold text-[var(--mist)]">
              Open property
            </Link>
          ) : null}
        </div>
        {operate ? (
          <Button className="mt-5 w-full" loading={checkout.isPending} onClick={() => checkout.mutate()}>
            Guest checkout
          </Button>
        ) : null}
      </Glass>
    </div>
  );
}
