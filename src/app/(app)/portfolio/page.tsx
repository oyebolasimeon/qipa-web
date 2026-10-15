"use client";

import { CloudUpload, Home, Users } from "lucide-react";
import { MenuHub } from "@/components/menu-hub";
import { useAuth } from "@/lib/auth";
import { useTranslation } from "@/lib/i18n";
import { isInvestor } from "@/lib/roles";
import { isSupportedWorkspace } from "@/lib/workspace-mode";

export default function PortfolioPage() {
  const { t } = useTranslation();
  const { session } = useAuth();
  const hideStr = isSupportedWorkspace(session?.organization.kind);
  const investor = isInvestor(session?.membership.role);
  const items = [
    { href: "/properties", icon: <Home size={19} />, tint: "#6B8AFF", label: t("more.items.properties") },
    ...(!hideStr && !investor
      ? [{ href: "/migration", icon: <CloudUpload size={19} />, tint: "#4F7CFF", label: t("more.items.migrationStation") }]
      : []),
    ...(!hideStr ? [{ href: "/guests", icon: <Users size={19} />, tint: "#4F7CFF", label: t("more.items.guests") }] : []),
  ];
  return <MenuHub title={t("more.items.portfolio")} subtitle={t("more.items.portfolioHint")} items={items} />;
}
