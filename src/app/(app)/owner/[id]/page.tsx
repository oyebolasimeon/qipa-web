"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Button, Glass, PageHeader } from "@/components/ui";
import { apiRequest } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { formatCurrency } from "@/lib/format";
import { ocupaiPropertyName } from "@/lib/property-name";

type Owner = {
  id?: string;
  name: string;
  email?: string;
  phone?: string;
  ownershipPercent?: number;
  managementFeePercent?: number;
  payoutSchedule?: string;
  property?: { publicName?: string };
};

export default function OwnerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { session } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: ["owner", id],
    queryFn: () => apiRequest<Owner>(`/api/owners/${id}`, { token: session?.token }),
    enabled: !!session?.token && !!id,
  });
  const statements = useMutation({
    mutationFn: () =>
      apiRequest(`/api/owners/${id}/statements`, {
        method: "POST",
        token: session?.token,
        body: {},
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["owners"] }),
  });
  const remove = useMutation({
    mutationFn: () => apiRequest(`/api/owners/${id}`, { method: "DELETE", token: session?.token }),
    onSuccess: () => router.replace("/owners"),
  });
  const owner = query.data;

  return (
    <div>
      <PageHeader title={owner?.name ?? "Owner"} subtitle={owner?.email} />
      <Glass>
        <div>{ocupaiPropertyName(owner?.property)}</div>
        <div className="text-sm text-[var(--text-secondary)]">
          {owner?.ownershipPercent ?? 100}% · fee {owner?.managementFeePercent ?? 0}% · {owner?.payoutSchedule}
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button onClick={() => statements.mutate()}>Generate statement</Button>
          <Link href="/contact-manager" className="btn btn-ghost min-h-11 px-4 py-2 text-sm">
            Message manager
          </Link>
          <Button variant="danger" onClick={() => remove.mutate()}>
            Remove
          </Button>
        </div>
      </Glass>
    </div>
  );
}
