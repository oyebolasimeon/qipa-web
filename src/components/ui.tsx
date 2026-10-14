"use client";

import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";

export function Field({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  autoComplete,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
  autoComplete?: string;
}) {
  return (
    <label className="block">
      <span className="field-label">{label}</span>
      <input
        className="field"
        type={type}
        value={value}
        placeholder={placeholder}
        autoComplete={autoComplete}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}

export function Button({
  children,
  onClick,
  type = "button",
  loading,
  variant = "primary",
  className = "",
}: {
  children: ReactNode;
  onClick?: () => void;
  type?: "button" | "submit";
  loading?: boolean;
  variant?: "primary" | "ghost" | "danger";
  className?: string;
}) {
  const cls =
    variant === "primary" ? "btn btn-primary" : variant === "ghost" ? "btn btn-ghost" : "btn btn-ghost text-[var(--accent)]";
  return (
    <button type={type} onClick={onClick} disabled={loading} className={`${cls} ${className}`}>
      {loading ? "…" : children}
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

export function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="page-title">{title}</h1>
        {subtitle ? <p className="page-sub">{subtitle}</p> : null}
      </div>
      {action}
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
