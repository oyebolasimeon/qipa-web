"use client";

import { Bell, FileText, Sparkles, Timer, Zap } from "lucide-react";
import { MenuHub } from "@/components/menu-hub";
import { useAuth } from "@/lib/auth";
import { useTranslation } from "@/lib/i18n";
import { canViewAiActivity, isInvestor } from "@/lib/roles";
import { isSupportedWorkspace } from "@/lib/workspace-mode";

export default function OcupaiAiPage() {
  const { t } = useTranslation();
  const { session } = useAuth();
  const hideStr = isSupportedWorkspace(session?.organization.kind);
  const investor = isInvestor(session?.membership.role);
  const items = [
    { href: "/alerts", icon: <Bell size={19} />, tint: "#A5C9FF", label: t("more.items.alertsUpdates") },
    { href: "/chat", icon: <Sparkles size={19} />, tint: "#4F7CFF", label: t("more.items.askOcupai") },
    ...(!hideStr && !investor
      ? [
          { href: "/autopilot", icon: <Zap size={19} />, tint: "#9B2848", label: t("more.items.autopilotSettings") },
          { href: "/pending-drafts", icon: <FileText size={19} />, tint: "#6B8AFF", label: t("more.items.pendingAiDrafts") },
        ]
      : []),
    ...(canViewAiActivity(session?.membership.role)
      ? [{ href: "/ai-activity", icon: <Timer size={19} />, tint: "#3DD68C", label: t("more.items.aiActivity") }]
      : []),
  ];
  return <MenuHub title={t("more.sections.ocupaiAi")} subtitle={t("more.items.ocupaiAiHint")} items={items} />;
}
