"use client";

import {
  Bell,
  BookOpen,
  Building2,
  CalendarDays,
  Hammer,
  Home,
  Inbox,
  LayoutGrid,
  MessageCircle,
  Settings,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { OcupaiMark, Wordmark } from "@/components/brand";
import { SpaceBackdrop } from "@/components/space-backdrop";
import { useAuth } from "@/lib/auth";
import { useTranslation } from "@/lib/i18n";
import {
  isFlatsharesWorkspace,
  isMaintenanceWorkspace,
  isSupportedWorkspace,
} from "@/lib/workspace-mode";

function tabItems(kind?: string) {
  if (isSupportedWorkspace(kind)) {
    return [
      { href: "/home", labelKey: "tabs.home" as const, icon: Sparkles },
      { href: "/supported/rooms", labelKey: "supported.rooms" as const, icon: Building2 },
      { href: "/supported/placements", labelKey: "supported.placements" as const, icon: BookOpen },
      { href: "/supported/referrals", labelKey: "supported.referrals" as const, icon: Inbox },
      { href: "/more", labelKey: "tabs.more" as const, icon: LayoutGrid },
    ];
  }
  if (isFlatsharesWorkspace(kind)) {
    return [
      { href: "/home", labelKey: "tabs.home" as const, icon: Sparkles },
      { href: "/flatshares/rooms", labelKey: "flatshares.rooms" as const, icon: Building2 },
      { href: "/flatshares/tenancies", labelKey: "flatshares.tenancies" as const, icon: BookOpen },
      { href: "/flatshares/enquiries", labelKey: "flatshares.enquiries" as const, icon: Inbox },
      { href: "/more", labelKey: "tabs.more" as const, icon: LayoutGrid },
    ];
  }
  if (isMaintenanceWorkspace(kind)) {
    return [
      { href: "/home", labelKey: "tabs.home" as const, icon: Sparkles },
      { href: "/maintenance/issues", labelKey: "maintenance.issues" as const, icon: Hammer },
      { href: "/maintenance/work-orders", labelKey: "maintenance.workOrders" as const, icon: BookOpen },
      { href: "/maintenance/contractors", labelKey: "maintenance.contractors" as const, icon: Inbox },
      { href: "/more", labelKey: "tabs.more" as const, icon: LayoutGrid },
    ];
  }
  return [
    { href: "/home", labelKey: "tabs.home" as const, icon: Sparkles },
    { href: "/calendar", labelKey: "tabs.calendar" as const, icon: CalendarDays },
    { href: "/bookings", labelKey: "tabs.bookings" as const, icon: BookOpen },
    { href: "/inbox", labelKey: "tabs.inbox" as const, icon: Inbox },
    { href: "/more", labelKey: "tabs.more" as const, icon: LayoutGrid },
  ];
}

export function AppShell({ children }: { children: ReactNode }) {
  const { session, isLoading } = useAuth();
  const { t } = useTranslation();
  const pathname = usePathname();
  const router = useRouter();
  const items = tabItems(session?.organization.kind);

  useEffect(() => {
    if (!isLoading && !session) router.replace("/login");
  }, [isLoading, session, router]);

  if (isLoading || !session) {
    return (
      <div className="space-root flex items-center justify-center text-[var(--text-secondary)]">
        <SpaceBackdrop />
        <span className="relative z-10">{t("common.loading")}</span>
      </div>
    );
  }

  return (
    <div className="space-root">
      <SpaceBackdrop />
      <aside className="sidebar fixed inset-y-0 left-0 z-20 hidden w-[260px] px-4 py-6 lg:flex lg:flex-col">
        <Link href="/home" className="mb-8 flex items-center gap-3 px-2">
          <OcupaiMark size={40} />
          <div>
            <Wordmark size={22} />
            <div className="mt-0.5 max-w-[150px] truncate text-xs text-[var(--text-muted)]">{session.organization.name}</div>
          </div>
        </Link>
        <nav className="flex flex-1 flex-col gap-1">
          {items.map((item) => {
            const active = pathname === item.href || (item.href !== "/home" && pathname.startsWith(item.href));
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium tracking-wide ${active ? "bg-[var(--primary-muted)] text-[var(--mist)]" : "text-[var(--text-muted)] hover:text-[var(--text)]"}`}
              >
                <Icon size={18} />
                {t(item.labelKey)}
              </Link>
            );
          })}
          <div className="mt-8 px-3 text-[11px] font-medium uppercase tracking-[2.8px] text-[var(--text-muted)]">Workspace</div>
          <Link href="/properties" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] text-[var(--text-muted)] hover:text-[var(--text)]">
            <Home size={18} /> Properties
          </Link>
          <Link href="/tasks" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] text-[var(--text-muted)] hover:text-[var(--text)]">
            <Hammer size={18} /> Tasks
          </Link>
          <Link href="/chat" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] text-[var(--text-muted)] hover:text-[var(--text)]">
            <MessageCircle size={18} /> Ask Ocupai
          </Link>
          <Link href="/settings" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] text-[var(--text-muted)] hover:text-[var(--text)]">
            <Settings size={18} /> Settings
          </Link>
        </nav>
      </aside>

      <div className="relative z-10 lg:pl-[260px]">
        <header className="flex items-center justify-between px-4 pb-1 pt-4 lg:hidden">
          <div className="flex items-center gap-2">
            <OcupaiMark size={32} />
            <Wordmark size={20} />
          </div>
          <Link href="/alerts" className="relative flex h-10 w-10 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface)]" aria-label="Alerts">
            <Bell size={18} />
          </Link>
        </header>
        <main className="mx-auto max-w-5xl px-4 pb-28 pt-3 lg:px-8 lg:pb-12 lg:pt-8">{children}</main>
      </div>

      <nav className="tabbar fixed inset-x-0 bottom-0 z-20 grid grid-cols-5 px-1 pb-[max(10px,env(safe-area-inset-bottom))] pt-2 lg:hidden">
        {items.map((item) => {
          const active = pathname === item.href || (item.href !== "/home" && pathname.startsWith(item.href));
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-1 py-1 text-[11px] font-medium tracking-[0.4px] ${active ? "text-[var(--mist)]" : "text-[var(--text-muted)]"}`}
            >
              <Icon size={20} />
              {t(item.labelKey)}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
