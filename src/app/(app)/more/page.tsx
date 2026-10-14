"use client";

import {
  Bed,
  Bell,
  Calendar,
  ChevronRight,
  Clipboard,
  Hammer,
  LayoutGrid,
  Link2,
  Mail,
  MessageCircle,
  Receipt,
  Settings,
  Sparkles,
  Users,
  Wallet,
  Wrench,
} from "lucide-react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";
import { WorkspaceSwitcher } from "@/components/workspace-switcher";
import { Button, Glass, IconTile, PageHeader } from "@/components/ui";
import { useAuth } from "@/lib/auth";
import { useTranslation } from "@/lib/i18n";
import { briefingQuery } from "@/lib/queries";
import { isInvestor } from "@/lib/roles";
import {
  isFlatsharesWorkspace,
  isMaintenanceWorkspace,
  isSupportedWorkspace,
} from "@/lib/workspace-mode";

function MenuRow({ href, icon, tint, label, last }: { href: string; icon: ReactNode; tint: string; label: string; last?: boolean }) {
  return (
    <Link href={href} className={`flex items-center gap-3 px-4 py-3.5 ${last ? "" : "border-b border-[var(--border)]"}`}>
      <IconTile tint={tint}>{icon}</IconTile>
      <span className="flex-1 text-[15px] font-medium">{label}</span>
      <ChevronRight size={16} className="text-[var(--text-muted)]" />
    </Link>
  );
}

