"use client";

import { CalendarDays, List, Search } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import Link from "next/link";
import { MonthStripCalendar } from "@/components/month-strip";
import { OccupancyGrid } from "@/components/occupancy-grid";
import { RangePicker } from "@/components/range-picker";
import { SkeletonCalendar } from "@/components/skeleton";
import { Button, Field, PageHeader } from "@/components/ui";
import { apiRequest } from "@/lib/api";
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

function monthShort(year: number, month: number) {
  return new Intl.DateTimeFormat("en-GB", { month: "short" }).format(new Date(year, month, 1));
}

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
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [chipYear, setChipYear] = useState(now.getFullYear());
  const [view, setView] = useState<"grid" | "strip">("grid");
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [editor, setEditor] = useState<{
    propertyId: string;
    propertyName: string;
    startDate: string;
    endDate: string;
    rate: string;
    minStay: string;
    stopSell: boolean;
  } | null>(null);
  const [saving, setSaving] = useState(false);

  const { data, isPending, refetch } = useQuery(calendarQuery(session?.organization.id, year, session?.token));

  const monthChips = useMemo(() => {
    const items: Array<{ year: number; month: number; label: string }> = [];
    for (let offset = -2; offset <= 2; offset += 1) {
      const date = new Date(chipYear, month + offset, 1);
      items.push({ year: date.getFullYear(), month: date.getMonth(), label: monthShort(date.getFullYear(), date.getMonth()) });
    }
    return items;
  }, [chipYear, month]);

  const properties = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return (data?.properties ?? []).filter((property) => {
      if (!needle) return true;
      return ocupaiPropertyName(property).toLowerCase().includes(needle);
    });
  }, [data?.properties, query]);

  return (
    <div>
      <PageHeader
        title={t("calendar.title")}
        action={
          <div className="flex items-center gap-2">
            <div className="view-switch">
              <button type="button" className={view === "grid" ? "on" : ""} onClick={() => setView("grid")} aria-label={t("calendar.viewGrid")}>
                <CalendarDays size={16} />
              </button>
              <button type="button" className={view === "strip" ? "on" : ""} onClick={() => setView("strip")} aria-label={t("calendar.viewStrip")}>
                <List size={16} />
              </button>
            </div>
            <button type="button" className="flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--border)]" onClick={() => setSearchOpen((value) => !value)}>
              <Search size={18} />
            </button>
            <Link href="/reservation/new" className="btn btn-primary min-h-11 px-4 py-2 text-sm">
              {t("calendar.newBooking")}
            </Link>
          </div>
        }
      />
      {searchOpen ? (
        <input
          className="field mb-4"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={t("calendar.searchPlaceholder")}
        />
      ) : null}
      {view === "grid" ? (
        <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
          <button
            type="button"
            className="month-chip"
            onClick={() => {
              const next = chipYear + 1 > year + 2 ? year - 1 : chipYear + 1;
              setChipYear(next);
              setYear(next);
              setMonth(0);
            }}
          >
            {chipYear} ▾
          </button>
          {monthChips.map((chip) => {
            const selected = chip.year === chipYear && chip.month === month;
            return (
              <button
                key={`${chip.year}-${chip.month}`}
                type="button"
                className={`month-chip ${selected ? "on" : ""}`}
                onClick={() => {
                  setChipYear(chip.year);
                  setMonth(chip.month);
                  if (chip.year !== year) setYear(chip.year);
                }}
              >
                {chip.label}
              </button>
            );
          })}
        </div>
      ) : null}
      {isPending ? <SkeletonCalendar /> : null}
      {view === "strip" ? (
        <MonthStripCalendar properties={properties} year={chipYear} month={month} onMonthChange={(nextYear, nextMonth) => {
          setChipYear(nextYear);
          setMonth(nextMonth);
          if (nextYear !== year) setYear(nextYear);
        }} />
      ) : (
        <OccupancyGrid
          properties={properties}
          onDayPress={(propertyId, date, nightlyRate, stopSell) => {
            const property = properties.find((item) => item.id === propertyId);
            const day = property?.days.find((item) => item.date.slice(0, 10) === date);
            setEditor({
              propertyId,
              propertyName: ocupaiPropertyName(property),
              startDate: date,
              endDate: date,
              rate: String(nightlyRate),
              minStay: String(day?.minimumStay ?? 1),
              stopSell,
            });
          }}
        />
      )}

      {editor ? (
        <div className="sheet-root">
          <button type="button" className="sheet-backdrop" onClick={() => setEditor(null)} />
          <div className="sheet">
            <div className="sheet-grabber" />
            <div className="sheet-title">{editor.propertyName}</div>
            <RangePicker
              startDate={editor.startDate}
              endDate={editor.endDate}
              onChange={(startDate, endDate) => setEditor({ ...editor, startDate, endDate })}
            />
            <Field label={t("calendar.nightlyRate")} value={editor.rate} onChange={(rate) => setEditor({ ...editor, rate })} />
            <Field label={t("calendar.minimumStay")} value={editor.minStay} onChange={(minStay) => setEditor({ ...editor, minStay })} />
            <button
              type="button"
              className="mb-4 flex w-full items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3"
              onClick={() => setEditor({ ...editor, stopSell: !editor.stopSell })}
            >
              <span className="field-label mb-0">{t("calendar.stopSell")}</span>
              <span className="font-semibold text-[var(--mist)]">{editor.stopSell ? t("calendar.on") : t("calendar.off")}</span>
            </button>
            <Button
              className="w-full"
              loading={saving}
              onClick={() => {
                if (!session?.token) return;
                setSaving(true);
                void apiRequest("/api/calendar/pricing", {
                  method: "POST",
                  token: session.token,
                  body: {
                    propertyId: editor.propertyId,
                    changes: [
                      {
                        startDate: editor.startDate,
                        endDate: editor.endDate,
                        nightlyRate: Number(editor.rate),
                        minimumStay: Number(editor.minStay),
                        stopSell: editor.stopSell,
                      },
                    ],
                  },
                })
                  .then(() => {
                    setEditor(null);
                    void refetch();
                  })
                  .finally(() => setSaving(false));
              }}
            >
              {saving ? t("calendar.saving") : t("calendar.saveAndSync")}
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
