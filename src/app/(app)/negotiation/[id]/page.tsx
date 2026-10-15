"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { Button, Glass, PageHeader } from "@/components/ui";
import { apiRequest } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { formatCurrency } from "@/lib/format";
import { ocupaiPropertyName } from "@/lib/property-name";

type Negotiation = {
  id: string;
  originalRate: number;
  floorRate: number;
  currency: string;
  status?: string;
  property?: { publicName?: string };
  offers?: Array<{ amount: number; createdAt?: string }>;
};

export default function NegotiationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { session } = useAuth();
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: ["negotiation", id],
    queryFn: () => apiRequest<Negotiation>(`/api/negotiations/${id}`, { token: session?.token }),
    enabled: !!session?.token && !!id,
  });
  const resolve = useMutation({
    mutationFn: (action: "ACCEPT" | "REJECT") =>
      apiRequest(`/api/negotiations/${id}/resolve`, { method: "POST", token: session?.token, body: { action } }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["negotiation", id] });
      void queryClient.invalidateQueries({ queryKey: ["negotiations"] });
    },
  });
  const data = query.data;

  return (
    <div>
      <PageHeader title={ocupaiPropertyName(data?.property)} subtitle={data?.status} />
      <Glass>
        <div>Listed {formatCurrency(data?.originalRate ?? 0, data?.currency)}</div>
        <div className="text-[var(--text-secondary)]">Floor {formatCurrency(data?.floorRate ?? 0, data?.currency)}</div>
        <div className="mt-4 space-y-2">
          {(data?.offers ?? []).map((offer, index) => (
            <div key={index} className="rounded-xl bg-white/[0.03] p-3">
              {formatCurrency(offer.amount, data?.currency)}
            </div>
          ))}
        </div>
        <div className="mt-4 flex gap-2">
          <Button onClick={() => resolve.mutate("ACCEPT")}>Accept</Button>
          <Button variant="ghost" onClick={() => resolve.mutate("REJECT")}>
            Reject
          </Button>
        </div>
      </Glass>
    </div>
  );
}
