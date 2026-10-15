"use client";

import type { CSSProperties, ReactNode } from "react";

export function Skeleton({
  className = "",
  style,
  width,
  height,
  radius,
}: {
  className?: string;
  style?: CSSProperties;
  width?: string | number;
  height?: string | number;
  radius?: string | number;
}) {
  return (
    <span
      className={`sk ${className}`}
      style={{
        width,
        height,
        borderRadius: radius,
        ...style,
      }}
      aria-hidden
    />
  );
}

export function SkeletonBlock({ children, className = "", label = "Loading" }: { children: ReactNode; className?: string; label?: string }) {
  return (
    <div className={`sk-block ${className}`} role="status" aria-busy="true" aria-label={label}>
      {children}
    </div>
  );
}

export function SkeletonList({ rows = 6, withAvatar = true }: { rows?: number; withAvatar?: boolean }) {
  return (
    <SkeletonBlock className="list-stack">
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className="list-row">
          {withAvatar ? <Skeleton className="sk-avatar" /> : null}
          <div className="list-row-body sk-col">
            <Skeleton width="42%" height={14} />
            <Skeleton width="68%" height={12} />
            <Skeleton width="34%" height={11} />
          </div>
          <Skeleton width={54} height={22} radius={999} />
        </div>
      ))}
    </SkeletonBlock>
  );
}

export function SkeletonCards({ count = 6 }: { count?: number }) {
  return (
    <SkeletonBlock className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="property-card">
          <Skeleton className="sk-cover" radius={0} />
          <div className="property-body sk-col">
            <div className="flex items-start justify-between gap-3">
              <Skeleton width="55%" height={16} />
              <Skeleton width={52} height={22} radius={999} />
            </div>
            <Skeleton width="40%" height={12} />
            <Skeleton width="48%" height={12} />
          </div>
        </div>
      ))}
    </SkeletonBlock>
  );
}

export function SkeletonHome() {
  return (
    <SkeletonBlock className="space-y-4">
      <div className="flex items-center gap-3">
        <Skeleton className="sk-avatar" width={48} height={48} radius={16} />
        <div className="sk-col flex-1">
          <Skeleton width="38%" height={22} />
          <Skeleton width="28%" height={12} />
        </div>
        <Skeleton width={40} height={40} radius={999} />
      </div>
      <Skeleton height={40} radius={12} />
      <Skeleton height={56} radius={16} />
      <div className="grid grid-cols-2 gap-2">
        <div className="glass">
          <div className="glass-inner sk-col p-4">
            <Skeleton width={18} height={18} radius={6} />
            <Skeleton width="40%" height={28} />
            <Skeleton width="70%" height={12} />
          </div>
        </div>
        <div className="glass">
          <div className="glass-inner sk-col p-4">
            <Skeleton width={18} height={18} radius={6} />
            <Skeleton width="40%" height={28} />
            <Skeleton width="70%" height={12} />
          </div>
        </div>
      </div>
      <div className="glass">
        <div className="glass-inner sk-col p-4">
          <Skeleton width="36%" height={16} />
          <Skeleton width="55%" height={12} />
          <Skeleton width="100%" height={48} radius={12} />
        </div>
      </div>
      <div className="glass">
        <div className="glass-inner sk-col p-4">
          <Skeleton width="44%" height={16} />
          <Skeleton width="100%" height={14} />
          <Skeleton width="92%" height={14} />
          <Skeleton width="80%" height={14} />
        </div>
      </div>
    </SkeletonBlock>
  );
}

export function SkeletonDetail() {
  return (
    <SkeletonBlock className="space-y-4">
      <Skeleton className="sk-hero" />
      <div className="sk-col">
        <Skeleton width="48%" height={26} />
        <Skeleton width="32%" height={14} />
      </div>
      <div className="glass">
        <div className="glass-inner sk-col p-4">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="flex items-center justify-between gap-3 py-2">
              <Skeleton width="28%" height={12} />
              <Skeleton width="42%" height={12} />
            </div>
          ))}
        </div>
      </div>
      <Skeleton height={48} radius={999} />
    </SkeletonBlock>
  );
}

