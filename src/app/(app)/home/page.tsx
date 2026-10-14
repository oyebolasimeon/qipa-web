"use client";

import { useQuery } from "@tanstack/react-query";
import {
  AlertCircle,
  ArrowRight,
  Bed,
  Building2,
  Calendar,
  CheckCircle2,
  Flag,
  GitBranch,
  Plane,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { useAuth } from "@/lib/auth";
import { formatCurrency, formatDate } from "@/lib/format";
import { useTranslation } from "@/lib/i18n";
import { briefingQuery } from "@/lib/queries";
import { isInvestor } from "@/lib/roles";
import {
  isFlatsharesWorkspace,
  isMaintenanceWorkspace,
  isSupportedWorkspace,
} from "@/lib/workspace-mode";
import { Glass, IconTile, PageHeader, ProgressBar } from "@/components/ui";
import { apiRequest } from "@/lib/api";
import { bookingSourceColor } from "@/lib/booking-source";

export default function HomePage() {
  const { session } = useAuth();
  const kind = session?.organization.kind;
  if (isSupportedWorkspace(kind)) return <SupportedHome />;
  if (isFlatsharesWorkspace(kind)) return <FlatsharesHome />;
  if (isMaintenanceWorkspace(kind)) return <MaintenanceHome />;
  return <HospitalityHome />;
}

function HospitalityHome() {
  const { session } = useAuth();
  const { t } = useTranslation();
  const { data, isPending, error } = useQuery(briefingQuery(session?.organization.id, session?.token));
  const investor = isInvestor(session?.membership.role);
  const initials = `${session?.user.firstName?.[0] ?? ""}${session?.user.lastName?.[0] ?? ""}`.toUpperCase();

  return (
    <div>
      <div className="mb-3 flex items-center justify-between gap-3">
        <Link href="/settings" className="flex min-w-0 items-center gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#4F7CFF] to-[#3D63E0] font-bold text-white">
            {initials || "O"}
          </div>
          <div className="min-w-0">
            <h1 className="font-[family-name:var(--font-outfit)] text-[22px] font-bold tracking-[-0.5px]">
              {t("home.hello", { name: session?.user.firstName ?? "" })}
            </h1>
            <p className="truncate text-sm text-[var(--text-secondary)]">{session?.organization.name}</p>
          </div>
        </Link>
        <Link href="/alerts" className="relative hidden h-10 w-10 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface)] lg:flex">
          <Sparkles size={18} className="text-[var(--text)]" />
          {(data?.summary.decisionsWaiting ?? 0) > 0 ? (
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-[var(--accent)]" />
          ) : null}
        </Link>
      </div>

      <div className="mb-4 flex items-center justify-between rounded-xl bg-[var(--primary-muted)] px-4 py-2.5 text-sm">
        <span>{investor ? t("home.ownerBanner") : t("home.trialEnds")}</span>
        <span className="font-semibold text-[var(--primary)]">{investor ? t("home.messageManager") : t("home.learnMore")}</span>
      </div>

      <Link href="/chat" className="mb-6 block">
        <div className="rounded-2xl p-px" style={{ background: "linear-gradient(135deg, rgba(79,124,255,0.25), rgba(79,124,255,0.06))" }}>
          <div className="flex items-center gap-3 rounded-[15px] px-4 py-3.5" style={{ background: "var(--card-fill)" }}>
            <span className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-[var(--primary-muted)] text-[var(--primary)]">
              <Sparkles size={16} />
            </span>
            <span className="flex-1 text-[15px] text-[var(--text-muted)]">{t("home.askPlaceholder")}</span>
            <ArrowRight size={18} className="text-[var(--text-muted)]" />
          </div>
        </div>
      </Link>

      {isPending ? <p className="py-10 text-center text-[var(--text-muted)]">{t("common.loading")}</p> : null}
      {error && !data ? <p className="text-center text-[var(--accent)]">{error.message}</p> : null}

      {data ? (
        <>
          <div className="mb-4 grid grid-cols-2 gap-2">
            <Glass>
              <Calendar size={18} className="text-[var(--primary)]" />
              <div className="mt-1 font-[family-name:var(--font-outfit)] text-[28px] font-bold">{data.summary.occupiedCount}</div>
              <div className="text-[13px] text-[var(--text-secondary)]">{t("home.propertiesOccupied")}</div>
            </Glass>
            <Glass>
              <Flag size={18} className="text-[var(--danger)]" />
              <div className="mt-1 font-[family-name:var(--font-outfit)] text-[28px] font-bold">{data.summary.maintenanceIssues}</div>
              <div className="text-[13px] text-[var(--text-secondary)]">{t("home.unfinishedTasks")}</div>
            </Glass>
          </div>

          <Glass className="mb-4">
            <Section title={t("home.upcomingActivity")} subtitle={t("home.next30Days")} />
            {data.kpis.bookings === 0 ? (
              <SampleStays />
            ) : (
              <p className="py-2 text-[15px] text-[var(--text-secondary)]">
                {data.kpis.bookings === 1 ? t("home.bookingsNext30One") : t("home.bookingsNext30", { count: data.kpis.bookings })}
              </p>
            )}
          </Glass>

          <Glass accent className="mb-4">
            <Section title={t("home.executiveBriefing")} subtitle={t("home.todaysSnapshot")} />
            <div className="space-y-2">
              <StatPill icon={<Building2 size={16} />} tint="#4F7CFF" label={t("home.portfolio")} value={t("home.portfolioValue", { properties: data.summary.propertyCount, occupied: data.summary.occupiedCount })} />
              <StatPill icon={<Plane size={16} />} tint="#6B8AFF" label={t("home.movement")} value={t("home.inOut", { arrivals: data.summary.arrivalsToday, departures: data.summary.departuresToday })} />
              <StatPill icon={<Sparkles size={16} />} tint="#3DD68C" label={t("home.operations")} value={t("home.cleansIssues", { cleans: data.summary.cleansScheduled, issues: data.summary.maintenanceIssues })} />
            </div>
            {data.summary.decisionsWaiting > 0 ? (
              <Link href="/decisions" className="mt-4 flex items-center gap-2 rounded-xl p-2 text-sm text-[var(--accent)]">
                <AlertCircle size={16} />
                {t("home.decisionsWaiting", { count: data.summary.decisionsWaiting })}
              </Link>
            ) : (
              <div className="mt-4 flex items-center gap-2 text-sm text-[var(--success)]">
                <CheckCircle2 size={16} />
                {t("home.allClear")}
              </div>
            )}
          </Glass>

          <div className="mb-4 grid grid-cols-2 gap-2">
            <KpiTile label={t("home.revenue")} value={formatCurrency(data.kpis.revenueThisMonth)} icon={<Sparkles size={16} />} from="rgba(79,124,255,0.22)" />
            <KpiTile label={t("home.occupancy")} value={`${data.kpis.occupancy}%`} icon={<Bed size={16} />} from="rgba(107,138,255,0.18)" />
            <KpiTile label={t("home.adr")} value={formatCurrency(data.kpis.adr)} icon={<TrendingUp size={16} />} from="rgba(61,214,140,0.16)" />
            <KpiTile label={t("home.revpar")} value={formatCurrency(data.kpis.revpar)} icon={<TrendingUp size={16} />} from="rgba(155,40,72,0.16)" />
          </div>

          <Glass className="mb-4">
            <Section
              title={t("home.decisionsNeeded")}
              subtitle={data.decisions.length ? t("home.requiresJudgment") : t("home.allClearForNow")}
              action={data.decisions.length ? <Link href="/decisions" className="text-sm text-[var(--primary)]">{t("home.viewAll")}</Link> : undefined}
            />
            {data.decisions.length === 0 ? (
              <div className="py-6 text-center">
                <p className="font-semibold">{t("home.inControl")}</p>
                <p className="mt-2 text-sm text-[var(--text-secondary)]">{t("home.decisionsEmpty")}</p>
              </div>
            ) : (
              data.decisions.slice(0, 2).map((item) => (
                <Link key={item.id} href="/decisions" className="flex gap-3 py-3">
                  <IconTile tint="#9B2848"><GitBranch size={16} /></IconTile>
                  <div>
                    <div className="font-semibold">{item.title}</div>
                    <div className="mt-1 text-sm text-[var(--text-secondary)]">{item.summary}</div>
                  </div>
                </Link>
              ))
            )}
          </Glass>

          <Glass className="mb-4">
            <Section title={t("home.needsAttention")} />
            {data.needsAttention.length === 0 ? (
              <p className="py-2 text-sm text-[var(--text-secondary)]">{t("home.nothingFlagged")}</p>
            ) : (
              data.needsAttention.map((item) => (
                <div key={item.id} className="flex gap-3 py-3">
                  <span className={`mt-1.5 h-2 w-2 rounded-full ${item.severity === "critical" ? "bg-[var(--danger)]" : item.severity === "warning" ? "bg-[var(--warning)]" : "bg-[var(--primary)]"}`} />
                  <div>
                    <div className="text-[13px] font-semibold">{item.propertyName}</div>
                    <div className="text-sm text-[var(--text-secondary)]">{item.message}</div>
                  </div>
                </div>
              ))
            )}
          </Glass>

          <Glass>
            <Section title={t("home.autonomy")} subtitle={t("home.interventionsThisWeek", { count: data.autonomy?.ownerInterventionsThisWeek ?? 0 })} />
            <div className="flex items-baseline gap-2">
              <span className="font-[family-name:var(--font-outfit)] text-4xl font-bold">{data.autonomy?.autonomyRate ?? 0}%</span>
              <span className="text-sm text-[var(--text-secondary)]">{t("home.handledAutonomously")}</span>
            </div>
            <ProgressBar progress={data.autonomy?.autonomyRate ?? 0} />
            {(data.qipaActivity ?? []).slice(0, 3).map((item) => (
              <div key={item.id} className="mt-3 flex gap-3">
                <span className="mt-2 h-1.5 w-1.5 rounded-full bg-[var(--primary)]" />
                <div>
                  <div className="text-sm font-semibold">{item.title}</div>
                  <div className="text-sm text-[var(--text-secondary)]">{item.description}</div>
                </div>
              </div>
            ))}
          </Glass>
        </>
      ) : null}
    </div>
  );
}

function Section({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <div className="mb-3 flex items-end justify-between gap-3">
      <div>
        <div className="font-[family-name:var(--font-outfit)] text-lg font-semibold">{title}</div>
        {subtitle ? <div className="text-xs text-[var(--text-muted)]">{subtitle}</div> : null}
      </div>
      {action}
    </div>
  );
}

function StatPill({ icon, label, value, tint }: { icon: React.ReactNode; label: string; value: string; tint: string }) {
  return (
    <div className="flex items-center gap-3 rounded-xl bg-white/[0.03] p-2">
      <IconTile tint={tint}>{icon}</IconTile>
      <div>
        <div className="text-[11px] font-semibold uppercase tracking-[0.4px] text-[var(--text-muted)]">{label}</div>
        <div className="text-sm font-semibold">{value}</div>
      </div>
    </div>
  );
}

function KpiTile({ label, value, icon, from }: { label: string; value: string; icon: React.ReactNode; from: string }) {
  return (
    <div className="rounded-2xl p-px" style={{ background: `linear-gradient(135deg, ${from}, transparent)` }}>
      <div className="rounded-[15px] p-4" style={{ background: "var(--glass-inner)" }}>
        <div className="mb-2 text-[var(--primary)]">{icon}</div>
        <div className="text-[11px] font-semibold uppercase tracking-[0.4px] text-[var(--text-muted)]">{label}</div>
        <div className="mt-1 font-[family-name:var(--font-outfit)] text-2xl font-bold">{value}</div>
      </div>
    </div>
  );
}

const SAMPLE = [
  { guest: "Amira Khan", property: "Last Tottenham", channel: "Airbnb", source: "AIRBNB", inDays: 3, nights: 3, totalAmount: 612 },
  { guest: "James Wright", property: "Shoreditch loft", channel: "Booking.com", source: "BOOKING_COM", inDays: 9, nights: 4, totalAmount: 880 },
];

function SampleStays() {
  const { t } = useTranslation();
  return (
    <div>
      <p className="text-[15px] text-[var(--text-secondary)]">{t("home.bookingsNext30", { count: SAMPLE.length })}</p>
      <p className="mb-3 mt-1 text-xs text-[var(--text-muted)]">{t("home.sampleLayout")}</p>
      <div className="flex gap-3 overflow-x-auto pb-2">
        {SAMPLE.map((stay) => (
          <div key={stay.guest} className="flex min-w-[240px] overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface-elevated)]">
            <div className="w-1.5" style={{ background: bookingSourceColor(stay.source) }} />
            <div className="flex-1 p-3">
              <div className="flex items-center justify-between gap-2">
                <span className="font-semibold">{stay.guest}</span>
                <span className="rounded-full px-2 py-0.5 text-[11px] font-bold" style={{ color: bookingSourceColor(stay.source), background: `${bookingSourceColor(stay.source)}22` }}>
                  {stay.channel}
                </span>
              </div>
              <div className="text-[13px] text-[var(--text-secondary)]">{stay.property}</div>
              <div className="text-xs text-[var(--text-muted)]">{formatDate(new Date(Date.now() + stay.inDays * 86400000).toISOString())}</div>
              <div className="mt-2 flex justify-between text-sm">
                <span className="text-[var(--text-secondary)]">{stay.nights} nights</span>
                <span className="font-bold">{formatCurrency(stay.totalAmount)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function FlatsharesHome() {
  const { session } = useAuth();
  const { t } = useTranslation();
  const overview = useQuery({
    queryKey: ["flatshares-overview", session?.organization.id],
    queryFn: () =>
      apiRequest<{ rooms: { occupancy: number; available: number; occupied: number }; openEnquiries: number; arrears: number }>(
        "/api/flatshares/analytics/overview",
        { token: session?.token },
      ),
    enabled: !!session?.token,
  });
  const data = overview.data;
  return (
    <div>
      <PageHeader title={t("flatshares.home")} subtitle={t("flatshares.overviewSubtitle")} />
      <div className="mb-4 grid grid-cols-2 gap-2">
        <Glass><div className="text-[11px] uppercase tracking-wide text-[var(--text-muted)]">{t("flatshares.occupancy")}</div><div className="text-2xl font-bold">{Math.round((data?.rooms.occupancy ?? 0) * 100)}%</div></Glass>
        <Glass><div className="text-[11px] uppercase tracking-wide text-[var(--text-muted)]">{t("flatshares.available")}</div><div className="text-2xl font-bold">{data?.rooms.available ?? 0}</div></Glass>
        <Glass><div className="text-[11px] uppercase tracking-wide text-[var(--text-muted)]">{t("flatshares.occupied")}</div><div className="text-2xl font-bold">{data?.rooms.occupied ?? 0}</div></Glass>
        <Glass><div className="text-[11px] uppercase tracking-wide text-[var(--text-muted)]">{t("flatshares.arrears")}</div><div className="text-2xl font-bold">{formatCurrency(data?.arrears ?? 0)}</div></Glass>
      </div>
      <div className="space-y-2">
        <Link href="/flatshares/rooms"><Glass>{t("flatshares.rooms")}</Glass></Link>
        <Link href="/flatshares/tenancies"><Glass>{t("flatshares.tenancies")}</Glass></Link>
        <Link href="/flatshares/enquiries"><Glass>{t("flatshares.enquiries")} · {data?.openEnquiries ?? 0}</Glass></Link>
      </div>
    </div>
  );
}

function MaintenanceHome() {
  const { session } = useAuth();
  const { t } = useTranslation();
  const overview = useQuery({
    queryKey: ["maintenance-overview", session?.organization.id],
    queryFn: () => apiRequest<{ openIssues: number; emergency: number; activeWorkOrders: number; pendingApprovals: number }>("/api/maintenance/analytics", { token: session?.token }),
    enabled: !!session?.token,
  });
  const data = overview.data;
  return (
    <div>
      <PageHeader title={t("maintenance.home")} subtitle={t("maintenance.overviewSubtitle")} />
      <div className="mb-4 grid grid-cols-2 gap-2">
        <Glass><div className="text-[11px] uppercase tracking-wide text-[var(--text-muted)]">{t("maintenance.open")}</div><div className="text-2xl font-bold">{data?.openIssues ?? 0}</div></Glass>
        <Glass><div className="text-[11px] uppercase tracking-wide text-[var(--text-muted)]">{t("maintenance.emergency")}</div><div className="text-2xl font-bold">{data?.emergency ?? 0}</div></Glass>
        <Glass><div className="text-[11px] uppercase tracking-wide text-[var(--text-muted)]">{t("maintenance.workOrders")}</div><div className="text-2xl font-bold">{data?.activeWorkOrders ?? 0}</div></Glass>
        <Glass><div className="text-[11px] uppercase tracking-wide text-[var(--text-muted)]">{t("maintenance.approvals")}</div><div className="text-2xl font-bold">{data?.pendingApprovals ?? 0}</div></Glass>
      </div>
      <div className="space-y-2">
        <Link href="/maintenance/issues"><Glass>{t("maintenance.issues")}</Glass></Link>
        <Link href="/maintenance/work-orders"><Glass>{t("maintenance.workOrders")}</Glass></Link>
        <Link href="/maintenance/contractors"><Glass>{t("maintenance.contractors")}</Glass></Link>
      </div>
    </div>
  );
}

function SupportedHome() {
  const { session } = useAuth();
  const { t } = useTranslation();
  const overview = useQuery({
    queryKey: ["supported-overview", session?.organization.id],
    queryFn: () =>
      apiRequest<{
        rooms: { rooms: number; occupied: number; available: number };
        referrals: { active: number };
        revenue: { collected: number; outstanding: number };
      }>("/api/supported/overview", { token: session?.token }),
    enabled: !!session?.token,
  });
  const data = overview.data;
  return (
    <div>
      <PageHeader title={t("supported.dashboard")} subtitle={t("supported.dashboardSubtitle")} />
      <div className="mb-4 grid grid-cols-2 gap-2">
        <Glass>{t("supported.briefingRoomsValue", { occupied: data?.rooms.occupied ?? 0, available: data?.rooms.available ?? 0, total: data?.rooms.rooms ?? 0 })}</Glass>
        <Glass>{t("supported.briefingReferralsValue", { count: data?.referrals.active ?? 0 })}</Glass>
      </div>
      <div className="space-y-2">
        <Link href="/supported/rooms"><Glass>{t("supported.rooms")}</Glass></Link>
        <Link href="/supported/referrals"><Glass>{t("supported.referrals")}</Glass></Link>
        <Link href="/supported/placements"><Glass>{t("supported.placements")}</Glass></Link>
        <Link href="/supported/finance"><Glass>{t("supported.finance")}</Glass></Link>
      </div>
    </div>
  );
}
