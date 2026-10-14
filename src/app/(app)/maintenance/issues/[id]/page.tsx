"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { Card, PageHeader, StatusPill } from "@/components/ui";
import { apiRequest } from "@/lib/api";
import { useAuth } from "@/lib/auth";

type Issue = { id: string; title: string; status: string; urgency: string; description?: string; propertyName?: string };

export default function MaintenanceIssueDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { session } = useAuth();
  const { data } = useQuery({
    queryKey: ["maintenance-issue", id],
    queryFn: () => apiRequest<Issue>(`/api/maintenance/issues/${id}`, { token: session?.token }),
    enabled: !!session?.token && !!id,
  });

  return (
    <div>
      <PageHeader title={data?.title ?? "Issue"} action={<StatusPill>{data?.status}</StatusPill>} />
      <Card>
        <div className="text-sm text-[var(--text-secondary)]">
          {data?.urgency} {data?.propertyName ? `· ${data.propertyName}` : ""}
        </div>
        {data?.description ? <p className="mt-3">{data.description}</p> : null}
      </Card>
    </div>
  );
}
