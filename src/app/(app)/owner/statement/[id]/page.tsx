"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { Button, Glass, PageHeader } from "@/components/ui";
import { apiRequest } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { formatCurrency, formatDate } from "@/lib/format";

type Statement = {
  id: string;
  periodStart?: string;
  periodEnd?: string;
  status?: string;
  grossAmount?: number;
  netAmount?: number;
  currency?: string;
};

export default function OwnerStatementPage() {
  const { id } = useParams<{ id: string }>();
  const { session } = useAuth();
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: ["owner-statement", id],
    queryFn: () => apiRequest<Statement>(`/api/owners/statements/${id}`, { token: session?.token }),
    enabled: !!session?.token && !!id,
  });
  const markPaid = useMutation({
    mutationFn: () =>
      apiRequest(`/api/owners/statements/${id}`, {
        method: "PATCH",
        token: session?.token,
        body: { status: "PAID" },
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["owner-statement", id] }),
  });
  const data = query.data;

  return (
    <div>
      <PageHeader
        title="Owner statement"
        subtitle={data?.periodStart && data.periodEnd ? `${formatDate(data.periodStart)} – ${formatDate(data.periodEnd)}` : data?.status}
      />
      <Glass>
        <div>Gross {formatCurrency(data?.grossAmount ?? 0, data?.currency)}</div>
        <div className="text-lg font-semibold">Net {formatCurrency(data?.netAmount ?? 0, data?.currency)}</div>
        <div className="mt-2 text-sm text-[var(--text-muted)]">{data?.status}</div>
        {data?.status !== "PAID" ? (
          <Button className="mt-4" onClick={() => markPaid.mutate()}>
            Mark paid
          </Button>
        ) : null}
      </Glass>
    </div>
  );
}
