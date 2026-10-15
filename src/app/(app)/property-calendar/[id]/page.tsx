"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Glass, PageHeader } from "@/components/ui";
import { bookingSourceColor } from "@/lib/booking-source";
import { useAuth } from "@/lib/auth";
import { formatCurrency } from "@/lib/format";
import { ocupaiPropertyName } from "@/lib/property-name";
import { calendarQuery } from "@/lib/queries";

export default function PropertyCalendarPage() {
  const { id } = useParams<{ id: string }>();
  const { session } = useAuth();
  const year = new Date().getFullYear();
  const { data } = useQuery(calendarQuery(session?.organization.id, year, session?.token));
  const property = data?.properties.find((item) => item.id === id);
  const days = Array.from({ length: 31 }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() + index);
    return date.toISOString().slice(0, 10);
  });

  return (
    <div>
      <PageHeader
        title={ocupaiPropertyName(property)}
        subtitle="Availability for this listing"
        action={
          <Link href={`/property/${id}/edit`} className="btn btn-ghost min-h-11 px-4 py-2 text-sm">
            Edit
          </Link>
        }
      />
      <div className="grid grid-cols-7 gap-2">
        {days.map((day) => {
          const stay = property?.reservations.find(
            (item) => item.checkIn.slice(0, 10) <= day && item.checkOut.slice(0, 10) > day,
          );
          const cell = property?.days.find((item) => item.date === day);
          return (
            <Link
              key={day}
              href={stay ? `/reservation/${stay.id}` : `/reservation/new?propertyId=${id}&checkIn=${day}`}
              className="rounded-xl border border-[var(--border)] p-2 text-xs"
              style={stay ? { background: bookingSourceColor(stay.source), color: "white" } : undefined}
            >
              <div>{new Date(`${day}T12:00:00`).getDate()}</div>
              <div className="mt-1 truncate">{stay ? stay.guestName : formatCurrency(cell?.nightlyRate ?? property?.basePrice ?? 0, property?.currency)}</div>
            </Link>
          );
        })}
      </div>
      <Glass className="mt-4">
        <Link href={`/property/${id}`}>Open property details</Link>
      </Glass>
    </div>
  );
}
