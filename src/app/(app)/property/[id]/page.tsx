"use client";

import { useQuery } from "@tanstack/react-query";
import { CalendarDays, Home } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { SkeletonDetail } from "@/components/skeleton";
import { Glass, PageHeader, StatusPill } from "@/components/ui";
import { apiRequest, mediaUrl } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { formatCurrency } from "@/lib/format";
import { ocupaiPropertyName } from "@/lib/property-name";
import type { Property } from "@/lib/types";

export default function PropertyDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { session } = useAuth();
  const { data, isPending } = useQuery({
    queryKey: ["property", id],
    queryFn: () => apiRequest<Property>(`/api/properties/${id}`, { token: session?.token }),
    enabled: !!session?.token && !!id,
  });
  const cover = data?.photos?.find((photo) => photo.isCover)?.url ?? data?.photos?.[0]?.url;

  if (isPending && !data) {
    return (
      <div className="mx-auto max-w-3xl">
        <SkeletonDetail />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title={ocupaiPropertyName(data)}
        subtitle={data?.city}
        action={
          <div className="flex items-center gap-2">
            <StatusPill>{data?.status}</StatusPill>
            <Link href={`/property/${id}/edit`} className="btn btn-ghost btn-sm">
              Edit
            </Link>
          </div>
        }
      />
      <div className="detail-hero">
        {cover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={mediaUrl(cover)} alt="" />
        ) : (
          <div className="flex h-[220px] items-center justify-center text-white/80">
            <Home size={36} />
          </div>
        )}
      </div>
      <div className="detail-grid">
        <Glass>
          <div className="font-[family-name:var(--font-outfit)] text-2xl font-bold">
            {formatCurrency(data?.basePrice ?? 0, data?.currency)}
            <span className="ml-1 text-sm font-medium text-[var(--text-muted)]">/night</span>
          </div>
          <div className="mt-3 meta-line">
            <span>Address</span>
            <span className="text-right">
              {data?.addressLine1}
              <br />
              {data?.city} {data?.postcode}
            </span>
          </div>
          <div className="meta-line">
            <span>Capacity</span>
            <span>
              {data?.bedrooms ?? 0} beds · {data?.maxGuests ?? 0} guests
            </span>
          </div>
          <div className="meta-line">
            <span>Type</span>
            <span>
              {(data?.propertyType ?? "").replace(/_/g, " ")} · {(data?.unitType ?? "").replace(/_/g, " ")}
            </span>
          </div>
        </Glass>
        <Glass>
          <Link href={`/property-calendar/${id}`} className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-[var(--primary-muted)] text-[var(--primary)]">
              <CalendarDays size={18} />
            </span>
            <span>
              <div className="font-semibold">Availability calendar</div>
              <div className="text-sm text-[var(--text-secondary)]">Rates, stops and bookings</div>
            </span>
          </Link>
          <Link href={`/reservation/new?propertyId=${id}`} className="btn btn-primary mt-5 w-full btn-sm">
            New booking
          </Link>
        </Glass>
      </div>
    </div>
  );
}
