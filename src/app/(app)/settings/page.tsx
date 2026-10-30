"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ChevronRight, CreditCard, Link2, Tags, UserRound } from "lucide-react";
import Link from "next/link";
import { Glass, PageHeader } from "@/components/ui";
import { apiRequest } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import type { BookingApprovalSettings } from "@/lib/booking-approval";
import { useTheme, type ThemeMode } from "@/lib/theme";
import { useTranslation } from "@/lib/i18n";

const MODES: ThemeMode[] = ["dark", "light", "system"];
const LANGUAGES = [
  { id: "en", label: "English" },
  { id: "fr", label: "Français" },
  { id: "es", label: "Español" },
  { id: "de", label: "Deutsch" },
  { id: "pt", label: "Português" },
];
const CURRENCIES = ["GBP", "EUR", "USD", "AED", "AUD"];

const LINKS = [
  { href: "/profile/edit", icon: <UserRound size={18} />, tint: "#4F7CFF", label: "Edit profile" },
  { href: "/payments", icon: <CreditCard size={18} />, tint: "#6B8AFF", label: "Payments" },
  { href: "/pricing", icon: <Tags size={18} />, tint: "#3DD68C", label: "Pricing rules" },
  { href: "/onboarding", icon: <Link2 size={18} />, tint: "#FF5A5F", label: "Connect platforms" },
];

export default function SettingsPage() {
  const { t } = useTranslation();
  const { session } = useAuth();
  const queryClient = useQueryClient();
  const { mode, setMode } = useTheme();
  const language = session?.user.preferredLanguage ?? "en";
  const currency = session?.organization.defaultCurrency ?? "GBP";
  const approvalQuery = useQuery({
    queryKey: ["booking-approval", session?.organization.id],
    queryFn: () => apiRequest<BookingApprovalSettings>("/api/booking-approval", { token: session?.token }),
    enabled: Boolean(session?.token),
  });
  const approvalMutation = useMutation({
    mutationFn: (enabled: boolean) =>
      apiRequest<BookingApprovalSettings>("/api/booking-approval", {
        method: "PATCH",
        token: session?.token,
        body: { enabled },
      }),
    onSuccess: (data) => {
      queryClient.setQueryData(["booking-approval", session?.organization.id], data);
    },
  });
  const approvalEnabled = approvalQuery.data?.account.enabled !== false;

  return (
    <div>
      <PageHeader title={t("more.items.settings")} subtitle={t("more.items.settingsHint")} />

      <Glass className="mb-4">
        <div className="mb-3 text-[11px] font-medium uppercase tracking-[2.8px] text-[var(--text-muted)]">
          {t("screens.bookingApprovalMode")}
        </div>
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div className="text-[15px] font-medium">{t("screens.bookingApprovalModeHint")}</div>
            <div className="mt-1 text-[13px] text-[var(--text-muted)]">
              {t("screens.bookingApprovalModeBoundary")}
            </div>
          </div>
          <button
            type="button"
            className={`filter-chip ${approvalEnabled ? "on" : ""}`}
            disabled={approvalMutation.isPending || approvalQuery.isPending}
            onClick={() => approvalMutation.mutate(!approvalEnabled)}
          >
            {approvalEnabled ? t("common.on") : t("common.off")}
          </button>
        </div>
      </Glass>

      <Glass className="mb-4">
        <div className="mb-3 text-[11px] font-medium uppercase tracking-[2.8px] text-[var(--text-muted)]">{t("appearance.label")}</div>
        <div className="filter-row mb-0">
          {MODES.map((item) => (
            <button key={item} type="button" onClick={() => setMode(item)} className={`filter-chip ${mode === item ? "on" : ""}`}>
              {t(`appearance.${item}`)}
            </button>
          ))}
        </div>
      </Glass>

      <Glass className="mb-4">
        <div className="mb-3 text-[11px] font-medium uppercase tracking-[2.8px] text-[var(--text-muted)]">{t("language.label")}</div>
        <div className="filter-row mb-0">
          {LANGUAGES.map((item) => (
            <span key={item.id} className={`filter-chip ${language.startsWith(item.id) ? "on" : ""}`}>
              {item.label}
            </span>
          ))}
        </div>
      </Glass>

      <Glass className="mb-4">
        <div className="mb-3 text-[11px] font-medium uppercase tracking-[2.8px] text-[var(--text-muted)]">{t("currency.label")}</div>
        <div className="filter-row mb-0">
          {CURRENCIES.map((item) => (
            <span key={item} className={`filter-chip ${currency === item ? "on" : ""}`}>
              {item}
            </span>
          ))}
        </div>
      </Glass>

      <Glass padding={0}>
        {LINKS.map((item, index) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 px-4 py-3.5 ${index < LINKS.length - 1 ? "border-b border-[var(--border)]" : ""}`}
          >
            <span
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px]"
              style={{ background: `${item.tint}22`, color: item.tint }}
            >
              {item.icon}
            </span>
            <span className="flex-1 text-[15px] font-medium">{item.label}</span>
            <ChevronRight size={16} className="text-[var(--text-muted)]" />
          </Link>
        ))}
      </Glass>
    </div>
  );
}
