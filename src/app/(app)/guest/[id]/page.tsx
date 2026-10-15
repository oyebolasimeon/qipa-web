"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { SkeletonDetail } from "@/components/skeleton";
import { Glass, PageHeader } from "@/components/ui";
import { apiRequest } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import type { Guest } from "@/lib/types";

export default function GuestPage() {
  const { id } = useParams<{ id: string }>();
  const { session } = useAuth();
  const { data, isPending } = useQuery({
    queryKey: ["guest", id],
    queryFn: () => apiRequest<Guest>(`/api/guests/${id}`, { token: session?.token }),
    enabled: !!session?.token && !!id,
  });
  const initials = `${data?.firstName?.[0] ?? ""}${data?.lastName?.[0] ?? ""}`.toUpperCase();

  if (isPending && !data) {
    return (
      <div className="mx-auto max-w-xl">
        <SkeletonDetail />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl">
      <PageHeader title={data?.fullName ?? "Guest"} />
      <Glass accent className="mb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#4F7CFF] to-[#3D63E0] text-lg font-bold text-white">
            {initials || "G"}
          </div>
          <div>
            <div className="font-[family-name:var(--font-outfit)] text-xl font-semibold">{data?.fullName}</div>
            <div className="text-sm text-[var(--text-secondary)]">{data?.language ?? "Guest profile"}</div>
          </div>
        </div>
      </Glass>
      <Glass>
        <div className="meta-line">
          <span>Email</span>
          <span>{data?.email ?? "—"}</span>
        </div>
        <div className="meta-line">
          <span>Phone</span>
          <span>{data?.phone ?? "—"}</span>
        </div>
        {data?.notes ? (
          <div className="mt-3">
            <div className="field-label">Notes</div>
            <p className="text-sm text-[var(--text-secondary)]">{data.notes}</p>
          </div>
        ) : null}
      </Glass>
    </div>
  );
}
