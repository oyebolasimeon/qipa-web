"use client";

import { useQuery } from "@tanstack/react-query";
import { ChevronRight, CreditCard, LineChart, Receipt, Tags } from "lucide-react";
import Link from "next/link";
import { SkeletonKpis } from "@/components/skeleton";
import { Glass, Kpi, PageHeader } from "@/components/ui";
import { useAuth } from "@/lib/auth";
import { formatCurrency, occupancyPct } from "@/lib/format";
import { briefingQuery } from "@/lib/queries";

const LINKS = [
  { href: "/pnl-journal", icon: <LineChart size={18} />, tint: "#4F7CFF", title: "P&L journal", body: "Month-by-month profit" },
  { href: "/collections", icon: <Receipt size={18} />, tint: "#F5A524", title: "Collections", body: "Outstanding guest balances" },
  { href: "/pricing", icon: <Tags size={18} />, tint: "#3DD68C", title: "Pricing", body: "Rules and recommendations" },
  { href: "/payments", icon: <CreditCard size={18} />, tint: "#6B8AFF", title: "Payments", body: "Stripe and checkout" },
];

export default function AnalyticsPage() {
  const { session } = useAuth();
  const { data, isPending } = useQuery(briefingQuery(session?.organization.id, session?.token));

  return (
    <div>
      <PageHeader title="Revenue & analytics" subtitle="Portfolio performance and money tools" />
      {isPending && !data ? (
        <SkeletonKpis count={4} />
      ) : (
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <Kpi label="Revenue" value={formatCurrency(data?.kpis.revenueThisMonth ?? 0)} />
          <Kpi label="Occupancy" value={occupancyPct(data?.kpis.occupancy ?? 0)} />
          <Kpi label="ADR" value={formatCurrency(data?.kpis.adr ?? 0)} />
          <Kpi label="RevPAR" value={formatCurrency(data?.kpis.revpar ?? 0)} />
        </div>
      )}
      <Glass className="mt-5" padding={0}>
        {LINKS.map((item, index) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 px-4 py-3.5 ${index < LINKS.length - 1 ? "border-b border-[var(--border)]" : ""}`}
          >
            <span
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px]"
              style={{ background: `${item.tint}22`, color: item.tint }}
            >
              {item.icon}
            </span>
            <div className="min-w-0 flex-1">
              <div className="font-[family-name:var(--font-outfit)] text-[15px] font-semibold">{item.title}</div>
              <div className="text-sm text-[var(--text-secondary)]">{item.body}</div>
            </div>
            <ChevronRight size={16} className="text-[var(--text-muted)]" />
          </Link>
        ))}
      </Glass>
    </div>
  );
}
