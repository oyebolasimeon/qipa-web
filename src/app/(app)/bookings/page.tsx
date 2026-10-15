"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useState } from "react";
import { SkeletonList } from "@/components/skeleton";
import { EmptyState, PageHeader, StatusPill } from "@/components/ui";
import { bookingSourceColor } from "@/lib/booking-source";
import { useAuth } from "@/lib/auth";
import { formatCurrency, formatDate } from "@/lib/format";
import { useTranslation } from "@/lib/i18n";
import { ocupaiPropertyName } from "@/lib/property-name";
import { reservationsQuery } from "@/lib/queries";
import {
  isFlatsharesWorkspace,
  isMaintenanceWorkspace,
  isSupportedWorkspace,
} from "@/lib/workspace-mode";
import FlatshareTenanciesPage from "../flatshares/tenancies/page";
import MaintenanceWorkOrdersPage from "../maintenance/work-orders/page";
import SupportedPlacementsPage from "../supported/placements/page";

export default function BookingsPage() {
  const { session } = useAuth();
  if (isSupportedWorkspace(session?.organization.kind)) return <SupportedPlacementsPage />;
  if (isFlatsharesWorkspace(session?.organization.kind)) return <FlatshareTenanciesPage />;
  if (isMaintenanceWorkspace(session?.organization.kind)) return <MaintenanceWorkOrdersPage />;
  return <BookingsInner />;
}

function BookingsInner() {
  const { session } = useAuth();
  const { t } = useTranslation();
  const [filter, setFilter] = useState("requests");
  const filters = [
    { id: "requests", label: t("bookings.requests") },
    { id: "upcoming", label: t("bookings.upcoming") },
    { id: "current", label: t("bookings.inHouse") },
    { id: "arrivals", label: t("bookings.arrivals") },
    { id: "departures", label: t("bookings.departures") },
    { id: "", label: t("bookings.all") },
  ];
  const { data, isPending } = useQuery(reservationsQuery(session?.organization.id, filter, session?.token));
  const rows = data?.data ?? [];

  return (
    <div>
      <PageHeader
        title={t("bookings.title")}
        subtitle={rows.length === 1 ? t("bookings.countOne") : t("bookings.count", { count: rows.length })}
        action={
          <Link href="/reservation/new" className="btn btn-primary btn-sm">
            {t("bookings.createBooking")}
          </Link>
        }
      />
      <div className="filter-row">
        {filters.map((item) => (
          <button
            key={item.id || "all"}
            type="button"
            onClick={() => setFilter(item.id)}
            className={`filter-chip ${filter === item.id ? "on" : ""}`}
          >
            {item.label}
          </button>
        ))}
      </div>
      {isPending ? <SkeletonList rows={5} /> : null}
      {rows.length === 0 && !isPending ? (
        <EmptyState
          title={t("bookings.noneFound")}
          body={t("bookings.nothingMatchesOrCreate", {
            label: filters.find((item) => item.id === filter)?.label ?? "",
          })}
          action={t("bookings.createBooking")}
          href="/reservation/new"
        />
      ) : null}
      <div className="space-y-3">
        {rows.map((row) => {
          const color = bookingSourceColor(row.source);
          const name = row.guest?.fullName ?? t("common.guest");
          const initials = name
            .split(" ")
            .filter(Boolean)
            .slice(0, 2)
            .map((part) => part[0])
            .join("")
            .toUpperCase();
          return (
            <Link key={row.id} href={`/reservation/${row.id}`} className="block">
              <div
                className="overflow-hidden rounded-2xl p-px"
                style={{ background: `linear-gradient(90deg, ${color}55, ${color}12, rgba(255,255,255,0.04))` }}
              >
                <div className="flex overflow-hidden rounded-[15px]" style={{ background: "var(--glass-inner)" }}>
                  <div className="w-1.5" style={{ background: color }} />
                  <div className="flex flex-1 items-start gap-3 p-4">
                    <div
                      className="flex h-11 w-11 items-center justify-center rounded-full text-sm font-bold"
                      style={{ background: `${color}33`, color }}
                    >
                      {initials || "?"}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div className="font-[family-name:var(--font-outfit)] font-semibold">{name}</div>
                        <StatusPill color={color}>{row.status}</StatusPill>
                      </div>
                      <div className="text-[13px] text-[var(--text-secondary)]">{ocupaiPropertyName(row.property)}</div>
                      <div className="mt-1 text-xs text-[var(--text-muted)]">
                        {formatDate(row.checkIn)} – {formatDate(row.checkOut)} · {row.nights} nights
                      </div>
                      <div className="mt-2 font-[family-name:var(--font-outfit)] text-lg font-bold">
                        {formatCurrency(row.totalAmount, row.currency)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