export function SkeletonCalendar() {
  return (
    <SkeletonBlock className="space-y-4">
      <div className="flex gap-2 overflow-hidden">
        {Array.from({ length: 6 }).map((_, index) => (
          <Skeleton key={index} width={72} height={36} radius={999} />
        ))}
      </div>
      <div className="glass">
        <div className="glass-inner space-y-3 p-3">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="flex items-center gap-3">
              <Skeleton width={56} height={40} radius={10} />
              <Skeleton className="flex-1" height={40} radius={10} />
            </div>
          ))}
        </div>
      </div>
    </SkeletonBlock>
  );
}

export function SkeletonForm({ fields = 4 }: { fields?: number }) {
  return (
    <SkeletonBlock className="form-panel sk-col">
      {Array.from({ length: fields }).map((_, index) => (
        <div key={index} className="sk-col">
          <Skeleton width="24%" height={12} />
          <Skeleton height={52} radius={12} />
        </div>
      ))}
      <Skeleton height={48} radius={999} />
    </SkeletonBlock>
  );
}

export function SkeletonChat() {
  return (
    <SkeletonBlock className="chat-thread">
      <Skeleton width="62%" height={56} radius={18} style={{ alignSelf: "flex-start" }} />
      <Skeleton width="48%" height={44} radius={18} style={{ alignSelf: "flex-end" }} />
      <Skeleton width="70%" height={64} radius={18} style={{ alignSelf: "flex-start" }} />
      <Skeleton width="40%" height={40} radius={18} style={{ alignSelf: "flex-end" }} />
      <Skeleton width="55%" height={48} radius={18} style={{ alignSelf: "flex-start" }} />
    </SkeletonBlock>
  );
}

export function SkeletonKpis({ count = 4 }: { count?: number }) {
  return (
    <SkeletonBlock className={`mb-4 grid gap-3 ${count >= 4 ? "grid-cols-2 lg:grid-cols-4" : "grid-cols-2"}`}>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="glass">
          <div className="glass-inner sk-col p-4">
            <Skeleton width="40%" height={11} />
            <Skeleton width="55%" height={24} />
          </div>
        </div>
      ))}
    </SkeletonBlock>
  );
}

export function SkeletonPage({
  variant = "list",
  withHeader = true,
}: {
  variant?: "list" | "cards" | "home" | "detail" | "calendar" | "form" | "chat" | "kpis";
  withHeader?: boolean;
}) {
  return (
    <div>
      {withHeader ? (
        <div className="mb-5 sk-col">
          <Skeleton width="36%" height={28} />
          <Skeleton width="48%" height={14} />
        </div>
      ) : null}
      {variant === "list" ? <SkeletonList /> : null}
      {variant === "cards" ? <SkeletonCards /> : null}
      {variant === "home" ? <SkeletonHome /> : null}
      {variant === "detail" ? <SkeletonDetail /> : null}
      {variant === "calendar" ? <SkeletonCalendar /> : null}
      {variant === "form" ? <SkeletonForm /> : null}
      {variant === "chat" ? <SkeletonChat /> : null}
      {variant === "kpis" ? (
        <>
          <SkeletonKpis />
          <SkeletonList rows={4} />
        </>
      ) : null}
    </div>
  );
}

export function SkeletonShell() {
  return (
    <div className="relative z-10 mx-auto flex min-h-dvh w-full max-w-6xl gap-6 px-4 py-6 lg:px-8">
      <aside className="hidden w-[260px] shrink-0 flex-col gap-3 lg:flex">
        <div className="mb-4 flex items-center gap-3 px-2">
          <Skeleton width={40} height={40} radius={14} />
          <div className="sk-col flex-1">
            <Skeleton width="70%" height={18} />
            <Skeleton width="50%" height={11} />
          </div>
        </div>
        {Array.from({ length: 8 }).map((_, index) => (
          <Skeleton key={index} height={40} radius={12} />
        ))}
      </aside>
      <main className="min-w-0 flex-1 pt-2">
        <SkeletonPage variant="home" withHeader={false} />
      </main>
    </div>
  );
}
