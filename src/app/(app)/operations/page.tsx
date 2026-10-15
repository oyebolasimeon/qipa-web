"use client";

import { useQuery } from "@tanstack/react-query";
import { BookOpen, CheckSquare, GitBranch, Link2, Users, Wallet, Wrench } from "lucide-react";
import { MenuHub } from "@/components/menu-hub";
import { useAuth } from "@/lib/auth";
import { useTranslation } from "@/lib/i18n";
import { briefingQuery } from "@/lib/queries";
import { isInvestor } from "@/lib/roles";
import { isSupportedWorkspace } from "@/lib/workspace-mode";

export default function OperationsPage() {
  const { t } = useTranslation();
  const { session } = useAuth();
  const hideStr = isSupportedWorkspace(session?.organization.kind);
  const investor = isInvestor(session?.membership.role);
  const briefing = useQuery({
    ...briefingQuery(session?.organization.id, session?.token),
    enabled: !!session?.token && !hideStr,
  });
  const items = [
    { href: "/tasks", icon: <Wrench size={19} />, tint: "#F5A524", label: t("more.items.tasks") },
    { href: "/team", icon: <Users size={19} />, tint: "#6B8AFF", label: t("more.items.team") },
    ...(!hideStr && !investor
      ? [
          {
            href: "/decisions",
            icon: <CheckSquare size={19} />,
            tint: "#9B2848",
            label: t("more.items.decisionsNeeded"),
            badge: briefing.data?.summary.decisionsWaiting,
          },
        ]
      : []),
    ...(!hideStr
      ? [
          {
            href: "/negotiations",
            icon: <Wallet size={19} />,
            tint: "#F5A524",
            label: t("more.items.negotiations"),
            badge: briefing.data?.summary.activeNegotiations,
          },
          { href: "/automations", icon: <GitBranch size={19} />, tint: "#4F7CFF", label: t("more.items.automations") },
          { href: "/knowledge", icon: <BookOpen size={19} />, tint: "#475569", label: t("more.items.propertyKnowledge") },
          { href: "/channels", icon: <Link2 size={19} />, tint: "#FF5A5F", label: t("more.items.bookingPlatforms") },
        ]
      : []),
  ];
  return <MenuHub title={t("more.items.operations")} subtitle={t("more.items.operationsHint")} items={items} />;
}
