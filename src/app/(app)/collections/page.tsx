"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { SkeletonList } from "@/components/skeleton";
import { Button, EmptyState, Field, Glass, Kpi, PageHeader, StatusPill } from "@/components/ui";
import { apiRequest } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { formatCurrency, formatDate } from "@/lib/format";
import { canOperate } from "@/lib/roles";

type Stay = {
  id: string;
  guestName: string;
  propertyName: string;
  totalAmount: number;
  collectedAmount?: number;
  currency: string;
  checkIn?: string;
  checkOut?: string;
  paymentStatus?: string;
};

type CollectionsMonth = {
  collected?: number;
  outstanding?: number;
  currency?: string;
  properties?: Array<{ propertyName: string; stays: Stay[] }>;
  stays?: Stay[];
};

export default function CollectionsPage() {
  const { session } = useAuth();
  const operate = canOperate(session?.membership.role);
  const queryClient = useQueryClient();
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [logging, setLogging] = useState<Stay | null>(null);
  const [amount, setAmount] = useState("");

  const query = useQuery({
    queryKey: ["collections", year, month, session?.organization.id],
    queryFn: () =>
      apiRequest<CollectionsMonth>(`/api/payments/collections?year=${year}&month=${month}`, {
        token: session?.token,
      }),
    enabled: !!session?.token,
  });

  const logPayment = useMutation({
    mutationFn: () =>
      apiRequest("/api/payments/log", {
        method: "POST",
        token: session?.token,
        body: { stayId: logging?.id, amount: Number(amount), currency: logging?.currency },
      }),
    onSuccess: async () => {
      setLogging(null);
      setAmount("");
      await queryClient.invalidateQueries({ queryKey: ["collections"] });
    },
  });

  const checkout = useMutation({
    mutationFn: (stay: Stay) =>
      apiRequest<{ url: string }>("/api/payments/checkout", {
        method: "POST",
        token: session?.token,
        body: { stayId: stay.id },
      }),
    onSuccess: (result) => {
      if (result.url) window.location.href = result.url;
    },
  });

  const stays =
    query.data?.stays ??
    query.data?.properties?.flatMap((group) => group.stays) ??
    [];

  return (
    <div>
      <PageHeader title="Collections" subtitle="Track what guests still owe" />
      <div className="mb-4 flex items-center justify-between gap-3">
        <button
          type="button"
          className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--border)] text-[var(--mist)]"
          onClick={() => {
            const next = new Date(year, month - 1, 1);
            setYear(next.getFullYear());
            setMonth(next.getMonth());
          }}
        >
          <ChevronLeft size={18} />
        </button>
        <span className="font-[family-name:var(--font-outfit)] font-semibold">
          {new Date(year, month, 1).toLocaleString("en-GB", { month: "long", year: "numeric" })}
        </span>
        <button
          type="button"
          className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--border)] text-[var(--mist)]"
          onClick={() => {
            const next = new Date(year, month + 1, 1);
            setYear(next.getFullYear());
            setMonth(next.getMonth());
          }}
        >
          <ChevronRight size={18} />
        </button>
      </div>
      <div className="mb-4 grid grid-cols-2 gap-3">
        <Kpi label="Collected" value={formatCurrency(query.data?.collected ?? 0, query.data?.currency)} />
        <Kpi label="Outstanding" value={formatCurrency(query.data?.outstanding ?? 0, query.data?.currency)} />
      </div>
      {query.isPending ? <SkeletonList rows={5} /> : null}
      {stays.length === 0 && !query.isPending ? <EmptyState title="No stays this month." /> : null}
      {stays.length ? (
        <div className="list-stack">
          {stays.map((stay) => {
            const initials = stay.guestName
              .split(" ")
              .filter(Boolean)
              .slice(0, 2)
              .map((part) => part[0])
              .join("")
              .toUpperCase();
            return (
              <div key={stay.id} className="list-row !items-start">
                <div className="avatar">{initials || "?"}</div>
                <div className="list-row-body">
                  <div className="flex items-start justify-between gap-3">
                    <div className="list-row-title">{stay.guestName}</div>
                    {stay.paymentStatus ? <StatusPill>{stay.paymentStatus.replace(/_/g, " ")}</StatusPill> : null}
                  </div>
                  <div className="list-row-meta">{stay.propertyName}</div>
                  <div className="list-row-sub">
                    {formatCurrency(stay.collectedAmount ?? 0, stay.currency)} of{" "}
                    {formatCurrency(stay.totalAmount, stay.currency)}
                    {stay.checkIn ? ` · ${formatDate(stay.checkIn)}` : ""}
                  </div>
                  {operate ? (
                    <div className="mt-3 flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => {
                          setLogging(stay);
                          setAmount(String(stay.totalAmount - (stay.collectedAmount ?? 0)));
                        }}
                      >
                        Log payment
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => checkout.mutate(stay)}>
                        Send checkout
                      </Button>
                    </div>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      ) : null}
      {logging ? (
        <Glass className="form-panel mt-4">
          <div className="mb-2 font-[family-name:var(--font-outfit)] font-semibold">
            Log payment · {logging.guestName}
          </div>
          <Field label="Amount" value={amount} onChange={setAmount} />
          <div className="flex gap-2">
            <Button size="sm" loading={logPayment.isPending} onClick={() => logPayment.mutate()}>
              Save
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setLogging(null)}>
              Cancel
            </Button>
          </div>
        </Glass>
      ) : null}
    </div>
  );
}
