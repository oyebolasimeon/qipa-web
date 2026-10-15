"use client";

import { BarChart3, BookOpen, Briefcase, Wallet } from "lucide-react";
import { MenuHub } from "@/components/menu-hub";
import { useTranslation } from "@/lib/i18n";

export default function RevenueOwnersPage() {
  const { t } = useTranslation();
  return (
    <MenuHub
      title={t("more.sections.revenueOwners")}
      subtitle={t("more.items.revenueOwnersHint")}
      items={[
        { href: "/analytics", icon: <BarChart3 size={19} />, tint: "#6B8AFF", label: t("more.items.revenueAnalytics") },
        { href: "/pnl-journal", icon: <BookOpen size={19} />, tint: "#6B8AFF", label: t("more.items.pnlJournal") },
        { href: "/collections", icon: <Wallet size={19} />, tint: "#6B8AFF", label: t("more.items.collections") },
        { href: "/owners", icon: <Briefcase size={19} />, tint: "#6B8AFF", label: t("more.items.ownerPortal") },
      ]}
    />
  );
}
