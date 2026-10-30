"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { SkeletonDetail } from "@/components/skeleton";
import { Button, ErrorBanner, Glass, PageHeader, StatusPill } from "@/components/ui";
import { apiRequest, ApiRequestError } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { formatApprovalCountdown } from "@/lib/booking-approval";
import { bookingSourceColor } from "@/lib/booking-source";
import { formatCurrency, formatDate } from "@/lib/format";
import { ocupaiPropertyName } from "@/lib/property-name";
import { canOperate } from "@/lib/roles";
import type { Reservation } from "@/lib/types";
import { useState } from "react";

function isPendingRequest(status?: string) {
  return status === "PENDING" || status === "INQUIRY" || status === "EXPIRED";
}

export default function ReservationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { session } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();
  const operate = canOperate(session?.membership.role);
  const [error, setError] = useState("");
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

  const updateStatus = useMutation({
    mutationFn: (status: string) =>
      apiRequest<Reservation>(`/api/reservations/${id}`, {
        method: "PATCH",
        token: session?.token,
        body: { status },
      }),
    onSuccess: async (updated) => {
      setError("");
      queryClient.setQueryData(["reservation", id], updated);
      queryClient.setQueriesData<{ data: Reservation[]; total: number }>(
        { queryKey: ["reservations"] },
        (current) => {
          if (!current?.data?.length) return current;
          const rows = current.data.filter((row) => row.id !== updated.id);
          if (rows.length === current.data.length) return current;
          return { ...current, data: rows, total: Math.max(0, (current.total ?? rows.length) - 1) };
        },
      );
      await queryClient.invalidateQueries({ queryKey: ["reservations"] });
      await queryClient.invalidateQueries({ queryKey: ["calendar"] });
      await queryClient.invalidateQueries({ queryKey: ["briefing"] });
      if (updated.status === "CANCELLED" || updated.status === "NO_SHOW") {
        router.push("/bookings");
      }
    },
    onError: (err) => {
      setError(err instanceof ApiRequestError ? err.message : "Could not update booking");
    },
  });

  if (isPending && !data) {
    return (
      <div className="mx-auto max-w-2xl">
        <SkeletonDetail />
      </div>
    );
  }

  const closed = data?.status === "CANCELLED" || data?.status === "CHECKED_OUT" || data?.status === "NO_SHOW";

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader
        title={data?.guest?.fullName ?? "Booking"}
        subtitle={ocupaiPropertyName(data?.property)}
        action={<StatusPill color={color}>{data?.status}</StatusPill>}
      />
      <ErrorBanner message={error} />
      {isPendingRequest(data?.status) ? (
        <Glass className="mb-4">
          <div className="text-sm text-[var(--text-secondary)]">
            {data?.status === "EXPIRED" || data?.approvalExpired
              ? "This request expired without a decision."
              : "Channel request awaiting Approve or Decline."}
          </div>
          {data?.approvalDeadlineAt ? (
            <div className="mt-2 text-sm font-semibold text-[var(--warning,#F5A524)]">
              {formatApprovalCountdown(data.approvalDeadlineAt, data.approvalExpired || data.status === "EXPIRED") ??
                `Decide by ${new Date(data.approvalDeadlineAt).toLocaleString()}`}
            </div>
          ) : null}
        </Glass>
      ) : null}
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
        {operate && !closed ? (
          <div className="mt-5 flex flex-col gap-2">
            {isPendingRequest(data?.status) && data?.status !== "EXPIRED" && !data?.approvalExpired ? (
              <Button
                className="w-full"
                loading={updateStatus.isPending}
                onClick={() => updateStatus.mutate("CONFIRMED")}
              >
                Approve booking
              </Button>
            ) : null}
            {data?.status === "CONFIRMED" ? (
              <Button
                className="w-full"
                loading={updateStatus.isPending}
                onClick={() => updateStatus.mutate("CHECKED_IN")}
              >
                Check in guest
              </Button>
            ) : null}
            {data?.status === "CHECKED_IN" ? (
              <Button
                className="w-full"
                loading={updateStatus.isPending}
                onClick={() => updateStatus.mutate("CHECKED_OUT")}
              >
                Check out guest
              </Button>
            ) : null}
            <Button className="w-full" loading={checkout.isPending} onClick={() => checkout.mutate()}>
              Guest checkout
            </Button>
            <Button
              className="w-full"
              variant="danger"
              loading={updateStatus.isPending}
              onClick={() => {
                if (window.confirm("Cancel this reservation on Ocupai and the booking channel?")) {
                  updateStatus.mutate("CANCELLED");
                }
              }}
            >
              Cancel reservation
            </Button>
          </div>
        ) : operate ? (
          <Button className="mt-5 w-full" loading={checkout.isPending} onClick={() => checkout.mutate()}>
            Guest checkout
          </Button>
        ) : null}
      </Glass>
    </div>
  );
}
