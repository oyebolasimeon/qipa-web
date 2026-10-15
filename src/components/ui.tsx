"use client";

import { Check, ChevronDown, ChevronLeft } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import { DateField } from "@/components/range-picker";

export function Field({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  autoComplete,
  multiline,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
  autoComplete?: string;
  multiline?: boolean;
}) {
  if (type === "date") return <DateField label={label} value={value} onChange={onChange} />;
  return (
    <label className="field-wrap block">
      <span className="field-label">{label}</span>
      {multiline ? (
        <textarea
          className="field field-multiline"
          value={value}
          placeholder={placeholder}
          onChange={(event) => onChange(event.target.value)}
        />
      ) : (
        <input
          className="field"
          type={type}
          value={value}
          placeholder={placeholder}
          autoComplete={autoComplete}
          onChange={(event) => onChange(event.target.value)}
        />
      )}
    </label>
  );
}

export function FormSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: Array<{ value: string; label: string }>;
  onChange: (value: string) => void;
}) {
  return (
    <div className="field-wrap">
      <div className="field-label">{label}</div>
      <div className="choice-chips">
        {options.map((option) => (
          <button
            key={option.value || "all"}
            type="button"
            className={`choice-chip ${value === option.value ? "on" : ""}`}
            onClick={() => onChange(option.value)}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export function FormDropdown({
  label,
  value,
  options,
  onChange,
  placeholder = "Select",
}: {
  label: string;
  value: string;
  options: Array<{ value: string; label: string }>;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const selected = options.find((option) => option.value === value);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <div className="field-wrap">
      <div className="field-label">{label}</div>
      <button type="button" className="dropdown" onClick={() => setOpen(true)}>
        <span className={selected ? "" : "dropdown-placeholder"}>{selected?.label ?? placeholder}</span>
        <ChevronDown size={18} className="text-[var(--text-muted)]" />
      </button>
      {open ? (
        <div className="sheet-root">
          <button type="button" className="sheet-backdrop" aria-label="Close" onClick={() => setOpen(false)} />
          <div className="sheet">
            <div className="sheet-grabber" />
            <div className="sheet-title">{label}</div>
            <div className="max-h-[420px] overflow-y-auto">
              {options.map((option) => {
                const active = option.value === value;
                return (
                  <button
                    key={option.value || "all"}
                    type="button"
                    className={`sheet-row ${active ? "active" : ""}`}
                    onClick={() => {
                      onChange(option.value);
                      setOpen(false);
                    }}
                  >
                    <span>{option.label}</span>
                    {active ? <Check size={18} className="text-[var(--primary)]" /> : null}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function Button({
  children,
  onClick,
  type = "button",
  loading,
  disabled,
  variant = "primary",
  size = "md",
  className = "",
}: {
  children: ReactNode;
  onClick?: () => void;
  type?: "button" | "submit";
  loading?: boolean;
  disabled?: boolean;
  variant?: "primary" | "ghost" | "soft" | "danger" | "danger-ghost";
  size?: "md" | "sm";
  className?: string;
}) {
  const variantClass =
    variant === "ghost"
      ? "btn-ghost"
      : variant === "soft"
        ? "btn-soft"
        : variant === "danger"
          ? "btn-danger"
          : variant === "danger-ghost"
            ? "btn-danger-ghost"
            : "btn-primary";
  const busy = Boolean(loading);
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={busy || disabled}
      aria-busy={busy || undefined}
      className={`btn ${variantClass} ${size === "sm" ? "btn-sm" : "btn-md"} ${className}`}
    >
      {busy ? <span className="btn-spinner" aria-hidden /> : null}
      <span>{busy ? "Working…" : children}</span>
    </button>
  );
}

export function Glass({
  children,
  className = "",
  accent = false,
  padding = 16,
  onClick,
}: {
  children: ReactNode;
  className?: string;
  accent?: boolean;
  padding?: number;
  onClick?: () => void;
}) {
  const inner = (
    <div className={`glass ${accent ? "glass-primary" : ""} ${className}`}>
      <div className="glass-inner" style={{ padding }}>
        {children}
      </div>
    </div>
  );
  if (!onClick) return inner;
  return (
    <button type="button" onClick={onClick} className="block w-full text-left">
      {inner}
    </button>
  );
}

export function EmptyState({
  title,
  body,
  action,
  href,
}: {
  title: string;
  body?: string;
  action?: string;
  href?: string;
}) {
  return (
    <div className="flex flex-col items-center px-6 py-12 text-center">
      <div
        className="mb-4 flex h-16 w-16 items-center justify-center rounded-full"
        style={{ background: "linear-gradient(180deg, rgba(79,124,255,0.2), rgba(79,124,255,0.04))" }}
      >
        <span className="text-2xl text-[var(--primary)]">◇</span>
      </div>
      <p className="font-[family-name:var(--font-outfit)] text-lg font-semibold">{title}</p>
      {body ? <p className="mt-2 max-w-sm text-sm text-[var(--text-secondary)]">{body}</p> : null}
      {action && href ? (
        <Link href={href} className="btn btn-primary mt-5">
          {action}
        </Link>
      ) : null}
    </div>
  );
}

export function ErrorBanner({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <div className="mb-4 rounded-xl border border-[var(--accent)]/30 bg-[var(--accent)]/10 px-3 py-2 text-sm text-[var(--accent)]">
      {message}
    </div>
  );
}

const ROOT_PATHS = new Set([
  "/home",
  "/calendar",
  "/bookings",
  "/inbox",
  "/more",
  "/staff",
  "/staff/tasks",
  "/staff/profile",
  "/staff/notifications",
  "/flatshares/rooms",
  "/flatshares/tenancies",
  "/flatshares/enquiries",
  "/maintenance/issues",
  "/maintenance/work-orders",
  "/maintenance/contractors",
  "/supported/rooms",
  "/supported/placements",
  "/supported/referrals",
]);

export function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const showBack = !ROOT_PATHS.has(pathname);

  return (
    <div className="mb-5 flex items-start justify-between gap-3">
      <div className="flex min-w-0 items-start gap-2">
        {showBack ? (
          <button
            type="button"
            className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[var(--primary)]"
            onClick={() => router.back()}
            aria-label="Back"
          >
            <ChevronLeft size={22} />
          </button>
        ) : null}
        <div className="min-w-0">
          <h1 className="page-title">{title}</h1>
          {subtitle ? <p className="page-sub">{subtitle}</p> : null}
        </div>
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

export function StatusPill({ children, color }: { children: ReactNode; color?: string }) {
  return (
    <span className="chip" style={color ? ({ color, background: `${color}22` } as CSSProperties) : undefined}>
      {children}
    </span>
  );
}

export function IconTile({ tint, children }: { tint: string; children: ReactNode }) {
  return (
    <span
      className="inline-flex h-[34px] w-[34px] items-center justify-center rounded-[10px]"
      style={{ background: `${tint}18`, color: tint }}
    >
      {children}
    </span>
  );
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <Glass className={className}>{children}</Glass>;
}

export function Kpi({ label, value }: { label: string; value: string }) {
  return (
    <Glass>
      <div className="text-[11px] font-semibold uppercase tracking-[0.4px] text-[var(--text-muted)]">{label}</div>
      <div className="mt-2 font-[family-name:var(--font-outfit)] text-[28px] font-bold tracking-tight">{value}</div>
    </Glass>
  );
}

export function ProgressBar({ progress }: { progress: number }) {
  const value = Math.max(0, Math.min(100, progress));
  return (
    <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/5">
      <div
        className="h-full rounded-full"
        style={{ width: `${value}%`, background: "linear-gradient(90deg, #4F7CFF, #6B3490)" }}
      />
    </div>
  );
}
