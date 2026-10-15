"use client";

import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { bookingSourceColor } from "@/lib/booking-source";
import { ocupaiPropertyName } from "@/lib/property-name";
import type { CalendarView } from "@/lib/types";

type PropertyRow = CalendarView["properties"][number];

function iso(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function dateKey(value: string) {
  return value.slice(0, 10);
}

export function MonthStripCalendar({
  properties,
  year,
  month,
  onMonthChange,
}: {
  properties: PropertyRow[];
  year: number;
  month: number;
  onMonthChange: (year: number, month: number) => void;
}) {
  const days = new Date(year, month + 1, 0).getDate();
  const keys = Array.from({ length: days }, (_, index) => iso(year, month, index + 1));
  const title = new Date(year, month, 1).toLocaleDateString("en-GB", { month: "long", year: "numeric" }).toUpperCase();

  const go = (delta: number) => {
    const next = new Date(year, month + delta, 1);
    onMonthChange(next.getFullYear(), next.getMonth());
  };

  return (
    <div>
      <div className="strip-month">
        <button type="button" onClick={() => go(-1)} className="text-[var(--mist)]" aria-label="Previous month">
          <ChevronLeft size={18} />
        </button>
        <div className="strip-pill">
          <span className="strip-dot" />
          {title}
        </div>
        <button type="button" onClick={() => go(1)} className="text-[var(--mist)]" aria-label="Next month">
          <ChevronRight size={18} />
        </button>
      </div>
      {properties.map((property) => (
        <div key={property.id} className="strip-row">
          <Link href={`/property-calendar/${property.id}`} className="w-[120px] shrink-0 occ-name">
            {ocupaiPropertyName(property)}
          </Link>
          <div className="strip-nights">
            {keys.map((key) => {
              const stay = property.reservations.find((reservation) => {
                const start = dateKey(reservation.checkIn);
                const end = dateKey(reservation.checkOut);
                return start <= key && end > key && reservation.status !== "CANCELLED";
              });
              const cell = property.days.find((item) => dateKey(item.date) === key);
              const blocked = cell?.stopSell || ["BLOCKED", "MAINTENANCE", "OWNER_STAY"].includes(cell?.status ?? "");
              return stay ? (
                <Link
                  key={key}
                  href={`/reservation/${stay.id}`}
                  className="strip-night"
                  style={{ background: bookingSourceColor(stay.source) }}
                  title={stay.guestName}
                />
              ) : (
                <span key={key} className="strip-night" style={blocked ? { background: "rgba(245,241,232,0.4)" } : undefined} />
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
