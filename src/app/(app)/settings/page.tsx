"use client";

import { PageHeader } from "@/components/ui";
import { useAuth } from "@/lib/auth";
import { useTheme, type ThemeMode } from "@/lib/theme";
import { useTranslation } from "@/lib/i18n";

const MODES: ThemeMode[] = ["dark", "light", "system"];

export default function SettingsPage() {
  const { t } = useTranslation();
  const { session } = useAuth();
  const { mode, setMode } = useTheme();

  return (
    <div>
      <PageHeader title={t("more.items.settings")} subtitle={session?.organization.name} />
      <div className="glass rounded-2xl p-4">
        <div className="mb-3 text-[11px] uppercase tracking-[0.2em] text-[var(--text-muted)]">{t("appearance.label")}</div>
        <div className="flex flex-wrap gap-2">
          {MODES.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setMode(item)}
              className={`rounded-full px-4 py-2 text-sm ${mode === item ? "bg-[var(--primary-muted)] text-[var(--mist)]" : "border border-[var(--border)]"}`}
            >
              {t(`appearance.${item}`)}
            </button>
          ))}
        </div>
      </div>
      <div className="glass mt-4 rounded-2xl p-4 text-sm text-[var(--text-secondary)]">
        Signed in as {session?.user.email}. Data is loaded from the same API as the mobile app.
      </div>
    </div>
  );
}
