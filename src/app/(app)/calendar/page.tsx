"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { PageHeader } from "@/components/ui";
import { bookingSourceColor } from "@/lib/booking-source";
import { useAuth } from "@/lib/auth";
import { useTranslation } from "@/lib/i18n";
import { ocupaiPropertyName } from "@/lib/property-name";
import { calendarQuery } from "@/lib/queries";
import {
  isFlatsharesWorkspace,
  isMaintenanceWorkspace,
  isSupportedWorkspace,
} from "@/lib/workspace-mode";
import FlatshareRoomsPage from "../flatshares/rooms/page";
import MaintenanceIssuesPage from "../maintenance/issues/page";
import SupportedRoomsPage from "../supported/rooms/page";

export default function CalendarPage() {
  const { session } = useAuth();
  if (isSupportedWorkspace(session?.organization.kind)) return <SupportedRoomsPage />;
  if (isFlatsharesWorkspace(session?.organization.kind)) return <FlatshareRoomsPage />;
  if (isMaintenanceWorkspace(session?.organization.kind)) return <MaintenanceIssuesPage />;
  return <CalendarInner />;
}

function CalendarInner() {
  const { session } = useAuth();
  const { t } = useTranslation();
  const year = new Date().getFullYear();
  const { data, isPending } = useQuery(calendarQuery(session?.organization.id, year, session?.token));
  const days = Array.from({ length: 14 }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() + index);
    return date.toISOString().slice(0, 10);
  });

  return (
    <div>
      <PageHeader
        title={t("calendar.title")}
        action={
          <Link href="/reservation/new" className="btn btn-primary min-h-11 px-4 py-2 text-sm">
            {t("calendar.newBooking")}
          </Link>
        }
      />
      {isPending ? <p className="text-[var(--text-muted)]">{t("common.loading")}</p> : null}
      <div className="overflow-x-auto rounded-2xl border border-[var(--border)] bg-[var(--glass-inner)]">
        <div className="sticky left-0 z-10 grid min-w-[900px]" style={{ gridTemplateColumns: "140px repeat(14, minmax(56px, 1fr))" }}>
          <div className="border-b border-[var(--border)] bg-[var(--surface)] p-3 text-xs text-[var(--text-muted)]">Property</div>
          {days.map((day) => (
            <div key={day} className="border-b border-l border-[var(--border)] p-2 text-center text-[11px] text-[var(--text-muted)]">
              {new Date(`${day}T12:00:00`).toLocaleDateString("en-GB", { weekday: "short", day: "numeric" })}
            </div>
          ))}
          {(data?.properties ?? []).map((property) => (
            <PropertyRow key={property.id} property={property} days={days} />
          ))}
        </div>
      </div>
    </div>
  );
}

function PropertyRow({
  property,
  days,
}: {
  property: {
    id: string;
    publicName: string;
    internalName: string;
    reservations: Array<{ id: string; guestName: string; source: string; checkIn: string; checkOut: string }>;
  };
  days: string[];
}) {
  return (
    <>
      <Link href={`/property/${property.id}`} className="sticky left-0 border-b border-[var(--border)] bg-[var(--surface)] p-3 text-sm font-medium">
        {ocupaiPropertyName(property)}
      </Link>
      <div className="relative col-span-14 border-b border-[var(--border)]" style={{ minHeight: 72 }}>
        {days.map((day, index) => (
          <div key={day} className="absolute top-0 h-full border-l border-[var(--border)]/60" style={{ left: `${(index / 14) * 100}%`, width: `${100 / 14}%` }} />
        ))}
        {property.reservations.map((stay) => {
          const start = days.findIndex((day) => day >= stay.checkIn.slice(0, 10));
          const end = days.findIndex((day) => day >= stay.checkOut.slice(0, 10));
          if (stay.checkOut.slice(0, 10) <= days[0] || stay.checkIn.slice(0, 10) > days[days.length - 1]) return null;
          const left = Math.max(0, start === -1 ? 0 : start);
          const right = end === -1 ? 14 : end;
          const width = Math.max(1, right - left);
          const color = bookingSourceColor(stay.source);
          return (
            <Link
              key={stay.id}
              href={`/reservation/${stay.id}`}
              className="absolute top-3 flex h-12 items-center overflow-hidden rounded-lg px-2 text-xs font-semibold text-white"
              style={{ left: `${(left / 14) * 100}%`, width: `${(width / 14) * 100}%`, background: color }}
            >
              {stay.guestName}
            </Link>
          );
        })}
      </div>
    </>
  );
}