export default function MorePage() {
  const { session, signOut, deleteAccount } = useAuth();
  const { t } = useTranslation();
  const [showWorkspaces, setShowWorkspaces] = useState(false);
  const investor = isInvestor(session?.membership.role);
  const supported = isSupportedWorkspace(session?.organization.kind);
  const flatshares = isFlatsharesWorkspace(session?.organization.kind);
  const maintenance = isMaintenanceWorkspace(session?.organization.kind);
  const hideShortLet = supported || flatshares || maintenance;
  const briefing = useQuery({
    ...briefingQuery(session?.organization.id, session?.token),
    enabled: !!session?.token && !hideShortLet,
  });
  const initials = `${session?.user.firstName?.[0] ?? ""}${session?.user.lastName?.[0] ?? ""}`.toUpperCase();

  return (
    <div>
      <PageHeader title={t("more.title")} subtitle={investor ? t("more.subtitleInvestor") : t("more.subtitle")} />

      <Glass accent className="mb-4" padding={16}>
        <div className="flex gap-3">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#4F7CFF] to-[#3D63E0] font-bold text-white">
            {initials || "O"}
          </div>
          <div className="min-w-0">
            <div className="font-[family-name:var(--font-outfit)] text-lg font-semibold">
              {session?.user.firstName} {session?.user.lastName}
            </div>
            <div className="truncate text-sm text-[var(--text-secondary)]">{session?.user.email}</div>
            <div className="mt-2 flex flex-wrap gap-2">
              <span className="chip">{session?.membership.role.replace(/_/g, " ")}</span>
              <span className="chip">{session?.organization.name}</span>
            </div>
          </div>
        </div>
        <button type="button" className="mt-3 text-sm font-semibold text-[var(--mist)]" onClick={() => setShowWorkspaces((v) => !v)}>
          {t("workspaces.label")}
        </button>
        {showWorkspaces ? (
          <div className="mt-4">
            <WorkspaceSwitcher onSwitch={() => setShowWorkspaces(false)} />
          </div>
        ) : null}
      </Glass>

      <div className="mb-6 grid grid-cols-3 gap-3">
        <Quick icon={<MessageCircle size={20} />} from="#4F7CFF" to="#6B8AFF" label={t("more.askOcupai")} href="/chat" />
        <Quick icon={<Calendar size={20} />} from="#3DD68C" to="#2BA86A" label={supported ? t("supported.rooms") : t("tabs.calendar")} href={supported ? "/supported/rooms" : "/calendar"} />
        <Quick icon={<Link2 size={20} />} from="#FF5A5F" to="#E04E53" label={supported ? t("supported.referrals") : t("more.platforms")} href={supported ? "/supported/referrals" : "/channels"} />
      </div>

      <Glass className="mb-4" padding={0}>
        <MenuRow href="/portfolio" icon={<LayoutGrid size={19} />} tint="#6B8AFF" label={t("more.items.portfolio")} />
        <MenuRow href="/operations" icon={<Wrench size={19} />} tint="#F5A524" label={t("more.items.operations")} />
        {hideShortLet ? null : <MenuRow href="/analytics" icon={<Wallet size={19} />} tint="#3DD68C" label={t("more.sections.revenueOwners")} />}
        <MenuRow href="/chat" icon={<Sparkles size={19} />} tint="#4F7CFF" label={t("more.sections.ocupaiAi")} />
        <MenuRow href="/settings" icon={<Settings size={19} />} tint="#4F7CFF" label={t("more.items.settings")} last />
      </Glass>

      {supported ? (
        <Section title={t("more.sections.supported")}>
          <MenuRow href="/supported/rooms" icon={<Bed size={19} />} tint="#4F7CFF" label={t("more.items.supportedRooms")} />
          <MenuRow href="/supported/referrals" icon={<Users size={19} />} tint="#F5A524" label={t("more.items.supportedReferrals")} />
          <MenuRow href="/supported/placements" icon={<Users size={19} />} tint="#6B8AFF" label={t("more.items.supportedPlacements")} />
          <MenuRow href="/supported/finance" icon={<Receipt size={19} />} tint="#9B2848" label={t("more.items.supportedFinance")} last />
        </Section>
      ) : null}
      {flatshares ? (
        <Section title={t("more.sections.flatshares")}>
          <MenuRow href="/flatshares/rooms" icon={<Bed size={19} />} tint="#4F7CFF" label={t("more.items.flatshareRooms")} />
          <MenuRow href="/flatshares/tenancies" icon={<Clipboard size={19} />} tint="#6B8AFF" label={t("more.items.flatshareTenancies")} />
          <MenuRow href="/flatshares/enquiries" icon={<Mail size={19} />} tint="#F5A524" label={t("more.items.flatshareEnquiries")} last />
        </Section>
      ) : null}
      {maintenance || !hideShortLet ? (
        <Section title={t("more.sections.maintenance")}>
          <MenuRow href="/maintenance/issues" icon={<Wrench size={19} />} tint="#F5A524" label={t("more.items.maintenanceIssues")} />
          <MenuRow href="/maintenance/work-orders" icon={<Clipboard size={19} />} tint="#4F7CFF" label={t("more.items.maintenanceWorkOrders")} />
          <MenuRow href="/maintenance/contractors" icon={<Hammer size={19} />} tint="#9B2848" label={t("more.items.maintenanceContractors")} last />
        </Section>
      ) : null}

      {hideShortLet ? null : (
        <Section title={t("more.sections.ocupaiAi")}>
          <MenuRow href="/alerts" icon={<Bell size={19} />} tint="#4F7CFF" label={t("more.items.alertsUpdates")} />
          <MenuRow href="/decisions" icon={<Sparkles size={19} />} tint="#9B2848" label={`${t("more.items.decisionsNeeded")}${briefing.data?.summary.decisionsWaiting ? ` (${briefing.data.summary.decisionsWaiting})` : ""}`} last />
        </Section>
      )}

      <Button variant="danger" className="w-full" onClick={() => signOut()}>
        {t("more.signOut")}
      </Button>
      <button
        type="button"
        className="mt-4 w-full text-sm text-[var(--text-muted)]"
        onClick={() => {
          if (confirm(t("more.deleteAccountBody"))) void deleteAccount();
        }}
      >
        {t("more.deleteAccount")}
      </button>
    </div>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="mb-4">
      <div className="mb-2 px-1 text-[11px] font-medium uppercase tracking-[2.8px] text-[var(--text-muted)]">{title}</div>
      <Glass padding={0}>{children}</Glass>
    </div>
  );
}

function Quick({ icon, from, to, label, href }: { icon: ReactNode; from: string; to: string; label: string; href: string }) {
  return (
    <Link href={href} className="flex flex-col items-center gap-2">
      <span className="flex h-12 w-12 items-center justify-center rounded-2xl text-white" style={{ background: `linear-gradient(135deg, ${from}, ${to})` }}>
        {icon}
      </span>
      <span className="text-center text-xs text-[var(--text-secondary)]">{label}</span>
    </Link>
  );
}
