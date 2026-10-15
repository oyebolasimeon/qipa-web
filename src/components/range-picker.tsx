"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useMemo, useState, type ReactNode } from "react";
import { useTranslation } from "@/lib/i18n";

const WEEKDAYS = ["M", "T", "W", "T", "F", "S", "S"];

export function isoDate(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export function todayIso() {
  const now = new Date();
  return isoDate(now.getFullYear(), now.getMonth(), now.getDate());
}

export function addDays(key: string, days: number) {
  const date = new Date(`${key}T12:00:00`);
  date.setDate(date.getDate() + days);
  return isoDate(date.getFullYear(), date.getMonth(), date.getDate());
}

function parseKey(key: string) {
  return new Date(`${key}T12:00:00`);
}

export function formatPillDate(key: string) {
  if (!key) return "Select";
  return parseKey(key).toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

function monthLabel(year: number, month: number) {
  return new Date(year, month, 1).toLocaleDateString("en-GB", { month: "long", year: "numeric" });
}

function MonthGrid({
  year,
  month,
  onMonthChange,
  renderDay,
}: {
  year: number;
  month: number;
  onMonthChange: (year: number, month: number) => void;
  renderDay: (key: string) => ReactNode;
}) {
  const cells = useMemo(() => {
    const pad = (new Date(year, month, 1).getDay() + 6) % 7;
    const days = new Date(year, month + 1, 0).getDate();
    const list: Array<string | null> = Array.from({ length: pad }, () => null);
    for (let day = 1; day <= days; day += 1) list.push(isoDate(year, month, day));
    while (list.length % 7) list.push(null);
    return list;
  }, [year, month]);

  const shift = (delta: number) => {
    const next = new Date(year, month + delta, 1);
    onMonthChange(next.getFullYear(), next.getMonth());
  };

  return (
    <>
      <div className="range-month">
        <button type="button" className="range-month-btn" onClick={() => shift(-1)} aria-label="Previous month">
          <ChevronLeft size={18} />
        </button>
        <div className="range-month-title">{monthLabel(year, month)}</div>
        <button type="button" className="range-month-btn" onClick={() => shift(1)} aria-label="Next month">
          <ChevronRight size={18} />
        </button>
      </div>
      <div className="range-weekdays">
        {WEEKDAYS.map((day, index) => (
          <span key={`${day}-${index}`}>{day}</span>
        ))}
      </div>
      <div className="range-grid">
        {cells.map((key, index) =>
          key ? (
            <div key={key} className="range-cell">
              {renderDay(key)}
            </div>
          ) : (
            <div key={`empty-${index}`} className="range-cell" />
          ),
        )}
      </div>
    </>
  );
}

export function RangePicker({
  startDate,
  endDate,
  onChange,
  startLabel,
  endLabel,
}: {
  startDate: string;
  endDate: string;
  onChange: (startDate: string, endDate: string) => void;
  startLabel?: string;
  endLabel?: string;
}) {
  const { t } = useTranslation();
  const initial = parseKey(startDate || todayIso());
  const [year, setYear] = useState(initial.getFullYear());
  const [month, setMonth] = useState(initial.getMonth());
  const [pickingLast, setPickingLast] = useState(Boolean(startDate));

  const tap = (key: string) => {
    if (!pickingLast || !startDate) {
      onChange(key, key);
      setPickingLast(true);
      return;
    }
    if (key < startDate) onChange(key, startDate);
    else onChange(startDate, key);
    setPickingLast(false);
  };

  const nights =
    startDate && endDate
      ? Math.max(1, Math.round((parseKey(endDate).getTime() - parseKey(startDate).getTime()) / 86400000) + 1)
      : 0;

  return (
    <div className="range-picker">
      <div className="range-pills">
        <button type="button" className={`range-pill ${pickingLast ? "" : "on"}`} onClick={() => setPickingLast(false)}>
          <span className="range-pill-label">{startLabel ?? t("calendar.firstNight")}</span>
          <span className="range-pill-value">{formatPillDate(startDate)}</span>
        </button>
        <span className="text-[var(--text-muted)]">→</span>
        <button type="button" className={`range-pill ${pickingLast ? "on" : ""}`} onClick={() => setPickingLast(true)}>
          <span className="range-pill-label">{endLabel ?? t("calendar.lastNight")}</span>
          <span className="range-pill-value">{formatPillDate(endDate)}</span>
        </button>
      </div>
      <MonthGrid
        year={year}
        month={month}
        onMonthChange={(nextYear, nextMonth) => {
          setYear(nextYear);
          setMonth(nextMonth);
        }}
        renderDay={(key) => {
          const inRange = Boolean(startDate && endDate && key >= startDate && key <= endDate);
          const edge = key === startDate || key === endDate;
          return (
            <button type="button" className="range-band-btn" onClick={() => tap(key)}>
              <span className={`range-band ${inRange ? "on" : ""} ${key === startDate ? "start" : ""} ${key === endDate ? "end" : ""}`}>
                <span className={`range-dot ${edge ? "edge" : ""} ${inRange && !edge ? "in" : ""}`}>{Number(key.slice(8))}</span>
              </span>
            </button>
          );
        }}
      />
      <p className="range-hint">
        {pickingLast ? t("calendar.tapLastNight") : t("calendar.tapFirstNight")} · {t("calendar.nightsCount", { count: nights })}
      </p>
    </div>
  );
}

export function DateField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const seed = parseKey(value || todayIso());
  const [year, setYear] = useState(seed.getFullYear());
  const [month, setMonth] = useState(seed.getMonth());

  return (
    <div className="field-wrap">
      <div className="field-label">{label}</div>
      <button type="button" className="dropdown" onClick={() => setOpen(true)}>
        <span className={value ? "" : "dropdown-placeholder"}>{value ? formatPillDate(value) : "Select date"}</span>
      </button>
      {open ? (
        <div className="sheet-root">
          <button type="button" className="sheet-backdrop" aria-label="Close" onClick={() => setOpen(false)} />
          <div className="sheet">
            <div className="sheet-grabber" />
            <div className="sheet-title">{label}</div>
            <MonthGrid
              year={year}
              month={month}
              onMonthChange={(nextYear, nextMonth) => {
                setYear(nextYear);
                setMonth(nextMonth);
              }}
              renderDay={(key) => (
                <button
                  type="button"
                  className="range-band-btn"
                  onClick={() => {
                    onChange(key);
                    setOpen(false);
                  }}
                >
                  <span className={`range-band ${key === value ? "on start end" : ""}`}>
                    <span className={`range-dot ${key === value ? "edge" : ""}`}>{Number(key.slice(8))}</span>
                  </span>
                </button>
              )}
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}
