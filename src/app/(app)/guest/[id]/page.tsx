"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { Card, PageHeader } from "@/components/ui";
import { apiRequest } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import type { Guest } from "@/lib/types";

export default function GuestPage() {
  const { id } = useParams<{ id: string }>();
  const { session } = useAuth();
  const { data } = useQuery({
    queryKey: ["guest", id],
    queryFn: () => apiRequest<Guest>(`/api/guests/${id}`, { token: session?.token }),
    enabled: !!session?.token && !!id,
  });

  return (
    <div>
      <PageHeader title={data?.fullName ?? "Guest"} />
      <Card>
        <div>{data?.email ?? "No email"}</div>
        <div className="text-[var(--text-secondary)]">{data?.phone ?? "No phone"}</div>
        {data?.notes ? <p className="mt-3 text-sm">{data.notes}</p> : null}
      </Card>
    </div>
  );
}
