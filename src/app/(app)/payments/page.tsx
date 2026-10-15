"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";
import { Button, Glass, PageHeader, StatusPill } from "@/components/ui";
import { apiRequest } from "@/lib/api";
import { useAuth } from "@/lib/auth";

type Processor = {
  id: string;
  provider: string;
  displayName: string;
  status: string;
  chargesEnabled: boolean;
  payoutsEnabled: boolean;
};

function PaymentsInner() {
  const { session } = useAuth();
  const params = useSearchParams();
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: ["payment-processors", session?.organization.id],
    queryFn: () => apiRequest<Processor[]>("/api/payments/processors", { token: session?.token }),
    enabled: !!session?.token,
  });
  const connect = useMutation({
    mutationFn: () =>
      apiRequest<{ url: string }>("/api/payments/processors/stripe/connect", {
        method: "POST",
        token: session?.token,
        body: {},
      }),
    onSuccess: (result) => {
      if (result.url) window.location.href = result.url;
    },
  });

  useEffect(() => {
    if (params.get("connected") === "1") {
      void queryClient.invalidateQueries({ queryKey: ["payment-processors"] });
    }
  }, [params, queryClient]);

  const stripe = query.data?.find((item) => item.provider === "STRIPE");

  return (
    <div>
      <PageHeader title="Payments" subtitle="Connect Stripe to take guest payments" />
      <Glass>
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="font-semibold">{stripe?.displayName ?? "Stripe"}</div>
            <div className="text-sm text-[var(--text-secondary)]">
              Charges {stripe?.chargesEnabled ? "on" : "off"} · Payouts {stripe?.payoutsEnabled ? "on" : "off"}
            </div>
          </div>
          <StatusPill>{stripe?.status ?? "Not connected"}</StatusPill>
        </div>
        <Button className="mt-4" loading={connect.isPending} onClick={() => connect.mutate()}>
          {stripe ? "Manage Stripe" : "Connect Stripe"}
        </Button>
      </Glass>
    </div>
  );
}

export default function PaymentsPage() {
  return (
    <Suspense fallback={<p className="text-[var(--text-muted)]">Loading…</p>}>
      <PaymentsInner />
    </Suspense>
  );
}
