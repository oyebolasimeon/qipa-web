"use client";

import Link from "next/link";
import { Home } from "lucide-react";
import { bookingSourceColor } from "@/lib/booking-source";
import { mediaUrl } from "@/lib/api";
import { ocupaiPropertyName } from "@/lib/property-name";
import type { CalendarView } from "@/lib/types";

const DAY = 64;
const GUTTER = 5;

type PropertyRow = CalendarView["properties"][number];

function dateKey(value: string) {
  return value.slice(0, 10);
}

function todayKey() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

function clipSpan(days: string[], checkIn: string, checkOut: string) {
  if (!days.length) return null;
  const startKey = dateKey(checkIn);
  const endKey = dateKey(checkOut);
  const first = days[0];
  const last = days[days.length - 1];
  if (endKey <= first || startKey > last) return null;
  const start = startKey <= first ? 0 : days.indexOf(startKey);
  const end = endKey > last ? days.length : days.indexOf(endKey);
  if (start < 0 || end < 0 || end <= start) return null;
  return { start, end };
}

function houseStatus(row: PropertyRow, today: string) {
  const checkoutToday = row.reservations.some((stay) => dateKey(stay.checkOut) === today);
  const checkInToday = row.reservations.some((stay) => dateKey(stay.checkIn) === today);
  const occupying = row.reservations.some((stay) => dateKey(stay.checkIn) <= today && dateKey(stay.checkOut) > today);
  if (checkoutToday && !occupying) return { label: "Dirty", color: "var(--warning)" };
  if (checkInToday) return { label: "Arriving", color: "var(--primary)" };
  if (occupying) return { label: "Occupied", color: "var(--success)" };
  return { label: "Vacant", color: "var(--text-muted)" };
}

function nightStopped(cell?: { status?: string; stopSell?: boolean }) {
  if (!cell) return false;
  if (cell.stopSell) return true;
  return cell.status === "BLOCKED" || cell.status === "MAINTENANCE" || cell.status === "OWNER_STAY";
}

export function OccupancyGrid({
  properties,
  onDayPress,
}: {
  properties: PropertyRow[];
  onDayPress?: (propertyId: string, date: string, nightlyRate: number, stopSell: boolean) => void;
}) {
  const days = properties[0]?.days.map((day) => dateKey(day.date)) ?? [];
  const today = todayKey();
  const todayIndex = days.indexOf(today);
  const width = Math.max(days.length * DAY, DAY);

  return (
    <div className="occ">
      <div className="occ-scroll">
        <div className="occ-grid" style={{ minWidth: 136 + width }}>
          <div className="occ-corner" />
          <div className="occ-days" style={{ width }}>
            {days.map((day, index) => {
              const date = new Date(`${day}T12:00:00`);
              return (
                <div key={day} className={`occ-dayhead ${index === todayIndex ? "today" : ""}`}>
                  <span>{date.toLocaleDateString("en-GB", { weekday: "short" })}</span>
                  <span>{date.getDate()}</span>
                </div>
              );
            })}
          </div>
          <div className="occ-labels">
            {properties.map((property) => {
              const status = houseStatus(property, today);
              return (
                <Link key={property.id} href={`/property-calendar/${property.id}`} className="occ-label">
                  {property.coverPhotoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={mediaUrl(property.coverPhotoUrl)} alt="" className="occ-thumb" />
                  ) : (
                    <span className="occ-thumb flex items-center justify-center text-[var(--primary)]">
                      <Home size={15} />
                    </span>
                  )}
                  <span className="min-w-0">
                    <div className="occ-name">{ocupaiPropertyName(property)}</div>
                    <div className="occ-status" style={{ color: status.color }}>
                      {status.label}
                    </div>
                  </span>
                </Link>
              );
            })}
          </div>
          <div className="occ-lanes" style={{ width }}>
            {todayIndex >= 0 ? (
              <div className="occ-now" style={{ left: todayIndex * DAY + DAY / 2, height: properties.length * 88 }} />
            ) : null}
            {properties.map((property) => (
              <Lane key={property.id} property={property} days={days} todayIndex={todayIndex} onDayPress={onDayPress} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function Lane({
  property,
  days,
  todayIndex,
  onDayPress,
}: {
  property: PropertyRow;
  days: string[];
  todayIndex: number;
  onDayPress?: (propertyId: string, date: string, nightlyRate: number, stopSell: boolean) => void;
}) {
  const booked = property.reservations
    .map((reservation) => {
      const span = clipSpan(days, reservation.checkIn, reservation.checkOut);
      return span ? { reservation, ...span } : null;
    })
    .filter(Boolean) as Array<{ reservation: PropertyRow["reservations"][number]; start: number; end: number }>;
  const occupied = new Set<number>();
  for (const block of booked) {
    for (let i = block.start; i < block.end; i += 1) occupied.add(i);
  }

  return (
    <div
      className="occ-lane"
      style={{ width: days.length * DAY }}
      onClick={(event) => {
        const index = Math.floor(event.nativeEvent.offsetX / DAY);
        if (index < 0 || index >= days.length) return;
        const cell = property.days[index];
        onDayPress?.(property.id, days[index], cell?.nightlyRate ?? property.basePrice, nightStopped(cell));
      }}
    >
      {days.map((day, index) => {
        const cell = property.days[index];
        const blocked = nightStopped(cell);
        return (
          <div key={day} className="occ-cell" style={{ left: index * DAY, width: DAY }}>
            {index === todayIndex ? <span className="occ-todaycol" /> : null}
            {!occupied.has(index) && !blocked && cell ? (
              <span className="occ-rate">£{Math.round(cell.nightlyRate)}</span>
            ) : null}
          </div>
        );
      })}
      {booked.map(({ reservation, start, end }) => (
        <Link
          key={reservation.id}
          href={`/reservation/${reservation.id}`}
          className="occ-bar"
          style={{
            left: start * DAY + GUTTER,
            width: Math.max((end - start) * DAY - GUTTER * 2, 48),
            background: bookingSourceColor(reservation.source),
          }}
        >
          {reservation.guestName}
        </Link>
      ))}
    </div>
  );
}
