"use client";

import {
  AlertCircle,
  Bed,
  Bell,
  Building2,
  Calendar,
  ChevronDown,
  ChevronRight,
  Clipboard,
  Hammer,
  LayoutGrid,
  Link2,
  Mail,
  MessageCircle,
  Pencil,
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
import { mediaUrl } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { useTranslation } from "@/lib/i18n";
import { briefingQuery } from "@/lib/queries";
import { isInvestor } from "@/lib/roles";
import {
  isFlatsharesWorkspace,
  isMaintenanceWorkspace,
  isSupportedWorkspace,
} from "@/lib/workspace-mode";

function MenuRow({
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
    <Link href={href} className={`more-menu-row ${last ? "last" : ""}`}>
      <IconTile tint={tint}>{icon}</IconTile>
      <span className="more-menu-label">{label}</span>
      {badge && badge > 0 ? <span className="more-menu-badge">{badge}</span> : null}
      <ChevronRight size={16} className="text-[var(--text-muted)]" />
    </Link>
  );
}

function businessInitials(name: string) {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "B";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return `${words[0][0]}${words[1][0]}`.toUpperCase();
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
  const decisions = briefing.data?.summary.decisionsWaiting ?? 0;
  const negotiations = briefing.data?.summary.activeNegotiations ?? 0;
  const orgName = session?.organization.name ?? "";
  const avatarUrl = session?.user.avatarUrl;

  return (
    <div>
      <div className="more-title-row">
        <PageHeader title={t("more.title")} subtitle={investor ? t("more.subtitleInvestor") : t("more.subtitle")} />
        <button
          type="button"
          className="more-workspace-btn"
          onClick={() => setShowWorkspaces((value) => !value)}
          aria-expanded={showWorkspaces}
          aria-label={t("workspaces.label")}
        >
          <span className="more-workspace-badge">{businessInitials(orgName)}</span>
          <span className="more-workspace-caret">
            <ChevronDown size={12} />
          </span>
        </button>
      </div>

      {showWorkspaces ? (
        <Glass className="mb-4" padding={16}>
          <div className="mb-3 flex items-center justify-between gap-3">
            <div className="font-[family-name:var(--font-outfit)] text-base font-semibold">{t("workspaces.label")}</div>
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => setShowWorkspaces(false)}>
              Done
            </button>
          </div>
          <WorkspaceSwitcher onSwitch={() => setShowWorkspaces(false)} />
        </Glass>
      ) : null}

      <Link href="/profile/edit" className="more-profile mb-4 block">
        <Glass accent padding={16}>
          <div className="more-profile-top">
            {avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={mediaUrl(avatarUrl)} alt="" className="more-avatar-img" />
            ) : (
              <div className="more-avatar">{initials || "O"}</div>
            )}
            <div className="more-profile-info">
              <div className="more-name-row">
                <div className="more-name">
                  {session?.user.firstName} {session?.user.lastName}
                </div>
                <span className="more-edit-chip">
                  <Pencil size={11} />
                  {t("common.edit")}
                </span>
              </div>
              <div className="more-email">{session?.user.email}</div>
              <div className="more-chips">
                <span className="more-role-chip">{(session?.membership.role ?? "").replace(/_/g, " ")}</span>
                <span className="more-org-chip">
                  <Building2 size={11} />
                  <span>{orgName}</span>
                </span>
              </div>
            </div>
            <ChevronRight size={18} className="more-profile-chevron" />
          </div>
          {!hideShortLet && (decisions > 0 || negotiations > 0) ? (
            <div className="more-alerts">
              {decisions > 0 ? (
                <span
                  className="more-alert more-alert-danger"
                  onClick={(event) => {
                    event.preventDefault();
                    window.location.href = "/decisions";
                  }}
                >
                  <AlertCircle size={14} />
                  {decisions} decisions waiting
                </span>
              ) : null}
              {negotiations > 0 ? (
                <span
                  className="more-alert more-alert-warn"
                  onClick={(event) => {
                    event.preventDefault();
                    window.location.href = "/negotiations";
                  }}
                >
                  <Wallet size={14} />
                  {negotiations} negotiations
                </span>
              ) : null}
            </div>
          ) : null}
        </Glass>
      </Link>

      <div className="more-quick-row mb-6">
        <Quick
          icon={<MessageCircle size={20} />}
          from="#4F7CFF"
          to="#6B8AFF"
          label={investor ? t("more.manager") : t("more.askOcupai")}
          href={investor ? "/contact-manager" : "/chat"}
        />
        <Quick
          icon={<Calendar size={20} />}
          from="#3DD68C"
          to="#2BA86A"
          label={supported ? t("supported.rooms") : t("tabs.calendar")}
          href={supported ? "/supported/rooms" : "/calendar"}
        />
        <Quick
          icon={<Link2 size={20} />}
          from="#FF5A5F"
          to="#E04E53"
          label={supported ? t("supported.referrals") : t("more.platforms")}
          href={supported ? "/supported/referrals" : "/channels"}
        />
      </div>

      <Glass className="mb-4" padding={0}>
        <MenuRow href="/portfolio" icon={<LayoutGrid size={19} />} tint="#6B8AFF" label={t("more.items.portfolio")} />
        <MenuRow
          href="/operations"
          icon={<Wrench size={19} />}
          tint="#F5A524"
          label={t("more.items.operations")}
          badge={hideShortLet || investor ? undefined : decisions}
        />
        {hideShortLet ? null : (
          <MenuRow href="/revenue-owners" icon={<Wallet size={19} />} tint="#3DD68C" label={t("more.sections.revenueOwners")} />
        )}
        <MenuRow href="/ocupai-ai" icon={<Sparkles size={19} />} tint="#4F7CFF" label={t("more.sections.ocupaiAi")} />
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
          <MenuRow
            href="/decisions"
            icon={<Sparkles size={19} />}
            tint="#9B2848"
            label={t("more.items.decisionsNeeded")}
            badge={decisions}
            last
          />
        </Section>
      )}

      <div className="more-account-actions">
        <Button variant="danger-ghost" className="btn-block" onClick={() => signOut()}>
          {t("more.signOut")}
        </Button>
        <button
          type="button"
          className="more-delete-link"
          onClick={() => {
            if (confirm(t("more.deleteAccountBody"))) void deleteAccount();
          }}
        >
          {t("more.deleteAccount")}
        </button>
      </div>
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
    <Link href={href} className="more-quick">
      <span className="more-quick-icon" style={{ background: `linear-gradient(135deg, ${from}, ${to})` }}>
        {icon}
      </span>
      <span className="more-quick-label">{label}</span>
    </Link>
  );
}
