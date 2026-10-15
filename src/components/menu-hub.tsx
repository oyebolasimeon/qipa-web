"use client";

import { ChevronRight } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { Glass, IconTile, PageHeader } from "@/components/ui";

export function MenuRow({
  href,
  icon,
  tint,
  label,
  last,
  badge,
}: {
  href: string;
  icon: ReactNode;
  tint: string;
  label: string;
  last?: boolean;
  badge?: number;
}) {
  return (
    <Link href={href} className={`flex items-center gap-3 px-4 py-3.5 ${last ? "" : "border-b border-[var(--border)]"}`}>
      <IconTile tint={tint}>{icon}</IconTile>
      <span className="flex-1 text-[15px] font-medium">{label}</span>
      {badge && badge > 0 ? (
        <span className="rounded-full px-2 py-0.5 text-xs font-bold text-white" style={{ background: tint }}>
          {badge}
        </span>
      ) : null}
      <ChevronRight size={16} className="text-[var(--text-muted)]" />
    </Link>
  );
}

export function MenuHub({
  title,
  subtitle,
  items,
}: {
  title: string;
  subtitle?: string;
  items: Array<{ href: string; icon: ReactNode; tint: string; label: string; badge?: number }>;
}) {
  return (
    <div>
      <PageHeader title={title} subtitle={subtitle} />
      <Glass padding={0}>
        {items.map((item, index) => (
          <MenuRow key={item.href} {...item} last={index === items.length - 1} />
        ))}
      </Glass>
    </div>
  );
}
