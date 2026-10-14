"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { Card, PageHeader, StatusPill } from "@/components/ui";
import { apiRequest, mediaUrl } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { formatCurrency } from "@/lib/format";
import type { Property } from "@/lib/types";

export default function PropertyDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { session } = useAuth();
  const { data } = useQuery({
    queryKey: ["property", id],
    queryFn: () => apiRequest<Property>(`/api/properties/${id}`, { token: session?.token }),
    enabled: !!session?.token && !!id,
  });
  const cover = data?.photos?.find((photo) => photo.isCover)?.url ?? data?.photos?.[0]?.url;

  return (
    <div>
      <PageHeader title={data?.publicName || data?.internalName || "Property"} action={<StatusPill>{data?.status}</StatusPill>} />
      {cover ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={mediaUrl(cover)} alt="" className="mb-4 h-56 w-full rounded-2xl object-cover" />
      ) : null}
      <Card>
        <div>{data?.addressLine1}</div>
        <div className="text-[var(--text-secondary)]">
          {data?.city} {data?.postcode}
        </div>
        <div className="mt-3 text-sm">
          {data?.bedrooms} beds · {data?.maxGuests} guests · {formatCurrency(data?.basePrice ?? 0, data?.currency)}
        </div>
      </Card>
    </div>
  );
}
